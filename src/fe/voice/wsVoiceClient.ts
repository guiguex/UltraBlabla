import type { VoiceAbort, VoiceChat, VoiceId, VoiceServerMsg } from './types';
import { ensureSession } from './session';
import { ser } from './ser-browser';

export interface WsVoiceClientOpts {
  url?: string;
}

type EventMap = {
  ready: () => void;
  token: (msg: { content: string }) => void;
  audio: (msg: { data: string; format: 'wav' | 'pcm' }) => void;
  done:  (msg: { content: string; ttfa_ms: number }) => void;
  interrupted: () => void;
  error: (msg: { message: string }) => void;
};

// 2026-08-29: hardcoded Cloudflare Worker WS endpoint so the frontend works
// when deployed to Pages (no local Bun server). Falls back to same-origin
// when running locally (vite dev / bun serve on localhost:3000).
function getDefaultVoiceWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost:3000/v1/voice/stream';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/v1/voice/stream`;
  }
  return 'wss://api.guig.dev/v1/voice/stream';
}

export class WsVoiceClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: { [E in keyof EventMap]: Set<EventMap[E]> } = {
    ready: new Set(), token: new Set(), audio: new Set(), done: new Set(), interrupted: new Set(), error: new Set(),
  };

  constructor(opts: WsVoiceClientOpts = {}) {
    this.url = opts.url ?? getDefaultVoiceWsUrl();
  }

  on<E extends keyof EventMap>(event: E, fn: EventMap[E]): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as any;
    }
    this.listeners[event].add(fn);
    return () => { this.listeners[event]?.delete(fn); };
  }

  private emit<E extends keyof EventMap>(event: E, ...args: Parameters<EventMap[E]>): void {
    this.listeners[event]?.forEach(fn => (fn as any)(...args));
  }

  chat(text: string, opts: { voice?: VoiceId; system?: string; audio?: string } = {}): void {
    if (!this.ws || this.ws.readyState !== 1) {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => this._sendChat(text, opts);
    } else {
      this._sendChat(text, opts);
    }
    if (!this.ws.onmessage) this._wireSocket();
  }

  private async _buildMsg(text: string, opts: { voice?: VoiceId; system?: string; audio?: string }): Promise<VoiceChat> {
    const session = await ensureSession();
    let emotion_hint: string | undefined;
    if (opts.audio) {
      // Decode base64 PCM Int16-LE → Float32Array, then run client-side SER.
      try {
        const bytes = Uint8Array.from(atob(opts.audio), c => c.charCodeAt(0));
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const n = bytes.byteLength >> 1;
        const pcm = new Float32Array(n);
        for (let i = 0; i < n; i++) pcm[i] = view.getInt16(i << 1, true) / 32768;
        const res = await ser.classify(pcm);
        emotion_hint = res?.hint;
      } catch { /* SER optional — never block the chat */ }
    }
    return {
      type: 'chat',
      text,
      voice: opts.voice,
      system: opts.system,
      audio: opts.audio,
      emotion_hint,
      session_id: session?.session_id,
      session_token: session?.session_token,
    };
  }

  private _sendChat(text: string, opts: { voice?: VoiceId; system?: string; audio?: string }) {
    // A null session just means this turn runs without shared memory.
    void this._buildMsg(text, opts).then((msg) => this.ws!.send(JSON.stringify(msg)));
  }

  private _wireSocket() {
    this.ws!.onmessage = (ev) => {
      let parsed: VoiceServerMsg;
      try { parsed = JSON.parse(ev.data); } catch { return; }
      switch (parsed.type) {
        case 'ready': this.emit('ready'); break;
        case 'token': this.emit('token', { content: parsed.content }); break;
        case 'audio': this.emit('audio', { data: parsed.data, format: (parsed as any).format || 'wav' }); break;
        case 'done':  this.emit('done',  { content: parsed.content, ttfa_ms: parsed.ttfa_ms }); break;
        case 'interrupted': this.emit('interrupted'); break;
        case 'error': this.emit('error', { message: parsed.message }); break;
      }
    };
    this.ws!.onerror = () => this.emit('error', { message: 'ws error' });
    this.ws!.onclose = () => {
      this.ws = null;
    };
  }

  interrupt(): void {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({ type: 'interrupt', timestamp: Date.now() }));
    }
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
