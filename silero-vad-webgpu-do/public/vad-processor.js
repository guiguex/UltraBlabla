/**
 * AudioWorkletProcessor — captures microphone audio, resamples to 16kHz,
 * and emits 512-sample frames (32ms) for server-side VAD inference.
 */
class VadProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._frameSize = 512;
    this._inputSampleRate = sampleRate;
    this._targetSampleRate = 16000;
    this._needsResample = this._inputSampleRate !== this._targetSampleRate;
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    let data = input[0];
    if (this._needsResample) data = this._resample(data);

    for (let i = 0; i < data.length; i++) this._buffer.push(data[i]);

    while (this._buffer.length >= this._frameSize) {
      const frame = new Float32Array(this._frameSize);
      for (let i = 0; i < this._frameSize; i++) frame[i] = this._buffer[i];
      this._buffer = this._buffer.slice(this._frameSize);
      this.port.postMessage({ type: "frame", data: frame }, [frame.buffer]);
    }
    return true;
  }

  _resample(input: Float32Array): Float32Array {
    const ratio = this._inputSampleRate / this._targetSampleRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const lo = Math.floor(srcIndex);
      const frac = srcIndex - lo;
      output[i] = lo + 1 < input.length
        ? input[lo] * (1 - frac) + input[lo + 1] * frac
        : (input[lo] || 0);
    }
    return output;
  }
}

registerProcessor("vad-processor", VadProcessor);
