// src/ser/emotion-cache.ts — extracted verbatim from src/server.ts.
// Behaviour-preserving: same TTL, same Map, same per-session semantics.

export interface CacheEntry {
  hint: string;
  timestamp: number;
}

export class EmotionCache {
  private readonly map = new Map<string, CacheEntry>();
  constructor(private readonly ttlMs: number = 8_000) {}

  get(sessionId: string): string | null {
    const e = this.map.get(sessionId);
    if (!e) return null;
    if (Date.now() - e.timestamp > this.ttlMs) {
      this.map.delete(sessionId);
      return null;
    }
    return e.hint;
  }

  set(sessionId: string, hint: string): void {
    this.map.set(sessionId, { hint, timestamp: Date.now() });
  }

  /** Optional housekeeping — safe to call on a timer if memory grows. */
  sweep(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [k, v] of this.map) if (v.timestamp < cutoff) this.map.delete(k);
  }
}