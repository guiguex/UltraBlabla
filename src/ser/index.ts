// src/ser/index.ts — public façade. Stable surface for server.ts.

export { ser, pcm16leToFloat32, normalize, softmaxTop1 } from "./wav2vec-ser.js";
export type { SerResult, SerStats, EmotionLabel } from "./types.js";
export { EMOTION_LABELS } from "./types.js";
export { hintFor } from "./hints.js";
export { EmotionCache } from "./emotion-cache.js";

import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import { ser } from "./wav2vec-ser.js";

const MODEL_REL = "../../models/ser-wav2vec2-fr/model_fp16.onnx";

/**
 * Pre-warm the model once at boot. Resolves regardless of outcome:
 * the voice pipeline must never be blocked by the SER feature.
 */
export async function prewarmSer(): Promise<{ ok: boolean; reason?: string; ms: number }> {
  const t0 = performance.now();
  try {
    const path = new URL(MODEL_REL, import.meta.url);
    const real = Bun.fileURLToPath(path);
    await fs.access(real);                       // throws if missing → silent skip
    await ser.load(real);
    return { ok: true, ms: performance.now() - t0 };
  } catch (e: any) {
    return { ok: false, reason: e?.message ?? String(e), ms: performance.now() - t0 };
  }
}