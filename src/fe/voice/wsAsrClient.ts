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
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
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
  private pendingPcm: Int16Array[] = [];
  private lastRecognizedText = '';
  private nativeRec: any = null;
  private hasReceivedServerReady = false;

  constructor(opts: WsAsrClientOpts = {}) {
    this.url = opts.url ?? getDefaultAsrWsUrl();
    this.language = opts.language ?? 'fr-CA';
    this.sampleRate = opts.sampleRate ?? 16000;
    this.stopTimeoutMs = opts.stopTimeoutMs ?? 5000;
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

  private startNativeFallback() {
    if (this.nativeRec) return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    try {
      const rec = new SpeechRec();
      rec.lang = this.language.startsWith('fr') ? 'fr-CA' : this.language;
      rec.interimResults = true;
      rec.continuous = true;

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) final += item[0].transcript;
          else interim += item[0].transcript;
        }
        const text = (final || interim).trim();
        if (text) {
          this.lastRecognizedText = text;
          this.emit('partial', { seq: ++this.seq, text, latency_ms: 30, model: 'speech-recognition-fallback' });
        }
      };

      rec.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('[Fallback ASR error]', err.error);
        }
      };

      rec.start();
      this.nativeRec = rec;
      if (!this.hasReceivedServerReady) {
        this.emit('ready', { model: 'speech-recognition-native', fallback: 'local-browser' });
      }
    } catch {
      // Ignoré silencieusement si déjà démarré ou restreint
    }
  }

  start(): void {
    this.seq = 0;
    this.pendingPcm = [];
    this.lastRecognizedText = '';
    this.hasReceivedServerReady = false;

    try {
      this.ws = new WebSocket(this.url);
    } catch (e: any) {
      console.warn('[ASR WS start exception, activating fallback]', e?.message);
      this.startNativeFallback();
      return;
    }

    this.ws.onopen = () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const msg: AsrClientMsg = { type: 'start', language: this.language, sample_rate: this.sampleRate };
      try {
        this.ws.send(JSON.stringify(msg));
      } catch {}

      if (this.pendingPcm.length > 0) {
        for (const pcm of this.pendingPcm) {
          if (this.ws.readyState !== WebSocket.OPEN) break;
          const frameMsg: AsrPcm = { type: 'pcm', seq: this.seq++, data: toB64(pcm) };
          try {
            this.ws.send(JSON.stringify(frameMsg));
          } catch {}
        }
        this.pendingPcm = [];
      }
    };

    this.ws.onmessage = (ev) => {
      let parsed: AsrServerMsg;
      try { parsed = JSON.parse(ev.data); } catch { return; }
      switch (parsed.type) {
        case 'ready':
          this.hasReceivedServerReady = true;
          this.emit('ready', { model: parsed.model, fallback: parsed.fallback });
          break;
        case 'partial':
          if (parsed.text) this.lastRecognizedText = parsed.text;
          this.emit('partial', { seq: parsed.seq, text: parsed.text, latency_ms: parsed.latency_ms, model: parsed.model });
          break;
        case 'final':
          if (parsed.text) this.lastRecognizedText = parsed.text;
          this.emit('final', { seq: parsed.seq, text: parsed.text, model: parsed.model });
          if (this.pendingStop) {
            this.pendingStop.resolve(parsed.text || this.lastRecognizedText);
            this.pendingStop = null;
          }
          break;
        case 'error':
          this.emit('error', { message: parsed.message });
          break;
      }
    };

    this.ws.onclose = (ev) => {
      this.emit('closed', { code: ev.code, reason: ev.reason ?? '' });
      if (!this.hasReceivedServerReady) {
        this.startNativeFallback();
      }
      if (this.pendingStop) {
        this.pendingStop.resolve(this.lastRecognizedText);
        this.pendingStop = null;
      }
    };

    this.ws.onerror = () => {
      if (!this.hasReceivedServerReady) {
        this.startNativeFallback();
      }
      this.emit('error', { message: 'ws error' });
    };
  }

  sendPcm(pcm: Int16Array): void {
    if (!this.ws || this.ws.readyState === WebSocket.CONNECTING) {
      if (this.pendingPcm.length < 50) {
        this.pendingPcm.push(pcm);
      }
      return;
    }
    if (this.ws.readyState !== WebSocket.OPEN) return;
    try {
      const msg: AsrPcm = { type: 'pcm', seq: this.seq++, data: toB64(pcm) };
      this.ws.send(JSON.stringify(msg));
    } catch {}
  }

  stop(): Promise<string> {
    if (this.nativeRec) {
      try { this.nativeRec.stop(); } catch {}
      this.nativeRec = null;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const text = this.lastRecognizedText;
      if (this.pendingStop) {
        this.pendingStop.resolve(text);
        this.pendingStop = null;
      }
      return Promise.resolve(text);
    }

    return new Promise<string>((resolve) => {
      const pending = { resolve };
      this.pendingStop = pending;
      try {
        this.ws!.send(JSON.stringify({ type: 'stop' }));
      } catch {
        if (this.pendingStop === pending) {
          this.pendingStop = null;
        }
        resolve(this.lastRecognizedText);
        return;
      }
      setTimeout(() => {
        if (this.pendingStop === pending) {
          this.pendingStop.resolve(this.lastRecognizedText);
          this.pendingStop = null;
        }
      }, this.stopTimeoutMs);
    });
  }

  close(): void {
    if (this.nativeRec) {
      try { this.nativeRec.abort(); } catch {}
      this.nativeRec = null;
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        try { this.ws.close(); } catch {}
      }
      this.ws = null;
    }
    this.pendingPcm = [];
    if (this.pendingStop) {
      this.pendingStop.resolve(this.lastRecognizedText);
      this.pendingStop = null;
    }
  }
}
