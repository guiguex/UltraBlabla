/**
 * ONNX inference module for Durable Objects.
 *
 * Follows the CosteGieF pattern: the WASM module is precompiled at deploy
 * time via the CompiledWasm rule + build.mjs's `instantiateWasm` injection.
 *
 * The ONNX model is NOT bundled — it's fetched at runtime from the frontend
 * (ultrablabla.guig.dev) so there's a single source of truth for the model.
 */

let ortModule: any = null;

async function loadOrt() {
  if (ortModule) return ortModule;
  const mod = await import("onnxruntime-web");
  ortModule = (mod as any).default || mod;
  return ortModule;
}

const SAMPLE_RATE = 16000;

// Injected at build time by build.mjs preamble:
//   import __ORT_WASM__ from "./ort-wasm-simd-threaded.asyncify.wasm";
//   globalThis.__ORT_WASM__ = __ORT_WASM__;
declare const __ORT_WASM__: WebAssembly.Module;

// Model URL is passed at runtime via createInferenceSession(modelUrl).
// Default to the frontend serving the same model.
const DEFAULT_MODEL_URL = "https://vad.guig.dev/silero_vad_v5.onnx";

export interface InferenceResult {
  probability: number;
  state: Float32Array;
  inferenceMs: number;
}

export interface InferenceSession {
  run(audio: Float32Array, state: Float32Array): Promise<InferenceResult>;
  backend: string;
}

export async function createInferenceSession(modelUrl: string = DEFAULT_MODEL_URL): Promise<InferenceSession> {
  const ort = await loadOrt();

  // wasmPaths is intentionally not set: the instantiateWasm callback injected
  // by build.mjs uses the precompiled __ORT_WASM__ module directly. Setting
  // wasmPaths would cause ORT to attempt a runtime fetch that fails in workerd.
  let backend = "wasm";
  if (typeof navigator !== "undefined" && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) backend = "webgpu";
    } catch {}
  }
  //  Fetch model from the frontend (single source of truth).
  const modelResponse = await fetch(modelUrl);
  if (!modelResponse.ok) {
    throw new Error(`Failed to fetch model from ${modelUrl}: ${modelResponse.status}`);
  }
  const modelBytes = await modelResponse.arrayBuffer();

  // build.mjs has injected `instantiateWasm` on the Emscripten config,
  //    so ORT uses the precompiled WebAssembly.Module instead of calling
  //    the blocked `WebAssembly.compile()`.
  const session: any = await ort.InferenceSession.create(modelBytes, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });

  console.log(`ONNX session: backend=wasm, inputs=[${session.inputNames.join(", ")}], outputs=[${session.outputNames.join(", ")}]`);

  return {
    backend: "wasm",
    run: async (audio: Float32Array, state: Float32Array): Promise<InferenceResult> => {
      const inputTensor = new ort.Tensor("float32", audio, [1, audio.length]);
      const stateTensor = new ort.Tensor("float32", state, [2, 1, 128]);
      const srTensor = new ort.Tensor(
        "int64",
        BigInt64Array.from([BigInt(SAMPLE_RATE)]),
        [],
      );

      const feeds: Record<string, any> = {};
      feeds[session.inputNames[0]] = inputTensor;
      feeds[session.inputNames[1] || "state"] = stateTensor;
      feeds[session.inputNames[2] || "sr"] = srTensor;

      const t0 = Date.now();
      const outputs = await session.run(feeds);
      const inferenceMs = Date.now() - t0;

      const probability = outputs[session.outputNames[0]].data[0];
      const newState = new Float32Array(outputs[session.outputNames[1] || "stateN"].data);

      return { probability, state: newState, inferenceMs };
    },
  };
}