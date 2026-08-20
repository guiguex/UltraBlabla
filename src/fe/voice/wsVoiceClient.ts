import type { VoiceAbort, VoiceChat, VoiceId, VoiceServerMsg } from './types';

export interface WsVoiceClientOpts {
  url?: string;
}

type EventMap = {
  ready: () => void;
  token: (msg: { content: string }) => void;
  audio: (msg: { data: string; format: 'wav' }) => void;
  done:  (msg: { content: string; ttfa_ms: number }) => void;
  error: (msg: { message: string }) => void;
};

export class WsVoiceClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: { [E in keyof EventMap]: Set<EventMap[E]> } = {
    ready: new Set(), token: new Set(), audio: new Set(), done: new Set(), error: new Set(),
  };

  constructor(opts: WsVoiceClientOpts = {}) {
    this.url = opts.url ?? 'wss://api.guig.dev/v1/voice/stream';
  }

  on<E extends keyof EventMap>(event: E, fn: EventMap[E]): () => void {
    this.listeners[event].add(fn);
    return () => { this.listeners[event].delete(fn); };
  }

  private emit<E extends keyof EventMap>(event: E, ...args: Parameters<EventMap[E]>): void {
    this.listeners[event].forEach(fn => (fn as any)(...args));
  }

  chat(text: string, opts: { voice?: VoiceId; system?: string } = {}): void {
    if (!this.ws || this.ws.readyState !== 1) {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => this._sendChat(text, opts);
    } else {
      this._sendChat(text, opts);
    }
    if (!this.ws.onmessage) this._wireSocket();
  }

  private _sendChat(text: string, opts: { voice?: VoiceId; system?: string }) {
    const msg: VoiceChat = { type: 'chat', text, voice: opts.voice, system: opts.system };
    this.ws!.send(JSON.stringify(msg));
  }

  private _wireSocket() {
    this.ws!.onmessage = (ev) => {
      let parsed: VoiceServerMsg;
      try { parsed = JSON.parse(ev.data); } catch { return; }
      switch (parsed.type) {
        case 'ready': this.emit('ready'); break;
        case 'token': this.emit('token', { content: parsed.content }); break;
        case 'audio': this.emit('audio', { data: parsed.data, format: 'wav' }); break;
        case 'done':  this.emit('done',  { content: parsed.content, ttfa_ms: parsed.ttfa_ms }); break;
        case 'error': this.emit('error', { message: parsed.message }); break;
      }
    };
    this.ws!.onerror = () => this.emit('error', { message: 'ws error' });
  }

  abort(): void {
    if (!this.ws) return;
    // Worker doesn't define an in-band abort frame yet; closing + reopening loses
    // stream continuity but is the safest cross-version fallback.
    try { this.ws.close(); } catch {}
    this.ws = null;
  }

  close(): void {
    this.abort();
  }
}
