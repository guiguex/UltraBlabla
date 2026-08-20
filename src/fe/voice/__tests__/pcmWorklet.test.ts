import { describe, it, expect } from 'bun:test';
import { downsample, toInt16LE } from '../pcmWorklet';

describe('pcmWorklet helpers', () => {
  it('downsamples 48k to 16k by ratio 3', () => {
    const src = new Float32Array(48); // 1 ms @ 48k
    const out = downsample(src, 48000, 16000);
    expect(out.length).toBe(16);
  });

  it('encodes Float32 [-1,1] to Int16 LE', () => {
    const f = new Float32Array([1, 0, -1, 0.5]);
    const i16 = toInt16LE(f);
    expect(i16[0]).toBe(32767);
    expect(i16[1]).toBe(0);
    expect(i16[2]).toBe(-32768);
    expect(i16[3]).toBe(16383);
  });
});
