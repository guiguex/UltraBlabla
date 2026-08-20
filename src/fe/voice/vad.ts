export interface VadOpts {
  minSpeechMs?: number;   // default 800
  silenceMs?: number;     // default 1500
  rmsThreshold?: number;  // default 0.02
  hardCapMs?: number;     // default 5000
}

export type VadState = 'speech' | 'silence' | 'idle';

export class Vad {
  private minSpeechMs: number;
  private silenceMs: number;
  private rmsThreshold: number;
  private hardCapMs: number;
  private speechStartedAt: number | null = null;
  private lastSpeechAt: number | null = null;
  private current: VadState = 'idle';

  constructor(opts: VadOpts = {}) {
    this.minSpeechMs = opts.minSpeechMs ?? 800;
    this.silenceMs   = opts.silenceMs   ?? 1500;
    this.rmsThreshold = opts.rmsThreshold ?? 0.02;
    this.hardCapMs    = opts.hardCapMs ?? 5000;
  }

  push(rms: number, t: number): VadState {
    const isSpeechFrame = rms >= this.rmsThreshold;

    if (isSpeechFrame) {
      if (this.speechStartedAt === null) this.speechStartedAt = t;
      this.lastSpeechAt = t;
      // Hard cap applies even during continuous speech (per spec: force silence regardless of lastSpeechAt)
      if ((t - this.speechStartedAt) >= this.hardCapMs) {
        this.current = 'silence';
        return 'silence';
      }
      if (this.current !== 'speech' && (t - this.speechStartedAt) >= this.minSpeechMs) {
        this.current = 'speech';
      }
    } else if (this.speechStartedAt !== null) {
      // Hard cap: force silence regardless of how short lastSpeechAt is
      const sinceCap = t - this.speechStartedAt;
      if (sinceCap >= this.hardCapMs) {
        this.current = 'silence';
        return 'silence';
      }
      // Normal silence detection
      if (this.lastSpeechAt !== null && (t - this.lastSpeechAt) >= this.silenceMs) {
        this.current = 'silence';
        return 'silence';
      }
    }

    return this.current;
  }

  reset(): void {
    this.speechStartedAt = null;
    this.lastSpeechAt = null;
    this.current = 'idle';
  }
}
