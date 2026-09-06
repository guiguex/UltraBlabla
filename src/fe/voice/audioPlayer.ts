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
          // Soft-clip léger pour éliminer toute saturation numérique
          const s = sample < 0 ? sample / 32768 : sample / 32767;
          channelData[i] = Math.max(-0.99, Math.min(0.99, s));
        }
      }

      // Micro-ramp anti-clic sur les bords de chaque chunk streamé (16 à 32 échantillons)
      if (channelData.length > 16) {
        const rampLen = Math.min(32, Math.floor(channelData.length / 8));
        for (let i = 0; i < rampLen; i++) {
          const ramp = i / rampLen;
          channelData[i] *= ramp;
          channelData[channelData.length - 1 - i] *= ramp;
        }
      }
    }
    return buf;
  }

  /**
   * Rogne les silences morts en préservant 25ms de pré-attaque (headroom acoustique)
   * afin que les consonnes explosives (p, t, k, c, s, ch) ne soient jamais tronquées.
   */
  trimSilenceHeadroom(buffer: AudioBuffer): AudioBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    if (length === 0) return buffer;

    const threshold = 0.006; // ~ -44 dB
    let startIndex = 0;
    let endIndex = length - 1;
    const channelData = buffer.getChannelData(0);

    // Détection de début de voix
    for (let i = 0; i < length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        const preAttackHeadroom = Math.floor(sampleRate * 0.025); // 25ms de marge avant attaque
        startIndex = Math.max(0, i - preAttackHeadroom);
        break;
      }
    }

    // Détection de fin de voix
    for (let i = length - 1; i >= startIndex; i--) {
      if (Math.abs(channelData[i]) > threshold) {
        const postDecayHeadroom = Math.floor(sampleRate * 0.035); // 35ms de marge après décroissance
        endIndex = Math.min(length - 1, i + postDecayHeadroom);
        break;
      }
    }

    const newLength = endIndex - startIndex + 1;
    if (newLength <= 0 || (startIndex === 0 && endIndex === length - 1)) {
      return buffer;
    }

    const trimmed = this.ctx.createBuffer(numChannels, newLength, sampleRate);
    for (let ch = 0; ch < numChannels; ch++) {
      const src = buffer.getChannelData(ch);
      const dst = trimmed.getChannelData(ch);
      dst.set(src.subarray(startIndex, endIndex + 1));

      // Micro-fondu de 3ms pour éviter les pops
      const fadeLen = Math.min(Math.floor(sampleRate * 0.003), newLength);
      for (let f = 0; f < fadeLen; f++) {
        const gain = f / fadeLen;
        dst[f] *= gain;
        dst[newLength - 1 - f] *= gain;
      }
    }

    return trimmed;
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
