const SCHEDULE_MARGIN_S = 0.02; // 20 ms safety margin

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(',') ? b64.split(',')[1] : b64;
  const bin = atob(clean);
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

  async scheduleChunk(b64: string, sampleRate = 24000, channels = 1): Promise<void> {
    if (!b64 || !b64.trim()) return;
    const bytes = base64ToBytes(b64);
    if (bytes.length === 0) return;

    let buf: AudioBuffer;

    // Check if it's a RIFF/WAV or MP3/OGG container (RIFF = 'RIFF', ID3 = 'ID3', OGG = 'OggS')
    const isRiff = bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isId3 = bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const isOgg = bytes.length >= 4 && bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53;

    if (isRiff || isId3 || isOgg) {
      try {
        buf = await this.ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
      } catch (e) {
        console.warn('[AudioChunkPlayer] Container decode failed, falling back to PCM:', e);
        buf = this.decodeRawPcm(bytes, sampleRate, channels);
      }
    } else {
      // Raw Int16 PCM (24kHz / 16kHz)
      buf = this.decodeRawPcm(bytes, sampleRate, channels);
    }

    if (!buf || buf.length === 0) return;

    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch {}
    }

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

  private decodeRawPcm(bytes: Uint8Array, sampleRate: number, channels: number): AudioBuffer {
    const numSamples = Math.floor(bytes.byteLength / (2 * channels));
    const buf = this.ctx.createBuffer(channels, numSamples, sampleRate);
    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let ch = 0; ch < channels; ch++) {
      const channelData = buf.getChannelData(ch);
      for (let i = 0; i < numSamples; i++) {
        const byteOffset = (i * channels + ch) * 2;
        if (byteOffset + 1 < bytes.byteLength) {
          const sample = dataView.getInt16(byteOffset, true);
          channelData[i] = sample < 0 ? sample / 32768 : sample / 32767;
        }
      }
    }
    return buf;
  }

  duck(targetGain = 0.15, fadeMs = 35): void {
    if (!this.playing) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(Math.max(0.01, this.gain.gain.value), now);
    this.gain.gain.exponentialRampToValueAtTime(Math.max(0.01, targetGain), now + fadeMs / 1000);
  }

  unduck(fadeMs = 60): void {
    if (!this.playing) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(Math.max(0.01, this.gain.gain.value), now);
    this.gain.gain.exponentialRampToValueAtTime(1.0, now + fadeMs / 1000);
  }

  stop(): void {
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(Math.max(0.001, this.gain.gain.value), now);
    this.gain.gain.linearRampToValueAtTime(0.0001, now + 0.035);
    setTimeout(() => {
      this.sources.forEach(s => { try { s.stop(); } catch {} });
      this.sources = [];
      this.playing = false;
      this.nextStartTime = 0;
      this.gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }, 40);
  }

  isPlaying(): boolean { return this.playing; }

  onEnd(fn: () => void): () => void {
    this.endedHandlers.push(fn);
    return () => { this.endedHandlers = this.endedHandlers.filter(h => h !== fn); };
  }
}
