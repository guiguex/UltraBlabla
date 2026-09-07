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

// Endpoint resolution:
// - If running on guig.dev (e.g. ultrablabla.guig.dev): use wss://api.guig.dev/v1/voice/stream
// - If running on full-stack deployment (localhost, 127.0.0.1, Cloud Run, custom server): use same-origin WS
// - If running on Pages: use wss://api.guig.dev/v1/voice/stream with automatic HTTP fallback if WS is blocked
function getDefaultVoiceWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost:3000/v1/voice/stream';
  if ((window as any).__WS_VOICE_URL__) return (window as any).__WS_VOICE_URL__;
  const custom = localStorage.getItem('ultrablabla_voice_ws_url');
  if (custom) return custom;

  const hostname = window.location.hostname;
  if (hostname.endsWith('guig.dev')) {
    return 'wss://api.guig.dev/v1/voice/stream';
  }

  const isPages = hostname.endsWith('.pages.dev');
  if (!isPages) {
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
  private currentPendingChat: { text: string; opts: any } | null = null;
  private abortController: AbortController | null = null;

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

  chat(text: string, opts: { voice?: VoiceId; system?: string; audio?: string; model?: string } = {}): void {
    this.currentPendingChat = { text, opts };
    if (!this.ws || this.ws.readyState !== 1) {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => this._sendChat(text, opts);
      } catch (e: any) {
        console.warn('[WsVoiceClient] Direct WS instantiate failed, launching HTTP fallback...', e?.message);
        void this.startHttpFallback(text, opts);
        return;
      }
    } else {
      this._sendChat(text, opts);
    }
    if (!this.ws.onmessage) this._wireSocket();
  }

  private async _buildMsg(text: string, opts: { voice?: VoiceId; system?: string; audio?: string; model?: string }): Promise<VoiceChat> {
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
      model: opts.model,
      emotion_hint,
      session_id: session?.session_id,
      session_token: session?.session_token,
    };
  }

  private _sendChat(text: string, opts: { voice?: VoiceId; system?: string; audio?: string; model?: string }) {
    void this._buildMsg(text, opts).then((msg) => {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(msg));
      }
    });
  }

  private _wireSocket() {
    this.ws!.onmessage = (ev) => {
      let parsed: VoiceServerMsg;
      try { parsed = JSON.parse(ev.data); } catch { return; }
      switch (parsed.type) {
        case 'ready':
          this.currentPendingChat = null;
          this.emit('ready');
          break;
        case 'token':
          this.emit('token', { content: parsed.content });
          break;
        case 'audio':
          this.emit('audio', { data: parsed.data, format: (parsed as any).format || 'wav' });
          break;
        case 'done':
          this.currentPendingChat = null;
          this.emit('done',  { content: parsed.content, ttfa_ms: parsed.ttfa_ms });
          break;
        case 'interrupted':
          this.emit('interrupted');
          break;
        case 'error':
          this.emit('error', { message: parsed.message });
          break;
      }
    };
    this.ws!.onerror = () => {
      console.warn('[WsVoiceClient] WebSocket error detected.');
      if (this.currentPendingChat) {
        const { text, opts } = this.currentPendingChat;
        this.currentPendingChat = null;
        console.info('[WsVoiceClient] Activating automatic HTTP streaming fallback.');
        void this.startHttpFallback(text, opts);
      } else {
        this.emit('error', { message: 'ws error' });
      }
    };
    this.ws!.onclose = () => {
      this.ws = null;
    };
  }

  private async startHttpFallback(text: string, opts: { voice?: VoiceId; system?: string; audio?: string; model?: string }): Promise<void> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const startTime = Date.now();

    this.emit('ready');

    const voice = opts.voice || 'remi';
    const model = opts.model || '@cf/zai-org/glm-5.3-flash';
    const messages = [
      ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
      { role: 'user', content: text }
    ];

    const chatEndpoints = [
      '/v1/chat/completions',
      'https://api.guig.dev/v1/chat/completions',
    ];

    let response: Response | null = null;
    for (const ep of chatEndpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
          signal,
        });
        if (res.ok && res.body) {
          response = res;
          break;
        }
      } catch {}
    }

    if (!response || !response.body) {
      this.emit('error', { message: 'Mode vocal indisponible (serveur non joignable)' });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = '';
    let accumulatedText = '';
    let sentenceBuffer = '';

    const ttsEndpoints = [
      '/v1/audio/speech',
      'https://api.guig.dev/v1/audio/speech',
    ];

    const speakChunk = async (chunkText: string) => {
      if (!chunkText.trim() || signal.aborted) return;
      for (const ttsEp of ttsEndpoints) {
        try {
          const ttsRes = await fetch(ttsEp, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin,
            },
            body: JSON.stringify({
              input: chunkText,
              voice,
              response_format: 'wav',
            }),
            signal,
          });
          if (ttsRes.ok) {
            const buf = await ttsRes.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let bin = '';
            for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
            const b64 = btoa(bin);
            this.emit('audio', { data: b64, format: 'wav' });
            return;
          }
        } catch {}
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulatedText += delta;
              sentenceBuffer += delta;
              this.emit('token', { content: delta });

              const match = sentenceBuffer.match(/([^.!?:;\n]+[.!?:\n]+)/);
              if (match) {
                const chunk = match[1].trim();
                sentenceBuffer = sentenceBuffer.slice(match.index! + match[1].length);
                if (chunk) {
                  void speakChunk(chunk);
                }
              }
            }
          } catch {}
        }
      }

      if (sentenceBuffer.trim()) {
        await speakChunk(sentenceBuffer.trim());
      }

      this.emit('done', { content: accumulatedText, ttfa_ms: Date.now() - startTime });
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        this.emit('error', { message: e?.message || 'Erreur flux vocal' });
      }
    }
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
