import { describe, it, expect, beforeEach } from 'bun:test';
import { WsVoiceClient } from '../wsVoiceClient';

class MockSocket {
  static instances: MockSocket[] = [];
  url: string;
  readyState = 0;
  onopen: ((ev: any) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  sent: string[] = [];
  constructor(url: string) {
    this.url = url;
    MockSocket.instances.push(this);
    queueMicrotask(() => { this.readyState = 1; this.onopen?.({}); });
  }
  send(d: string) { this.sent.push(d); }
  close() { this.readyState = 3; this.onclose?.({ code: 1000 }); }
  recv(m: any) { this.onmessage?.({ data: JSON.stringify(m) }); }
}
(globalThis as any).WebSocket = MockSocket as any;

describe('WsVoiceClient', () => {
  beforeEach(() => { MockSocket.instances.length = 0; });

  it('sends chat envelope with voice', async () => {
    const c = new WsVoiceClient();
    c.chat('salut', { voice: 'fr-male-1' });
    const s = MockSocket.instances[0];
    // The frame goes out once the session mint settles (or fails offline).
    for (let i = 0; i < 200 && s.sent.length === 0; i++) {
      await new Promise(r => setTimeout(r, 10));
    }
    const first = JSON.parse(s.sent[0]);
    expect(first.type).toBe('chat');
    expect(first.text).toBe('salut');
    expect(first.voice).toBe('fr-male-1');
  });

  it('emits token + audio + done in order', async () => {
    const c = new WsVoiceClient();
    const order: string[] = [];
    const formats: string[] = [];
    c.on('ready',  () => order.push('ready'));
    c.on('token',  (t) => order.push(`token:${t.content}`));
    c.on('audio',  (a) => { order.push('audio'); formats.push(a.format); });
    c.on('done',   () => order.push('done'));
    c.chat('bonjour');
    await new Promise(r => queueMicrotask(r));
    const s = MockSocket.instances[0];
    s.recv({ type: 'ready' });
    s.recv({ type: 'token', content: 'bon' });
    s.recv({ type: 'audio', data: 'AAAA', format: 'pcm' });
    s.recv({ type: 'done', content: 'bonjour', ttfa_ms: 850 });
    expect(order).toEqual(['ready', 'token:bon', 'audio', 'done']);
    expect(formats).toEqual(['pcm']);
  });

  it('abort() closes the socket', async () => {
    const c = new WsVoiceClient();
    c.chat('x');
    await new Promise(r => queueMicrotask(r));
    c.abort();
    expect(MockSocket.instances[0].readyState).toBe(3);
  });
});
