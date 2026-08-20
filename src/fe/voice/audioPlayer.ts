const SCHEDULE_MARGIN_S = 0.02; // 20 ms safety margin

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class AudioChunkPlayer {
  private ctx: AudioContext;
  private nextStartTime = 0;
  private sources: AudioBufferSourceNode[] = [];
  private gain: GainNode;
  private endedHandlers: Array<() => void> = [];
  private playing = false;

  constructor(ctx?: AudioContext) {
    this.ctx = ctx ?? new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async scheduleChunk(b64: string): Promise<void> {
    const bytes = base64ToBytes(b64);
    // Slice the buffer so decodeAudioData can detach its source (Chromium requirement).
    const buf = await this.ctx.decodeAudioData(bytes.buffer.slice(0) as ArrayBuffer);

    const startAt = Math.max(this.nextStartTime, this.ctx.currentTime + SCHEDULE_MARGIN_S);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gain);
    src.start(startAt);
    src.onended = () => {
      this.sources = this.sources.filter(s => s !== src);
      if (this.sources.length === 0) {
        this.playing = false;
        this.endedHandlers.forEach(fn => fn());
      }
    };
    this.sources.push(src);
    this.nextStartTime = startAt + buf.duration;
    this.playing = true;
  }

  stop(): void {
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(0.001, now + 0.035);
    setTimeout(() => {
      this.sources.forEach(s => { try { s.stop(); } catch {} });
      this.sources = [];
      this.playing = false;
      this.nextStartTime = 0;
    }, 40);
  }

  isPlaying(): boolean { return this.playing; }

  onEnd(fn: () => void): () => void {
    this.endedHandlers.push(fn);
    return () => { this.endedHandlers = this.endedHandlers.filter(h => h !== fn); };
  }
}
