import { describe, it, expect } from 'bun:test';
import { NeuralVad } from '../neural-vad';

describe('NeuralVad', () => {
  it('initializes and runs inference on silence with model.onnx', async () => {
    const vad = new NeuralVad({
      modelVariant: 'fp32',
      speechThreshold: 0.5,
    });

    await vad.init();
    const stats = vad.stats();
    expect(stats.isReady).toBe(true);

    // 512 zeros (silence)
    const silence = new Float32Array(512);
    const prob = await vad.inferChunk(silence);

    expect(typeof prob).toBe('number');
    expect(prob).toBeLessThan(0.2); // Silence should produce low speech prob
  });

  it('detects state transitions through pushPcm', async () => {
    const vad = new NeuralVad({
      modelVariant: 'fp32',
      minSpeechMs: 100,
      silenceMs: 200,
    });
    await vad.init();

    // Send 1600 samples of silence (100ms)
    const pcmSilence = new Int16Array(1600);
    const state = await vad.pushPcm(pcmSilence, 0);
    expect(state).toBe('idle');
  });

  it('supports synchronous push for backward-compatibility', () => {
    const vad = new NeuralVad({
      minSpeechMs: 150,
      silenceMs: 300,
      rmsFallbackThreshold: 0.02,
    });

    expect(vad.push(0.005, 0)).toBe('idle');
    expect(vad.push(0.05, 100)).toBe('idle');
    expect(vad.push(0.05, 260)).toBe('speech');
    expect(vad.push(0.001, 300)).toBe('speech');
    expect(vad.push(0.001, 600)).toBe('silence');
  });

  it('reset clears recurrent state and buffer', async () => {
    const vad = new NeuralVad({ modelVariant: 'fp32' });
    await vad.init();
    await vad.pushPcm(new Int16Array(800), 0);
    vad.reset();
    expect(vad.stats().inferenceCount).toBeGreaterThanOrEqual(1);
    expect(vad.push(0.05, 0)).toBe('idle');
  });
});
