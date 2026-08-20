import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { WsAsrClient } from '../wsAsrClient';

// Mock the global WebSocket so we can simulate the worker side.
class MockSocket {
  static instances: MockSocket[] = [];
  url: string;
  readyState = 0; // CONNECTING
  onopen: ((ev: any) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  sent: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockSocket.instances.push(this);
    queueMicrotask(() => {
      this.readyState = 1;
      this.onopen?.({});
    });
  }
  send(data: string) { this.sent.push(data); }
  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000, reason: '' });
  }
  // helpers
  recv(msg: any) { this.onmessage?.({ data: JSON.stringify(msg) }); }
}
(globalThis as any).WebSocket = MockSocket as any;

function lastSocket(): MockSocket {
  const s = MockSocket.instances[MockSocket.instances.length - 1];
  if (!s) throw new Error('no socket created');
  return s;
}

describe('WsAsrClient', () => {
  beforeEach(() => { MockSocket.instances.length = 0; });

  it('sends {type:"start"} with fr-CA on connect', async () => {
    const c = new WsAsrClient({ language: 'fr-CA' });
    c.start();
    await new Promise(r => queueMicrotask(r));
    const s = lastSocket();
    expect(s.sent[0]).toBe(JSON.stringify({ type: 'start', language: 'fr-CA', sample_rate: 16000 }));
  });

  it('emits partial events as server messages arrive', async () => {
    const c = new WsAsrClient({ language: 'fr-CA' });
    const partials: string[] = [];
    c.on('partial', (m) => partials.push(m.text));
    c.start();
    await new Promise(r => queueMicrotask(r));
    lastSocket().recv({ type: 'partial', seq: 1, text: 'bonjour', latency_ms: 50, model: 'nova-3' });
    expect(partials).toEqual(['bonjour']);
  });

  it('stop() resolves with final text within 5s', async () => {
    const c = new WsAsrClient({ language: 'fr-CA' });
    c.start();
    await new Promise(r => queueMicrotask(r));
    const promise = c.stop();
    // Simulate the server replying to stop
    setTimeout(() => lastSocket().recv({ type: 'final', seq: 1, text: 'bonjour le monde', model: 'nova-3' }), 50);
    const final = await promise;
    expect(final).toBe('bonjour le monde');
  });

  it('stop() resolves with empty string on 5s timeout', async () => {
    const c = new WsAsrClient({ language: 'fr-CA', stopTimeoutMs: 200 });
    c.start();
    await new Promise(r => queueMicrotask(r));
    const final = await c.stop();
    expect(final).toBe('');
  });

  // Regression: a stop() timeout must be bound to its own call. Previously the
  // stale timer from stop #1 would fire while stop #2 was pending and resolve
  // stop #2 with '' long before its own timeout budget elapsed.
  it('a stale stop() timeout does not resolve a later stop()', async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const c = new WsAsrClient({ language: 'fr-CA', stopTimeoutMs: 200 });
    c.start();
    await new Promise(r => queueMicrotask(r));

    // Stop #1 resolves early via 'final' at t~30ms, leaving its timer armed for t~200ms.
    const first = c.stop();
    setTimeout(() => lastSocket().recv({ type: 'final', seq: 1, text: 'un', model: 'nova-3' }), 30);
    expect(await first).toBe('un');

    // Stop #2 begins at t~150ms, so stop #1's stale timer fires at t~200ms mid-flight.
    await sleep(120);
    const second = c.stop();
    setTimeout(() => lastSocket().recv({ type: 'final', seq: 2, text: 'deux', model: 'nova-3' }), 100);
    expect(await second).toBe('deux');
  });
});
