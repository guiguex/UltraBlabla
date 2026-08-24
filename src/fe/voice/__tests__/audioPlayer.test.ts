import { describe, it, expect, beforeEach } from 'bun:test';
import { AudioChunkPlayer } from '../audioPlayer';

// Minimal AudioContext mock with decodeAudioData + createBufferSource + currentTime control
function makeMockCtx() {
  let now = 0;
  const started: Array<{ start: number; dur: number }> = [];
  const buffers = new Map<string, number>(); // b64 -> duration (s)
  const ctx: any = {
    get currentTime() { return now; },
    set currentTime(v: number) { now = v; },
    get destination() { return {}; },
    decodeAudioData: async (b: ArrayBuffer) => {
      const dur = buffers.get(String(b.byteLength)) ?? 1;
      return { duration: dur, length: dur * 16000, sampleRate: 16000, numberOfChannels: 1 } as any;
    },
    createBuffer: (channels: number, length: number, sampleRate: number) => {
      const dur = buffers.get(String(length * 2 * channels)) ?? (length / sampleRate);
      const data = new Float32Array(length);
      return {
        duration: dur,
        length,
        sampleRate,
        numberOfChannels: channels,
        getChannelData: () => data,
      } as any;
    },
    createBufferSource: () => {
      const src: any = {
        buffer: null as any,
        start: (when: number) => started.push({ start: when, dur: src.buffer?.duration ?? 0 }),
        connect: () => {},
        stop: () => {},
        onended: null as null | (() => void),
      };
      return src;
    },
    createGain: () => {
      const g: any = { gain: { value: 1, cancelScheduledValues: () => {}, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }, connect: () => {} };
      return g;
    },
    state: 'running',
    resume: async () => {},
  };
  return { ctx, started, buffers, advance(ms: number) { now += ms / 1000; } };
}

describe('AudioChunkPlayer', () => {
  let mock: ReturnType<typeof makeMockCtx>;
  beforeEach(() => { mock = makeMockCtx(); });

  it('schedules chunks at or after currentTime + 20ms', async () => {
    mock.buffers.set('100', 0.5);  // 100 bytes -> 0.5s
    const p = new AudioChunkPlayer(mock.ctx as any);
    await p.scheduleChunk(btoa('\0'.repeat(100)));    // 100 bytes after b64 decode
    expect(mock.started[0].start).toBeGreaterThanOrEqual(0.02);
    expect(mock.started[0].dur).toBe(0.5);
  });

  it('chains chunks gap-less', async () => {
    mock.buffers.set('100', 0.5);
    const p = new AudioChunkPlayer(mock.ctx as any);
    await p.scheduleChunk(btoa('\0'.repeat(100)));
    mock.advance(100);                  // currentTime += 0.1s
    await p.scheduleChunk(btoa('\0'.repeat(100)));
    expect(mock.started[1].start).toBeCloseTo(mock.started[0].start + 0.5, 2);
  });

  it('stop() does not throw and clears pending state', async () => {
    const p = new AudioChunkPlayer(mock.ctx as any);
    expect(() => p.stop()).not.toThrow();
    expect(p.isPlaying()).toBe(false);
  });
});
