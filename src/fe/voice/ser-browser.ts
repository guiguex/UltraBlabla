// src/fe/voice/ser-browser.ts — client-side Speech Emotion Recognition.
// WebGPU primary (RTX 30xx via DX12, Apple M-series via Metal, mobile via Vulkan),
// WASM-SIMD-threaded fallback for browsers without WebGPU.
// Loaded on-demand via dynamic import so the initial bundle stays small.

const LABELS = ["Pleased", "Relaxed", "Neutral", "Sad", "Tension"] as const;
export type EmotionLabel = (typeof LABELS)[number];

const HINTS: Record<EmotionLabel, string> = {
  Pleased: "Ton : chaleureux. Joie. Conversationnel.",
  Relaxed: "Ton : posé. Calme. Détendu.",
  Neutral: "Ton : neutre. Informatif. Neutre.",
  Sad:     "Ton : doux. Tristesse. Empreint.",
  Tension: "Ton : serré. Tension. Inquiet.",
};

const MODEL_URL = "/models/ser/model_fp16.onnx";   // served by Bun with HTTP range + immutable cache
const MIN_SAMPLES = 800;        // 50 ms @16 kHz — conv front-end undefined below
const MAX_SAMPLES = 480_000;    // 30 s @16 kHz — positional embeddings cap

export interface EmotionResult { label: EmotionLabel; hint: string; score: number; backend: string; latency_ms: number; }

class SerBrowser {
  private session: any = null;
  private ort: any = null;
  private activeBackend: string | null = null;
  private loadMs: number | null = null;

  async preload(): Promise<void> {
    if (this.session) return;
    if (!this.ort) {
      this.ort = await import("onnxruntime-web");
      this.ort.env.wasm.wasmPaths = "/onnxruntime-web/";
      this.ort.env.wasm.simd = true;
      this.ort.env.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency ?? 2);
    }
    const t0 = performance.now();
    const providers: any[] = [];
    if ("gpu" in navigator) providers.push("webgpu", "wasm");
    else                    providers.push("wasm");
    try {
      this.session = await this.ort.InferenceSession.create(MODEL_URL, {
        executionProviders: providers, graphOptimizationLevel: "all",
      });
      this.activeBackend = providers.includes("webgpu") && this.session?.executionProviders?.[0] === "webgpu"
        ? "webgpu" : "wasm";
    } catch {
      this.session = await this.ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ["wasm"], graphOptimizationLevel: "all",
      });
      this.activeBackend = "wasm";
    }
    this.loadMs = performance.now() - t0;
    console.info(`[ser-browser] loaded in ${this.loadMs.toFixed(0)} ms via ${this.activeBackend}`);
  }

  async classify(pcmF32: Float32Array): Promise<EmotionResult | null> {
    await this.preload();
    if (!this.session || pcmF32.length < MIN_SAMPLES) return null;
    const audio = pcmF32.length > MAX_SAMPLES ? pcmF32.subarray(pcmF32.length - MAX_SAMPLES) : pcmF32;
    const t0 = performance.now();
    const norm = normalize(audio);
    const out = await this.session.run({ input_values: new this.ort.Tensor("float32", norm, [1, norm.length]) });
    const { label, score } = softmaxTop1(out.logits.data as Float32Array);
    return { label, hint: HINTS[label], score, backend: this.activeBackend!, latency_ms: performance.now() - t0 };
  }

  stats(): { loaded: boolean; backend: string | null; load_ms: number | null } {
    return { loaded: this.session !== null, backend: this.activeBackend, load_ms: this.loadMs };
  }
}

function normalize(audio: Float32Array): Float32Array {
  let m = 0; for (let i = 0; i < audio.length; i++) m += audio[i]; m /= audio.length;
  let v = 0; for (let i = 0; i < audio.length; i++) { const d = audio[i] - m; v += d * d; }
  const invStd = 1 / (Math.sqrt(v / audio.length) + 1e-7);
  const out = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) out[i] = (audio[i] - m) * invStd;
  return out;
}

function softmaxTop1(logits: Float32Array): { label: EmotionLabel; score: number } {
  let mx = -Infinity, mi = 0;
  for (let j = 0; j < logits.length; j++) if (logits[j] > mx) { mx = logits[j]; mi = j; }
  let sum = 0; const probs = new Float32Array(logits.length);
  for (let j = 0; j < logits.length; j++) { probs[j] = Math.exp(logits[j] - mx); sum += probs[j]; }
  return { label: LABELS[mi], score: probs[mi] / sum };
}

export const ser = new SerBrowser();