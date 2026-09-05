// src/ser/types.ts — shared types. Zero runtime cost, zero deps.

export const EMOTION_LABELS = [
  "Pleased",
  "Relaxed",
  "Neutral",
  "Sad",
  "Tension",
] as const;

export type EmotionLabel = (typeof EMOTION_LABELS)[number];

/** Result returned by the SER worker. */
export interface SerResult {
  label: EmotionLabel;
  /** Confidence in [0,1]. Below threshold → caller should skip the hint. */
  score: number;
  /** End-to-end latency of one inference, in ms. */
  latency_ms: number;
}

/** Map-level runtime statistics (exposed via /api/config for observability). */
export interface SerStats {
  loaded: boolean;
  load_ms: number | null;
  calls: number;
  last_label: EmotionLabel | null;
  last_score: number | null;
  /** Free-form string from onnxruntime — typically `["dml"]` or `["cpu"]`. */
  providers: readonly string[] | null;
}