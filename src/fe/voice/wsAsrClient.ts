import type { AsrClientMsg, AsrPcm, AsrServerMsg } from './types';

export interface WsAsrClientOpts {
  url?: string;
  language?: string;
  sampleRate?: number;
  stopTimeoutMs?: number;
}

type EventMap = {
  ready:   (info: { model: string; fallback: string }) => void;
  partial: (msg: { seq: number; text: string; latency_ms: number; model: string }) => void;
  final:   (msg: { seq: number; text: string; model: string }) => void;
  error:   (msg: { message: string }) => void;
  closed:  (info: { code: number; reason: string }) => void;
};

function toB64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function getDefaultAsrWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost:3000/v1/asr/stream';
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  hostname.startsWith('192.168.') ||
                  hostname.startsWith('10.') ||
                  hostname.endsWith('.local') ||
                  (window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443');
  if (isLocal) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/v1/asr/stream`;
  }
  return 'wss://api.guig.dev/v1/asr/stream';
}

export class WsAsrClient {
  private url: string;
  private language: string;
  private sampleRate: number;
  private stopTimeoutMs: number;
  private ws: WebSocket | null = null;
  private seq = 0;
  private listeners: { [E in keyof EventMap]: Set<EventMap[E]> } = {
    ready: new Set(), partial: new Set(), final: new Set(), error: new Set(), closed: new Set(),
  };
  private pendingStop: { resolve: (text: string) => void } | null = null;

  constructor(opts: WsAsrClientOpts = {}) {
    this.url = opts.url ?? getDefaultAsrWsUrl();
    this.language = opts.language ?? 'fr-CA';
    this.sampleRate = opts.sampleRate ?? 16000;
    this.stopTimeoutMs = opts.stopTimeoutMs ?? 5000;
  }

  on<E extends keyof EventMap>(event: E, fn: EventMap[E]): () => void {
    this.listeners[event].add(fn);
    return () => { this.listeners[event].delete(fn); };
  }

  private emit<E extends keyof EventMap>(event: E, ...args: Parameters<EventMap[E]>): void {
    this.listeners[event].forEach(fn => (fn as any)(...args));
  }

  private pendingPcm: Int16Array[] = [];

  start(): void {
    this.seq = 0;
    this.pendingPcm = [];
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      const msg: AsrClientMsg = { type: 'start', language: this.language, sample_rate: this.sampleRate };
      this.ws!.send(JSON.stringify(msg));
      if (this.pendingPcm.length > 0) {
        for (const pcm of this.pendingPcm) {
          const frameMsg: AsrPcm = { type: 'pcm', seq: this.seq++, data: toB64(pcm) };
          this.ws!.send(JSON.stringify(frameMsg));
        }
        this.pendingPcm = [];
      }
    };
    this.ws.onmessage = (ev) => {
      let parsed: AsrServerMsg;
      try { parsed = JSON.parse(ev.data); } catch { return; }
      switch (parsed.type) {
        case 'ready':   this.emit('ready', { model: parsed.model, fallback: parsed.fallback }); break;
        case 'partial': this.emit('partial', { seq: parsed.seq, text: parsed.text, latency_ms: parsed.latency_ms, model: parsed.model }); break;
        case 'final':
          this.emit('final', { seq: parsed.seq, text: parsed.text, model: parsed.model });
          if (this.pendingStop) { this.pendingStop.resolve(parsed.text); this.pendingStop = null; }
          break;
        case 'error':   this.emit('error', { message: parsed.message }); break;
      }
    };
    this.ws.onclose = (ev) => {
      this.emit('closed', { code: ev.code, reason: ev.reason ?? '' });
      if (this.pendingStop) { this.pendingStop.resolve(''); this.pendingStop = null; }
    };
    this.ws.onerror = () => this.emit('error', { message: 'ws error' });
  }

  sendPcm(pcm: Int16Array): void {
    if (!this.ws || this.ws.readyState === 0) {
      this.pendingPcm.push(pcm);
      return;
    }
    if (this.ws.readyState !== 1) return;
    const msg: AsrPcm = { type: 'pcm', seq: this.seq++, data: toB64(pcm) };
    this.ws.send(JSON.stringify(msg));
  }

  stop(): Promise<string> {
    if (!this.ws) return Promise.resolve('');
    return new Promise<string>((resolve) => {
      // Bind the timeout to *this* stop() call: a stale timer from a previous
      // stop() must never resolve a later one (see task-6 report, Defect 2).
      const pending = { resolve };
      this.pendingStop = pending;
      this.ws!.send(JSON.stringify({ type: 'stop' }));
      setTimeout(() => {
        if (this.pendingStop === pending) { this.pendingStop.resolve(''); this.pendingStop = null; }
      }, this.stopTimeoutMs);
    });
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
