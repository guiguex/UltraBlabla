/**
 * WsNeuralVad — Drop-in replacement for NeuralVad using server-side WebGPU inference.
 *
 * Sends 512-sample Float32 audio frames over WebSocket to a Cloudflare Durable Object
 * running Silero VAD v5 ONNX. Receives {probability, speech} per frame.
 *
 * Same API as NeuralVad: emits 'speech_start', 'speech_end', 'speech_prob' events.
 * Falls back to RMS energy if WebSocket unavailable.
 */

const CHUNK_SIZE = 512;
const SAMPLE_RATE = 16000;
const SPEECH_THRESHOLD = 0.50;
const SILENCE_THRESHOLD = 0.35;
const MIN_SPEECH_MS = 160;
const SILENCE_MS = 380;
const HARD_CAP_MS = 15000;

export interface WsNeuralVadOptions {
  /** WebSocket URL du Worker DO, ex: wss://silero-vad-webgpu-do.<acct>.workers.dev/ws */
  wsUrl: string;
  speechThreshold?: number;
  silenceThreshold?: number;
  minSpeechMs?: number;
  silenceMs?: number;
  hardCapMs?: number;
  rmsFallbackThreshold?: number;
}

export class WsNeuralVad {
  private ws: WebSocket | null = null;
  private connected = false;
  private opts: Required<WsNeuralVadOptions>;

  // State
  private sampleBuffer: number[] = [];
  private listeners: Record<string, Set<(...args: any[]) => void>> = {};
  private lastProb = 0;
  private lastRms = 0;
  private speechStartedAt: number | null = null;
  private lastSpeechAt: number | null = null;
  private current: 'idle' | 'speaking' = 'idle';
  private startedAt = 0;
  private rmsFallback = false;

  constructor(opts: WsNeuralVadOptions) {
    this.opts = {
      speechThreshold: opts.speechThreshold ?? SPEECH_THRESHOLD,
      silenceThreshold: opts.silenceThreshold ?? SILENCE_THRESHOLD,
      minSpeechMs: opts.minSpeechMs ?? MIN_SPEECH_MS,
      silenceMs: opts.silenceMs ?? SILENCE_MS,
      hardCapMs: opts.hardCapMs ?? HARD_CAP_MS,
      rmsFallbackThreshold: opts.rmsFallbackThreshold ?? 0.012,
      wsUrl: opts.wsUrl,
    };
    this.startedAt = Date.now();
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.opts.wsUrl);
      this.ws.binaryType = 'arraybuffer';
      this.ws.onopen = () => {
        this.connected = true;
        this.emit('ready');
      };
      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'vad' && typeof msg.probability === 'number') {
            this.lastProb = msg.probability;
            this.emit('speech_prob', msg.probability, msg.backend);
            this.handleProb(msg.probability);
          }
        } catch {}
      };
      this.ws.onerror = () => {
        this.rmsFallback = true;
        this.emit('error', new Error('WebSocket VAD unavailable, using RMS fallback'));
      };
      this.ws.onclose = () => {
        this.connected = false;
      };
    } catch (err) {
      this.rmsFallback = true;
    }
  }

  on(event: string, fn: (...args: any[]) => void): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(fn);
    return () => this.listeners[event]?.delete(fn);
  }

  private emit(event: string, ...args: any[]) {
    const set = this.listeners[event];
    if (set) for (const fn of set) {
      try { fn(...args); } catch (e) { console.warn('[WsNeuralVad listener]', e); }
    }
  }

  /**
   * Push RMS energy value (from worklet's kind:'rms' events, ~10 Hz).
   * Used by startListening line 523: this.vad?.push(this.lastRms, performance.now()).
   * With WS connected: returns state based on elapsed time since last speech
   * (local timeout safety net — protects against missed DO silence frames).
   * Without WS: drive state machine from RMS threshold.
   */
  push(rms: number, _timestampMs?: number): 'silence' | 'speech' | 'idle' {
    if (this.connected && !this.rmsFallback) {
      // FIX BUG #2: local timeout safety net
      // If WS hasn't sent a silence frame but we've been idle for >silenceMs,
      // still transition to silence so webapp.ts polling can detect end-of-speech.
      const now = _timestampMs ?? Date.now();
      if (this.current === 'speaking' && this.speechStartedAt && (now - (this.lastSpeechAt ?? now)) > this.opts.silenceMs) {
        if ((now - this.speechStartedAt) > this.opts.minSpeechMs) {
          this.current = 'idle';
          this.emit('speech_end');
          return 'silence';
        }
      }
      return this.current === 'speaking' ? 'speech' : 'idle';
    }
    return this.pushRms(rms, _timestampMs);
  }

  /** Push RMS only (no PCM). Used by .push() when WS unavailable. */
  pushRms(rms: number, _timestampMs?: number): 'silence' | 'speech' | 'idle' {
    this.lastRms = rms;
    const now = _timestampMs ?? Date.now();
    if (rms < this.opts.rmsFallbackThreshold) {
      if (this.current === 'speaking') {
        this.lastSpeechAt = now;
        if (this.lastSpeechAt - (this.speechStartedAt ?? this.lastSpeechAt) > this.opts.silenceMs) {
          this.current = 'idle';
          this.emit('silence_end');
          this.emit('speech_end');
          return 'silence';
        }
      }
      return 'idle';
    } else {
      if (this.current === 'idle') {
        this.speechStartedAt = now;
        this.current = 'speaking';
        this.emit('speech_start');
      }
      this.lastSpeechAt = now;
      return 'speech';
    }
  }

  /**
   * Push PCM audio (from worklet's kind:'frame' events).
   * Accumulates 512-sample chunks and sends to WebSocket if connected.
   */
  pushPcm(pcm: Int16Array | Float32Array, _timestampMs?: number): 'silence' | 'speech' | 'idle' {
    const samples = pcm instanceof Int16Array
      ? Array.from(pcm, (v) => v / 32768)
      : Array.from(pcm);

    // RMS for fallback
    let sumSq = 0;
    for (const s of samples) sumSq += s * s;
    this.lastRms = Math.sqrt(sumSq / samples.length);

    if (this.rmsFallback || !this.connected) {
      // Fallback: simulate VAD with RMS
      if (this.lastRms < this.opts.rmsFallbackThreshold) {
        if (this.current === 'speaking') {
          this.lastSpeechAt = Date.now();
          if (this.lastSpeechAt - (this.speechStartedAt ?? this.lastSpeechAt) > this.opts.silenceMs) {
            this.current = 'idle';
            this.emit('silence_end');
            this.emit('speech_end');
            return 'silence';
          }
        }
        return 'idle';
      } else {
        if (this.current === 'idle') {
          this.speechStartedAt = Date.now();
          this.current = 'speaking';
          this.emit('speech_start');
        }
        this.lastSpeechAt = Date.now();
        return 'speech';
      }
    }

    // Buffer samples for chunked sending
    this.sampleBuffer.push(...samples);
    while (this.sampleBuffer.length >= CHUNK_SIZE) {
      const chunk = new Float32Array(this.sampleBuffer.slice(0, CHUNK_SIZE));
      this.sampleBuffer = this.sampleBuffer.slice(CHUNK_SIZE);
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(chunk.buffer);
      }
    }
    return this.current === 'speaking' ? 'speech' : 'idle';
  }

  private handleProb(prob: number) {
    const now = Date.now();

    // Hard cap
    if (now - this.startedAt > this.opts.hardCapMs) {
      this.reset();
      this.emit('hardcap');
    }

    if (prob > this.opts.speechThreshold) {
      if (this.current === 'idle') {
        this.speechStartedAt = now;
        this.current = 'speaking';
        this.emit('speech_start');
      }
      this.lastSpeechAt = now;
    } else if (prob < this.opts.silenceThreshold) {
      if (this.current === 'speaking' && this.speechStartedAt && (now - this.speechStartedAt) > this.opts.minSpeechMs) {
        this.current = 'idle';
        this.emit('speech_end');
      }
    }
  }

  reset() {
    this.speechStartedAt = null;
    this.lastSpeechAt = null;
    this.current = 'idle';
    this.sampleBuffer = [];
    this.startedAt = Date.now(); // FIX BUG #1: reset hardCap window on each reset()
    this.emit('reset');
  }

  /** Stats for UI debug display. */
  stats(): { isReady: boolean; backend: string; lastProb: number; lastRms: number } {
    return {
      isReady: this.connected && !this.rmsFallback,
      backend: this.connected ? 'ws-webgpu' : 'rms-fallback',
      lastProb: this.lastProb,
      lastRms: this.lastRms,
    };
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }
}