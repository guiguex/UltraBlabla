// AudioWorklet processor source — inlined as a string so no extra HTTP fetch.
const PCM16K_PROCESSOR = `
class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.buffer = new Float32Array(1600); // 100 ms @ 16k mono
    this.bufferPos = 0;
    this.phase = 0;
    this.sumSq = 0;
    this.sampleCount = 0;
    this.lastRmsAt = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch || ch.length === 0) return true;
    for (let i = 0; i < ch.length; i++) {
      this.sumSq += ch[i] * ch[i];
      this.sampleCount++;
      this.phase += 1;
      if (this.phase >= this.ratio) {
        this.phase -= this.ratio;
        if (this.bufferPos < this.buffer.length) {
          this.buffer[this.bufferPos++] = ch[i];
        }
      }
    }
    if (this.bufferPos >= this.buffer.length) {
      const int16 = new Int16Array(this.buffer.length);
      for (let j = 0; j < this.buffer.length; j++) {
        const s = Math.max(-1, Math.min(1, this.buffer[j]));
        int16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage({ kind: 'frame', pcm: int16.buffer }, [int16.buffer]);
      this.bufferPos = 0;
    }
    // RMS at ~10 Hz (accumulated continuously over the window)
    const now = currentFrame / sampleRate;
    if (now - this.lastRmsAt >= 0.1 && this.sampleCount > 0) {
      this.lastRmsAt = now;
      const rms = Math.sqrt(this.sumSq / this.sampleCount);
      this.port.postMessage({ kind: 'rms', value: rms });
      this.sumSq = 0;
      this.sampleCount = 0;
    }
    return true;
  }
}
registerProcessor('pcm-16k', PCM16kProcessor);
`;

export function pcmWorkletSource(): string { return PCM16K_PROCESSOR; }

// Pure helpers — exported for unit testing only.
export function downsample(src: Float32Array, srcRate: number, dstRate: number): Float32Array {
  const ratio = srcRate / dstRate;
  const outLen = Math.floor(src.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) out[i] = src[Math.floor(i * ratio)];
  return out;
}

export function toInt16LE(f: Float32Array): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return out;
}

export interface PcmCaptureOpts {
  ctx: AudioContext;
  sourceNode: AudioNode;          // MediaStreamSource from getUserMedia
  sampleRate?: number;            // target sample rate (default 16000)
  frameMs?: number;               // frame size (default 100)
  onFrame: (pcm: Int16Array) => void;
  onRms?: (rms: number) => void;
}

export interface PcmCaptureHandle { stop(): void; }

export async function startPcmCapture(opts: PcmCaptureOpts): Promise<PcmCaptureHandle> {
  const blob = new Blob([pcmWorkletSource()], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  await opts.ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(opts.ctx, 'pcm-16k', {
    numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1,
  });
  opts.sourceNode.connect(node);
  // Don't connect node to destination — we never want to play mic audio back.

  node.port.onmessage = (ev: MessageEvent) => {
    const { kind, ...rest } = ev.data;
    if (kind === 'frame' && rest.pcm) opts.onFrame(new Int16Array(rest.pcm));
    else if (kind === 'rms' && typeof rest.value === 'number') opts.onRms?.(rest.value);
  };

  return {
    stop() {
      try { node.disconnect(); } catch {}
      try { opts.sourceNode.disconnect(node); } catch {}
    },
  };
}
