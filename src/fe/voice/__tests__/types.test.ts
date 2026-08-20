import { describe, it, expect } from 'bun:test';
import { isAsrServerMsg, isVoiceServerMsg } from '../types';

describe('protocol type guards', () => {
  it('identifies ASR partial', () => {
    expect(isAsrServerMsg({ type: 'partial', seq: 1, text: 'hi', latency_ms: 5, model: 'm' })).toBe(true);
    expect(isAsrServerMsg({ type: 'ready', model: 'm', fallback: 'f' })).toBe(true);
    expect(isAsrServerMsg({ type: 'nope' })).toBe(false);
  });

  it('identifies voice audio', () => {
    expect(isVoiceServerMsg({ type: 'audio', data: 'xx', format: 'wav' })).toBe(true);
    expect(isVoiceServerMsg({ type: 'token', content: 'x' })).toBe(true);
    expect(isVoiceServerMsg({ type: 'nope' })).toBe(false);
  });
});