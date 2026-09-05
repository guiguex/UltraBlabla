// src/ser/wav2vec-ser.ts — on-device French Speech Emotion Recognition.
// Pluggable runtime: tries SER_BACKENDS in order, falls back on failure.
// Default order (today): webgpu,dml,cpu — bun-webgpu injects navigator.gpu on
// Bun, giving us true WebGPU (DX12 on Windows / Metal on Apple / Vulkan on Linux).
// On RTX 30xx + Windows, dml is ~2× faster than webgpu for this specific
// model — flip SER_BACKENDS=dml,webgpu,cpu if you want raw speed.

import * as ort from "onnxruntime-node";
import { EMOTION_LABELS, type EmotionLabel, type SerResult, type SerStats } from "./types.js";

const MIN_SAMPLES = 800;
const MAX_SAMPLES = 480_000;

const DEFAULT_BACKENDS = ["webgpu", "dml", "cpu"];
const RAW_PREFERRED = (process.env.SER_BACKENDS?.split(",").map(s => s.trim()).filter(Boolean)
                  ?? DEFAULT_BACKENDS);

let webgpuInjected = false;
async function ensureWebGPU(): Promise<boolean> {
  if (webgpuInjected) return true;
  try {
    const mod = await import("bun-webgpu");
    (mod as { setupGlobals: () => void }).setupGlobals();
    webgpuInjected = true;
    return typeof (globalThis.navigator as { gpu?: unknown })?.gpu !== "undefined";
  } catch {
    return false;
  }
}

function filterAvailableSync(preferred: string[]): string[] {
  const hasWebGPU = typeof globalThis.navigator !== "undefined"
    && typeof (globalThis.navigator as { gpu?: unknown }).gpu !== "undefined";
  if (!hasWebGPU && preferred.includes("webgpu")) {
    console.warn("[ser] navigator.gpu not exposed (install bun-webgpu or set SER_BACKENDS without webgpu)");
  }
  return preferred.filter(ep => ep !== "webgpu" || hasWebGPU);
}

class Wav2VecSER {
  private session: ort.InferenceSession | null = null;
  private loadMs: number | null = null;
  private activeProvider: string | null = null;
  private calls = 0;
  private last: { label: EmotionLabel; score: number } | null = null;

  async load(modelPath: string): Promise<void> {
    await ensureWebGPU();
    const preferred = filterAvailableSync(RAW_PREFERRED);
    const t0 = performance.now();
    let lastErr: unknown = null;
    for (const ep of preferred) {
      try {
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: [ep, "cpu"],
          graphOptimizationLevel: "all",
          enableCpuMemArena: false,
          enableMemPattern: false,
          executionMode: "sequential",
        });
        this.activeProvider = ep;
        this.loadMs = performance.now() - t0;
        return;
      } catch (e) { lastErr = e; }
    }
    throw lastErr ?? new Error("no execution provider succeeded");
  }

  async classify(pcmF32: Float32Array): Promise<SerResult | null> {
    if (!this.session) return null;
    if (pcmF32.length < MIN_SAMPLES) return null;
    const audio = pcmF32.length > MAX_SAMPLES ? pcmF32.subarray(pcmF32.length - MAX_SAMPLES) : pcmF32;
    const t0 = performance.now();
    const norm = normalize(audio);
    const out = await this.session.run({ input_values: new ort.Tensor("float32", norm, [1, norm.length]) });
    const { label, score } = softmaxTop1(out.logits.data as Float32Array);
    this.calls++; this.last = { label, score };
    return { label, score, latency_ms: performance.now() - t0 };
  }

  stats(): SerStats {
    return {
      loaded: this.session !== null,
      load_ms: this.loadMs,
      calls: this.calls,
      last_label: this.last?.label ?? null,
      last_score: this.last?.score ?? null,
      providers: this.activeProvider ? [this.activeProvider] : null,
    };
  }
}

export function normalize(audio: Float32Array): Float32Array {
  let m = 0; for (let i = 0; i < audio.length; i++) m += audio[i]; m /= audio.length;
  let v = 0; for (let i = 0; i < audio.length; i++) { const d = audio[i] - m; v += d * d; }
  const invStd = 1 / (Math.sqrt(v / audio.length) + 1e-7);
  const out = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) out[i] = (audio[i] - m) * invStd;
  return out;
}

export function softmaxTop1(logits: Float32Array): { label: EmotionLabel; score: number } {
  let mx = -Infinity, mi = 0;
  for (let j = 0; j < logits.length; j++) if (logits[j] > mx) { mx = logits[j]; mi = j; }
  let sum = 0; const probs = new Float32Array(logits.length);
  for (let j = 0; j < logits.length; j++) { probs[j] = Math.exp(logits[j] - mx); sum += probs[j]; }
  return { label: EMOTION_LABELS[mi], score: probs[mi] / sum };
}

export function pcm16leToFloat32(pcm: Buffer): Float32Array {
  const out = new Float32Array(pcm.length >> 1);
  for (let i = 0; i < out.length; i++) out[i] = pcm.readInt16LE(i << 1) / 32768;
  return out;
}

export const ser = new Wav2VecSER();