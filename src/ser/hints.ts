// src/ser/hints.ts — maps the 5-class wav2vec2 output to the same free-form
// French hint format that the previous Qwen2-Audio container produced.
// The hint is injected into the LLM system prompt at the next turn.

import type { EmotionLabel } from "./types.js";

const HINTS: Record<EmotionLabel, string> = {
  Pleased: "Ton : chaleureux. Joie. Conversationnel.",
  Relaxed: "Ton : posé. Calme. Détendu.",
  Neutral: "Ton : neutre. Informatif. Neutre.",
  Sad: "Ton : doux. Tristesse. Empreint.",
  Tension: "Ton : serré. Tension. Inquiet.",
};

/** Build the hint string the LLM expects in the system prompt. */
export function hintFor(label: EmotionLabel): string {
  return HINTS[label];
}