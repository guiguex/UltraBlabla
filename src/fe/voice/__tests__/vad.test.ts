import { describe, it, expect } from 'bun:test';
import { Vad } from '../vad';

describe('Vad', () => {
  it('starts idle until 800ms of speech accumulates', () => {
    const v = new Vad();
    expect(v.push(0.05, 0)).toBe('idle');
    expect(v.push(0.05, 700)).toBe('idle');
    expect(v.push(0.05, 801)).toBe('speech');
  });

  it('does not flip to silence before 1500ms of silence', () => {
    const v = new Vad({ minSpeechMs: 800, silenceMs: 1500 });
    v.push(0.05, 0);
    v.push(0.05, 800);           // -> speech
    expect(v.push(0.0, 1000)).toBe('speech');
    expect(v.push(0.0, 2300)).toBe('silence'); // 1500ms after last speech at t=800
  });

  it('caps speech at 5000ms even with continuous noise', () => {
    const v = new Vad();
    for (let t = 0; t <= 6000; t += 100) {
      const r = v.push(0.1, t);
      if (r === 'silence') {
        expect(t).toBeGreaterThanOrEqual(5000);
        return;
      }
    }
    throw new Error('never silenced');
  });

  it('reset clears state', () => {
    const v = new Vad();
    v.push(0.05, 0); v.push(0.05, 800);
    v.reset();
    expect(v.push(0.05, 900)).toBe('idle');
  });
});
