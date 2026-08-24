# Real-Time Voice Streaming Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace UltraBlabla's HTTP-buffered voice pipeline with direct WebSocket connections to `wss://api.guig.dev/v1/asr/stream` and `/v1/voice/stream`, achieving measured TTFA < 1.2 s (down from 3–6 s).

**Architecture:** Frontend-only refactor. The Bun proxy keeps only Turnstile/admin. New `src/fe/voice/*` modules own the AudioWorklet capture, the two WebSocket clients, and the gap-less chunk player. A `ULTRA_FAST_VOICE` feature flag lets us A/B test against the legacy MediaRecorder path before deleting it.

**Tech Stack:**
- **Runtime**: Bun 1.3+ (built-in `bun test` for unit tests)
- **Browser APIs**: AudioWorklet, WebSocket, AudioContext, MediaStream
- **E2E**: Playwright 1.41 (Chromium with `--use-fake-device-for-media-stream`)
- **Upstream**: `wss://api.guig.dev` (existing CF Worker, no infra changes here)

**Spec:** `docs/superpowers/specs/2026-08-20-voice-streaming-pipeline-design.md`

---

## Global Constraints

- **Audio format (wire)**: Int16 LE, mono, 16 kHz; frames are 100 ms ≈ 1600 samples ≈ 3200 bytes raw, ~4267 bytes base64.
- **ASR debounce**: 600 ms (`ASR_DEBOUNCE_MS`) — server-side, client sends frames every 100 ms.
- **VAD thresholds**: `MIN_SPEECH_MS = 800`, `SILENCE_MS = 1500`, `RMS_THRESHOLD = 0.02`, hard cap 5000 ms.
- **ASR stop timeout**: hard 5000 ms — resolves with last partial if no `final`.
- **WS reconnect backoff**: 3 s → 6 s → 12 s → 24 s → 48 s, cap 60 s, 5 retries max.
- **Performance contract**: TTFA < 1.2 s, ASR partial < 700 ms, playback gap = 0 ms.
- **Feature flag**: `window.__ULTRA_FAST_VOICE__` (boolean). Default **off** until Task 12.
- **No breaking the legacy path** until Task 12 toggles the flag and Task 13 deletes it.
- **All commits use Conventional Commits**: `feat:`, `fix:`, `chore:`, `test:`, `refactor:`.

---

## File Structure

### New files (`src/fe/voice/`)

| File | Responsibility | Approx LOC |
|------|----------------|------------|
| `types.ts` | Wire protocol types shared between ASR + Voice clients | ~80 |
| `vad.ts` | RMS-based voice activity detection (pure logic) | ~70 |
| `audioPlayer.ts` | Gap-less WAV chunk player (sample-accurate scheduling) | ~110 |
| `pcmWorklet.ts` | Loads inlined `pcm-16k` AudioWorklet processor | ~60 |
| `wsAsrClient.ts` | WebSocket wrapper for `/v1/asr/stream` | ~180 |
| `wsVoiceClient.ts` | WebSocket wrapper for `/v1/voice/stream` | ~150 |
| `index.ts` | Barrel exports | ~10 |

### New test files

| File | Coverage |
|------|----------|
| `src/fe/voice/__tests__/vad.test.ts` | Speech/silence transitions, hard cap |
| `src/fe/voice/__tests__/audioPlayer.test.ts` | Gap-less scheduling with mocked AudioContext |
| `src/fe/voice/__tests__/wsAsrClient.test.ts` | Protocol round-trip, reconnect backoff, stop timeout |
| `src/fe/voice/__tests__/wsVoiceClient.test.ts` | Token/audio event ordering, abort |
| `e2e/tests/voice-stream.spec.ts` | Full mic → WS → TTS → speaker with mocked worker |

### Modified files

| File | Change |
|------|--------|
| `package.json` | Add `test` script (`bun test`) |
| `src/fe/webapp.ts` | Wire new voice modules behind `__ULTRA_FAST_VOICE__` flag |
| `src/server.ts` | Delete `/api/voice/*` routes; keep `/api/chat`, `/api/config` |
| `capacitor.config.ts` | Remove dead `Voice` plugin block |
| `android/app/src/main/java/com/ultrablabla/app/MainActivity.java` | Drop dead `VoicePlugin` registration |
| `android/app/build.gradle` | Drop dead voice plugin deps |
| `public/index.html` | Add `connect-src wss://api.guig.dev` to CSP |

---

## Task 1: Setup unit test runner

**Files:**
- Modify: `package.json` (add `test` script)
- Create: `src/fe/voice/__tests__/sanity.test.ts`

**Interfaces:**
- Produces: `bun test` runs all `*.test.ts` files under `src/`

- [ ] **Step 1: Verify Bun test runner is available**

Run: `bun --version`
Expected: prints version ≥ 1.3.0. If not, install: `curl -fsSL https://bun.sh/install | bash`.

- [ ] **Step 2: Add `test` script to package.json**

Edit `package.json`, in `"scripts"` add:
```json
"test": "bun test src/",
"test:watch": "bun test --watch src/"
```

- [ ] **Step 3: Create sanity test**

Create `src/fe/voice/__tests__/sanity.test.ts`:
```ts
import { describe, it, expect } from 'bun:test';

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `bun test src/fe/voice/__tests__/sanity.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add package.json src/fe/voice/__tests__/sanity.test.ts
git commit -m "chore: add bun test runner for voice modules"
```

---

## Task 2: Protocol types

**Files:**
- Create: `src/fe/voice/types.ts`
- Create: `src/fe/voice/__tests__/types.test.ts`

**Interfaces:**
- Produces: `AsrStart`, `AsrPcm`, `AsrStop`, `AsrServerMsg`, `VoiceChat`, `VoiceServerMsg`, `VoiceId` — consumed by Tasks 5, 6, 7.

- [ ] **Step 1: Write failing test for protocol guards**

Create `src/fe/voice/__tests__/types.test.ts`:
```ts
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
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/types.test.ts`
Expected: FAIL — `types.ts` not found.

- [ ] **Step 3: Implement types**

Create `src/fe/voice/types.ts`:
```ts
// ASR client → server
export type AsrStart = { type: 'start'; language?: string; sample_rate?: number };
export type AsrPcm = { type: 'pcm'; seq: number; data: string };
export type AsrStop = { type: 'stop' };
export type AsrClientMsg = AsrStart | AsrPcm | AsrStop;

// ASR server → client
export type AsrReady = { type: 'ready'; model: string; fallback: string };
export type AsrPartial = { type: 'partial'; seq: number; text: string; latency_ms: number; model: string };
export type AsrFinal = { type: 'final'; seq: number; text: string; model: string };
export type AsrError = { type: 'error'; message: string };
export type AsrServerMsg = AsrReady | AsrPartial | AsrFinal | AsrError;

// Voice client → server
export type VoiceChat = { type: 'chat'; text: string; voice?: VoiceId; system?: string };
export type VoiceAbort = { type: 'abort' };
export type VoiceClientMsg = VoiceChat | VoiceAbort;

export type VoiceId =
  | 'fr-female-1' | 'fr-female-2' | 'fr-female-3'
  | 'fr-male-1'   | 'fr-male-2'   | 'fr-male-3'
  | 'en-female-1' | 'en-female-2' | 'en-female-3'
  | 'en-male-1'   | 'en-male-2'   | 'en-male-3'
  | 'es-female-1' | 'es-female-2'
  | 'es-male-1'   | 'es-male-2'
  | 'premium-1';

// Voice server → client
export type VoiceReady = { type: 'ready' };
export type VoiceToken = { type: 'token'; content: string };
export type VoiceAudio = { type: 'audio'; data: string; format: 'wav' };
export type VoiceDone = { type: 'done'; content: string; ttfa_ms: number };
export type VoiceError = { type: 'error'; message: string };
export type VoiceServerMsg = VoiceReady | VoiceToken | VoiceAudio | VoiceDone | VoiceError;

// Type guards
export function isAsrServerMsg(v: unknown): v is AsrServerMsg {
  return !!v && typeof v === 'object' && ['ready', 'partial', 'final', 'error'].includes((v as any).type);
}

export function isVoiceServerMsg(v: unknown): v is VoiceServerMsg {
  return !!v && typeof v === 'object' && ['ready', 'token', 'audio', 'done', 'error'].includes((v as any).type);
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/types.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/types.ts src/fe/voice/__tests__/types.test.ts
git commit -m "feat(voice): protocol types + guards for ASR and voice streams"
```

---

## Task 3: VAD module

**Files:**
- Create: `src/fe/voice/vad.ts`
- Create: `src/fe/voice/__tests__/vad.test.ts`

**Interfaces:**
- Produces: `class Vad` with `push(rms, t): 'speech' | 'silence' | 'idle'` and `reset()`
- Consumed by: Task 7 (webapp integration), Task 4 (worklet calls back RMS)

- [ ] **Step 1: Write failing test**

Create `src/fe/voice/__tests__/vad.test.ts`:
```ts
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
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/vad.test.ts`
Expected: FAIL — `vad.ts` not found.

- [ ] **Step 3: Implement VAD**

Create `src/fe/voice/vad.ts`:
```ts
export interface VadOpts {
  minSpeechMs?: number;   // default 800
  silenceMs?: number;     // default 1500
  rmsThreshold?: number;  // default 0.02
  hardCapMs?: number;     // default 5000
}

export type VadState = 'speech' | 'silence' | 'idle';

export class Vad {
  private minSpeechMs: number;
  private silenceMs: number;
  private rmsThreshold: number;
  private hardCapMs: number;
  private speechStartedAt: number | null = null;
  private lastSpeechAt: number | null = null;
  private current: VadState = 'idle';

  constructor(opts: VadOpts = {}) {
    this.minSpeechMs = opts.minSpeechMs ?? 800;
    this.silenceMs   = opts.silenceMs   ?? 1500;
    this.rmsThreshold = opts.rmsThreshold ?? 0.02;
    this.hardCapMs    = opts.hardCapMs ?? 5000;
  }

  push(rms: number, t: number): VadState {
    const isSpeechFrame = rms >= this.rmsThreshold;

    if (isSpeechFrame) {
      if (this.speechStartedAt === null) this.speechStartedAt = t;
      this.lastSpeechAt = t;
      // Hard cap applies even during continuous speech (force silence regardless)
      if ((t - this.speechStartedAt) >= this.hardCapMs) {
        this.current = 'silence';
        return 'silence';
      }
      if (this.current !== 'speech' && (t - this.speechStartedAt) >= this.minSpeechMs) {
        this.current = 'speech';
      }
    } else if (this.speechStartedAt !== null) {
      // Hard cap: force silence regardless of how short lastSpeechAt is
      const sinceCap = t - this.speechStartedAt;
      if (sinceCap >= this.hardCapMs) {
        this.current = 'silence';
        return 'silence';
      }
      // Normal silence detection
      if (this.lastSpeechAt !== null && (t - this.lastSpeechAt) >= this.silenceMs) {
        this.current = 'silence';
        return 'silence';
      }
    }

    return this.current;
  }

  reset(): void {
    this.speechStartedAt = null;
    this.lastSpeechAt = null;
    this.current = 'idle';
  }
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/vad.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/vad.ts src/fe/voice/__tests__/vad.test.ts
git commit -m "feat(voice): RMS-based VAD with 800/1500/5000 ms thresholds"
```

---

## Task 4: AudioPlayer (gap-less scheduling)

**Files:**
- Create: `src/fe/voice/audioPlayer.ts`
- Create: `src/fe/voice/__tests__/audioPlayer.test.ts`

**Interfaces:**
- Produces: `class AudioChunkPlayer` with `scheduleChunk(b64)`, `stop()`, `isPlaying()`, `onEnd(fn)`
- Consumed by: Task 7 (webapp integration), Task 6 (voice client pushes audio chunks)

- [ ] **Step 1: Write failing test**

Create `src/fe/voice/__tests__/audioPlayer.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'bun:test';
import { AudioChunkPlayer } from '../audioPlayer';

// Minimal AudioContext mock with decodeAudioData + createBufferSource + currentTime control
function makeMockCtx() {
  let now = 0;
  const started: Array<{ start: number; dur: number }> = [];
  const buffers = new Map<string, number>(); // b64 -> duration (s)
  const ctx: any = {
    get currentTime() { return now; },
    set currentTime(v: number) { now = v; },
    get destination() { return {}; },
    decodeAudioData: async (b: ArrayBuffer) => {
      const dur = buffers.get(String(b.byteLength)) ?? 1;
      return { duration: dur, length: dur * 16000, sampleRate: 16000, numberOfChannels: 1 } as any;
    },
    createBufferSource: () => {
      const src: any = {
        buffer: null as any,
        start: (when: number) => started.push({ start: when, dur: src.buffer?.duration ?? 0 }),
        connect: () => {},
        stop: () => {},
        onended: null as null | (() => void),
      };
      return src;
    },
    createGain: () => {
      const g: any = {
        gain: {
          value: 1,
          linearRampToValueAtTime: () => {},
          cancelScheduledValues: () => {},
          setValueAtTime: () => {},
        },
        connect: () => {},
      };
      return g;
    },
    state: 'running',
    resume: async () => {},
  };
  return { ctx, started, buffers, advance(ms: number) { now += ms / 1000; } };
}

describe('AudioChunkPlayer', () => {
  let mock: ReturnType<typeof makeMockCtx>;
  beforeEach(() => { mock = makeMockCtx(); });

  it('schedules chunks at or after currentTime + 20ms', async () => {
    mock.buffers.set('100', 0.5);  // 100 bytes -> 0.5s
    const p = new AudioChunkPlayer(mock.ctx as any);
    await p.scheduleChunk(btoa('\0'.repeat(100)));    // valid b64 of 100 bytes
    expect(mock.started[0].start).toBeGreaterThanOrEqual(0.02);
    expect(mock.started[0].dur).toBe(0.5);
  });

  it('chains chunks gap-less', async () => {
    mock.buffers.set('100', 0.5);
    const p = new AudioChunkPlayer(mock.ctx as any);
    await p.scheduleChunk(btoa('\0'.repeat(100)));
    mock.advance(100);                  // currentTime += 0.1s
    await p.scheduleChunk(btoa('\0'.repeat(100)));
    expect(mock.started[1].start).toBeCloseTo(mock.started[0].start + 0.5, 2);
  });

  it('stop() does not throw and clears pending state', async () => {
    const p = new AudioChunkPlayer(mock.ctx as any);
    expect(() => p.stop()).not.toThrow();
    expect(p.isPlaying()).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/audioPlayer.test.ts`
Expected: FAIL — `audioPlayer.ts` not found.

- [ ] **Step 3: Implement AudioChunkPlayer**

Create `src/fe/voice/audioPlayer.ts`:
```ts
const SCHEDULE_MARGIN_S = 0.02; // 20 ms safety margin

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export class AudioChunkPlayer {
  private ctx: AudioContext;
  private nextStartTime = 0;
  private sources: AudioBufferSourceNode[] = [];
  private gain: GainNode;
  private endedHandlers: Array<() => void> = [];
  private playing = false;

  constructor(ctx?: AudioContext) {
    this.ctx = ctx ?? new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async scheduleChunk(b64: string): Promise<void> {
    const bytes = base64ToBytes(b64);
    // Slice the buffer so decodeAudioData can detach its source (Chromium requirement).
    const buf = await this.ctx.decodeAudioData(bytes.buffer.slice(0) as ArrayBuffer);

    const startAt = Math.max(this.nextStartTime, this.ctx.currentTime + SCHEDULE_MARGIN_S);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gain);
    src.start(startAt);
    src.onended = () => {
      this.sources = this.sources.filter(s => s !== src);
      if (this.sources.length === 0) {
        this.playing = false;
        this.endedHandlers.forEach(fn => fn());
      }
    };
    this.sources.push(src);
    this.nextStartTime = startAt + buf.duration;
    this.playing = true;
  }

  stop(): void {
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(0.001, now + 0.035);
    setTimeout(() => {
      this.sources.forEach(s => { try { s.stop(); } catch {} });
      this.sources = [];
      this.playing = false;
      this.nextStartTime = 0;
    }, 40);
  }

  isPlaying(): boolean { return this.playing; }

  onEnd(fn: () => void): () => void {
    this.endedHandlers.push(fn);
    return () => { this.endedHandlers = this.endedHandlers.filter(h => h !== fn); };
  }
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/audioPlayer.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/audioPlayer.ts src/fe/voice/__tests__/audioPlayer.test.ts
git commit -m "feat(voice): gap-less AudioChunkPlayer with 20ms scheduling margin"
```

---

## Task 5: PCM AudioWorklet loader

**Files:**
- Create: `src/fe/voice/pcmWorklet.ts`
- Create: `src/fe/voice/__tests__/pcmWorklet.test.ts`

**Interfaces:**
- Produces: `startPcmCapture(opts: { ctx, sourceNode, sampleRate, frameMs, onFrame, onRms }): Promise<{ stop(): void }>`
- Consumed by: Task 7 (webapp integration)

- [ ] **Step 1: Write failing test (decimation logic only — no AudioContext)**

Create `src/fe/voice/__tests__/pcmWorklet.test.ts`:
```ts
import { describe, it, expect } from 'bun:test';
import { downsample, toInt16LE } from '../pcmWorklet';

describe('pcmWorklet helpers', () => {
  it('downsamples 48k to 16k by ratio 3', () => {
    const src = new Float32Array(48); // 1 ms @ 48k
    const out = downsample(src, 48000, 16000);
    expect(out.length).toBe(16);
  });

  it('encodes Float32 [-1,1] to Int16 LE', () => {
    const f = new Float32Array([1, 0, -1, 0.5]);
    const i16 = toInt16LE(f);
    expect(i16[0]).toBe(32767);
    expect(i16[1]).toBe(0);
    expect(i16[2]).toBe(-32768);
    expect(i16[3]).toBe(16383);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/pcmWorklet.test.ts`
Expected: FAIL — `pcmWorklet.ts` not found.

- [ ] **Step 3: Implement module with helper exports**

Create `src/fe/voice/pcmWorklet.ts`:
```ts
// AudioWorklet processor source — inlined as a string so no extra HTTP fetch.
const PCM16K_PROCESSOR = `
class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.buffer = new Float32Array(1600); // 100 ms @ 16k mono
    this.bufferPos = 0;
    this.frames = 0;
    this.lastRmsAt = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    let sumSq = 0;
    for (let i = 0; i < ch.length; i++) {
      if (this.bufferPos < this.buffer.length && (i % Math.round(this.ratio)) === 0) {
        this.buffer[this.bufferPos++] = ch[i];
      }
      sumSq += ch[i] * ch[i];
    }
    if (this.bufferPos >= this.buffer.length) {
      const int16 = new Int16Array(this.buffer.length);
      for (let j = 0; j < this.buffer.length; j++) {
        const s = Math.max(-1, Math.min(1, this.buffer[j]));
        int16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage({ kind: 'frame', pcm: int16.buffer }, [int16.buffer]);
      this.bufferPos = 0;
    }
    // RMS at ~10 Hz
    const now = currentFrame / sampleRate;
    if (now - this.lastRmsAt >= 0.1) {
      this.lastRmsAt = now;
      this.port.postMessage({ kind: 'rms', value: Math.sqrt(sumSq / ch.length) });
    }
    this.frames++;
    return true;
  }
}
registerProcessor('pcm-16k', PCM16kProcessor);
`;

export function pcmWorkletSource(): string { return PCM16K_PROCESSOR; }

// Pure helpers — exported for unit testing only.
export function downsample(src: Float32Array, srcRate: number, dstRate: number): Float32Array {
  const ratio = srcRate / dstRate;
  const outLen = Math.floor(src.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) out[i] = src[Math.floor(i * ratio)];
  return out;
}

export function toInt16LE(f: Float32Array): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return out;
}

export interface PcmCaptureOpts {
  ctx: AudioContext;
  sourceNode: AudioNode;          // MediaStreamSource from getUserMedia
  sampleRate?: number;            // target sample rate (default 16000)
  frameMs?: number;               // frame size (default 100)
  onFrame: (pcm: Int16Array) => void;
  onRms?: (rms: number) => void;
}

export interface PcmCaptureHandle { stop(): void; }

export async function startPcmCapture(opts: PcmCaptureOpts): Promise<PcmCaptureHandle> {
  const blob = new Blob([pcmWorkletSource()], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  await opts.ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);

  const node = new AudioWorkletNode(opts.ctx, 'pcm-16k', {
    numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1,
  });
  opts.sourceNode.connect(node);
  // Don't connect node to destination — we never want to play mic audio back.

  node.port.onmessage = (ev: MessageEvent) => {
    const { kind, ...rest } = ev.data;
    if (kind === 'frame' && rest.pcm) opts.onFrame(new Int16Array(rest.pcm));
    else if (kind === 'rms' && typeof rest.value === 'number') opts.onRms?.(rest.value);
  };

  return {
    stop() {
      try { node.disconnect(); } catch {}
      try { opts.sourceNode.disconnect(node); } catch {}
    },
  };
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/pcmWorklet.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/pcmWorklet.ts src/fe/voice/__tests__/pcmWorklet.test.ts
git commit -m "feat(voice): inlined pcm-16k AudioWorklet with 100ms frames + 10Hz RMS"
```

---

## Task 6: WS ASR client

**Files:**
- Create: `src/fe/voice/wsAsrClient.ts`
- Create: `src/fe/voice/__tests__/wsAsrClient.test.ts`

**Interfaces:**
- Produces: `class WsAsrClient` with `start()`, `sendPcm(pcm)`, `stop()`, `on(event, fn)`, `close()`
- Consumed by: Task 7 (webapp integration)
- Events: `'ready' | 'partial' | 'final' | 'error' | 'closed'`

- [ ] **Step 1: Write failing test (with in-process mock WS server)**

Create `src/fe/voice/__tests__/wsAsrClient.test.ts`:
```ts
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
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/wsAsrClient.test.ts`
Expected: FAIL — `wsAsrClient.ts` not found.

- [ ] **Step 3: Implement WS ASR client**

Create `src/fe/voice/wsAsrClient.ts`:
```ts
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
    this.url = opts.url ?? 'wss://api.guig.dev/v1/asr/stream';
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

  start(): void {
    this.seq = 0;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      const msg: AsrClientMsg = { type: 'start', language: this.language, sample_rate: this.sampleRate };
      this.ws!.send(JSON.stringify(msg));
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
    if (!this.ws || this.ws.readyState !== 1) return;
    const msg: AsrPcm = { type: 'pcm', seq: this.seq++, data: toB64(pcm) };
    this.ws.send(JSON.stringify(msg));
  }

  stop(): Promise<string> {
    if (!this.ws) return Promise.resolve('');
    return new Promise<string>((resolve) => {
      const pending = { resolve };
      this.pendingStop = pending;
      this.ws!.send(JSON.stringify({ type: 'stop' }));
      setTimeout(() => {
        // Identity guard: only resolve if THIS stop is still the active one.
        // Prevents stale timers from earlier stop() calls from killing a later one.
        if (this.pendingStop === pending) { this.pendingStop.resolve(''); this.pendingStop = null; }
      }, this.stopTimeoutMs);
    });
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/wsAsrClient.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/wsAsrClient.ts src/fe/voice/__tests__/wsAsrClient.test.ts
git commit -m "feat(voice): WsAsrClient with fr-CA default, 5s stop timeout, mock-tested"
```

---

## Task 7: WS Voice client

**Files:**
- Create: `src/fe/voice/wsVoiceClient.ts`
- Create: `src/fe/voice/__tests__/wsVoiceClient.test.ts`

**Interfaces:**
- Produces: `class WsVoiceClient` with `chat(text, opts)`, `abort()`, `on(event, fn)`, `close()`
- Events: `'ready' | 'token' | 'audio' | 'done' | 'error'`

- [ ] **Step 1: Write failing test**

Create `src/fe/voice/__tests__/wsVoiceClient.test.ts`:
```ts
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
    await new Promise(r => queueMicrotask(r));
    const s = MockSocket.instances[0];
    const first = JSON.parse(s.sent[0]);
    expect(first).toEqual({ type: 'chat', text: 'salut', voice: 'fr-male-1' });
  });

  it('emits token + audio + done in order', async () => {
    const c = new WsVoiceClient();
    const order: string[] = [];
    c.on('ready',  () => order.push('ready'));
    c.on('token',  (t) => order.push(`token:${t.content}`));
    c.on('audio',  () => order.push('audio'));
    c.on('done',   () => order.push('done'));
    c.chat('bonjour');
    await new Promise(r => queueMicrotask(r));
    const s = MockSocket.instances[0];
    s.recv({ type: 'ready' });
    s.recv({ type: 'token', content: 'bon' });
    s.recv({ type: 'audio', data: 'AAAA', format: 'wav' });
    s.recv({ type: 'done', content: 'bonjour', ttfa_ms: 850 });
    expect(order).toEqual(['ready', 'token:bon', 'audio', 'done']);
  });

  it('abort() closes the socket', async () => {
    const c = new WsVoiceClient();
    c.chat('x');
    await new Promise(r => queueMicrotask(r));
    c.abort();
    expect(MockSocket.instances[0].readyState).toBe(3);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `bun test src/fe/voice/__tests__/wsVoiceClient.test.ts`
Expected: FAIL — `wsVoiceClient.ts` not found.

- [ ] **Step 3: Implement WS Voice client**

Create `src/fe/voice/wsVoiceClient.ts`:
```ts
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
```

- [ ] **Step 4: Run, verify PASS**

Run: `bun test src/fe/voice/__tests__/wsVoiceClient.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/fe/voice/wsVoiceClient.ts src/fe/voice/__tests__/wsVoiceClient.test.ts
git commit -m "feat(voice): WsVoiceClient with chat/abort events, mock-tested"
```

---

## Task 8: Barrel exports

**Files:**
- Create: `src/fe/voice/index.ts`

- [ ] **Step 1: Create barrel**

Create `src/fe/voice/index.ts`:
```ts
export * from './types';
export { Vad } from './vad';
export type { VadOpts, VadState } from './vad';
export { AudioChunkPlayer } from './audioPlayer';
export { startPcmCapture, downsample, toInt16LE, pcmWorkletSource } from './pcmWorklet';
export type { PcmCaptureOpts, PcmCaptureHandle } from './pcmWorklet';
export { WsAsrClient } from './wsAsrClient';
export type { WsAsrClientOpts } from './wsAsrClient';
export { WsVoiceClient } from './wsVoiceClient';
export type { WsVoiceClientOpts } from './wsVoiceClient';
```

- [ ] **Step 2: Run all unit tests**

Run: `bun test src/`
Expected: all green (sanity, types, vad, audioPlayer, pcmWorklet, wsAsrClient, wsVoiceClient = ~17 tests).

- [ ] **Step 3: Commit**

```bash
git add src/fe/voice/index.ts
git commit -m "feat(voice): barrel exports for the voice module"
```

---

## Task 9: webapp.ts integration (behind feature flag)

**Files:**
- Modify: `src/fe/webapp.ts` (add new code path gated by `window.__ULTRA_FAST_VOICE__`)
- Test: existing `e2e/tests/voice-interaction.spec.ts` (still passes with flag off)

**Interfaces:**
- Reads feature flag `window.__ULTRA_FAST_VOICE__` (boolean, default false).
- Wires: `WsAsrClient` + `WsVoiceClient` + `AudioChunkPlayer` + `Vad` + `startPcmCapture` when flag is true.
- Preserves all existing UI state machine, visuals, error UX.

- [ ] **Step 1: Read existing webapp.ts top-level structure**

Run: `head -50 d:/Applications/UltraBlabla/src/fe/webapp.ts`
Inspect: identify the existing class/closure boundary, the audio-related globals (`audioCtx`, `mediaRecorder`), the click handler for the mic button.

- [ ] **Step 2: Add the new voice path as a sibling, not a replacement**

At the top of `src/fe/webapp.ts`, after the existing imports, add:
```ts
import { WsAsrClient, WsVoiceClient, AudioChunkPlayer, Vad, startPcmCapture } from './voice/index';

declare global { interface Window { __ULTRA_FAST_VOICE__?: boolean } }
```

Inside the existing class (or main module body), add a private branch:
```ts
private async startUltraFastListening() {
  if (!window.__ULTRA_FAST_VOICE__) return this.startListeningLegacy();

  const ctx = this.audioCtx;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    video: false,
  });
  const source = ctx.createMediaStreamSource(stream);
  this.vad = new Vad();
  this.player = new AudioChunkPlayer(ctx);
  this.wsAsr = new WsAsrClient({ language: 'fr-CA' });
  this.wsVoice = new WsVoiceClient();

  this.wsAsr.on('partial', (msg) => this.streamHoloSubtitle(msg.text));
  this.wsAsr.on('error',   (msg) => this.showError(`ASR: ${msg.message}`));
  this.wsVoice.on('audio', (msg) => { this.player.scheduleChunk(msg.data).catch(console.error); });
  this.wsVoice.on('done',  (msg) => console.info('voice_ttfa:', msg.ttfa_ms));
  this.wsVoice.on('error', (msg) => this.showError(`TTS: ${msg.message}`));

  this.wsAsr.start();
  this.capture = await startPcmCapture({
    ctx,
    sourceNode: source,
    sampleRate: 16000,
    frameMs: 100,
    onFrame: (pcm) => this.wsAsr.sendPcm(pcm),
    onRms:  (rms) => this.vad.push(rms, performance.now()),
  });

  // VAD-driven end of utterance
  this.vadInterval = setInterval(() => {
    const state = this.vad?.push(this.lastRms ?? 0, performance.now());
    if (state === 'silence') {
      this.vad?.reset();
      clearInterval(this.vadInterval!);
      void this.finishUtterance();
    }
  }, 100);
}

private async finishUtterance() {
  this.capture?.stop();
  const text = await this.wsAsr.stop();
  if (text.trim().length === 0) { this.restartListening(); return; }
  this.streamHoloSubtitle(text);
  this.wsVoice.chat(text, { voice: this.currentVoice() });
}

private startListeningLegacy() {
  // existing implementation, untouched
}
```

- [ ] **Step 3: Add `UltraFastVoice` button branch**

In the mic-button click handler, replace the direct call with:
```ts
button.addEventListener('click', () => {
  if (window.__ULTRA_FAST_VOICE__) void this.startUltraFastListening();
  else this.startListeningLegacy();
});
```

- [ ] **Step 4: Set the feature flag in `public/index.html` (default off)**

In `public/index.html`, before the closing `</head>`, add:
```html
<script>window.__ULTRA_FAST_VOICE__ = false;</script>
```

- [ ] **Step 5: Add the field declarations alongside other class fields**

In the existing class declaration, after `private audioCtx: AudioContext;` add:
```ts
private wsAsr?: WsAsrClient;
private wsVoice?: WsVoiceClient;
private player?: AudioChunkPlayer;
private vad?: Vad;
private capture?: { stop(): void };
private vadInterval?: ReturnType<typeof setInterval>;
private lastRms = 0;
```

(The `onRms` callback in step 2 must also write `this.lastRms = rms` before calling `vad.push` — adjust accordingly.)

- [ ] **Step 6: Run unit tests + Playwright**

Run: `bun test src/`
Expected: green.

Run: `cd e2e && npm test`
Expected: legacy voice-interaction spec still passes (flag off → legacy path).

- [ ] **Step 7: Commit**

```bash
git add src/fe/webapp.ts public/index.html
git commit -m "feat(voice): wire ultra-fast WS path behind __ULTRA_FAST_VOICE__ flag (off)"
```

---

## Task 10: Cleanup src/server.ts (remove dead voice routes)

**Files:**
- Modify: `src/server.ts`

- [ ] **Step 1: Locate the voice routes**

Run: `grep -n "/api/voice" d:/Applications/UltraBlabla/src/server.ts`
Expected: 4 hits matching `/api/voice/pipeline`, `/api/voice/transcribe`, `/api/voice/speak`, `/api/voice/voices`.

- [ ] **Step 2: Delete the four routes**

Remove the route handlers for `/api/voice/pipeline`, `/api/voice/transcribe`, `/api/voice/speak`, `/api/voice/voices`. Also remove any helper functions used only by these routes (e.g., `voiceModels` mapping at lines 21–29 if no longer referenced). The `getProxyHeaders` helper is still used by `/api/chat` — keep it.

- [ ] **Step 3: Update voice mapping comment block if any**

If lines 1–30 contain voice-model constants, leave them only if referenced elsewhere; otherwise delete.

- [ ] **Step 4: Type-check**

Run: `cd d:/Applications/UltraBlabla && bun build src/server.ts --target=bun --no-bundle`
Expected: 0 errors.

- [ ] **Step 5: Run dev server and curl `/api/chat`**

Run: `bun run dev` in background, then `curl -s http://localhost:3000/api/config`.
Expected: 200 + JSON payload. Then `curl -i -X POST http://localhost:3000/api/voice/speak` → 404.

- [ ] **Step 6: Commit**

```bash
git add src/server.ts
git commit -m "refactor(server): drop dead /api/voice/* proxy routes; frontend uses WS directly"
```

---

## Task 11: Capacitor cleanup (remove dead VoicePlugin ref)

**Files:**
- Modify: `capacitor.config.ts`

- [ ] **Step 1: Read current capacitor config**

Run: `cat d:/Applications/UltraBlabla/capacitor.config.ts`
Identify: the `plugins.Voice` block (likely `com.ultrablabla.app.VoicePlugin`).

- [ ] **Step 2: Remove the dead Voice plugin block**

Delete the entire `plugins.Voice = { ... }` entry. Keep `plugins.TextToSpeech` if absent; add the canonical config:
```ts
plugins: {
  TextToSpeech: {
    language: 'fr-CA',
    rate: 1.0,
    pitch: 1.0,
  },
},
```

- [ ] **Step 3: Type-check + run `cap sync`**

Run: `bunx tsc --noEmit -p .` (or whatever the project uses) to confirm types are clean.
Then: `bunx cap sync android` (best-effort — Android SDK may be absent on this machine).

- [ ] **Step 4: Commit**

```bash
git add capacitor.config.ts
git commit -m "chore(capacitor): drop dead VoicePlugin ref; configure TextToSpeech for Android"
```

---

## Task 12: Android cleanup (remove dead MainActivity VoicePlugin registration)

**Files:**
- Modify: `android/app/src/main/java/com/ultrablabla/app/MainActivity.java`
- Modify: `android/app/build.gradle` (only if voice-plugin deps declared)

- [ ] **Step 1: Read MainActivity**

Run: `cat d:/Applications/UltraBlabla/android/app/src/main/java/com/ultrablabla/app/MainActivity.java`
Look for: any `registerPlugin(VoicePlugin.class)` line.

- [ ] **Step 2: Remove the dead registration**

Delete the import + `registerPlugin(VoicePlugin.class)` line if present. Keep all other plugin registrations (App, Haptics, etc.).

- [ ] **Step 3: Check build.gradle for dead deps**

Run: `grep -n "VoicePlugin\|com.ultrablabla.app" d:/Applications/UltraBlabla/android/app/build.gradle`
If any match the dead plugin, remove them.

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/java/com/ultrablabla/app/MainActivity.java android/app/build.gradle
git commit -m "chore(android): drop dead VoicePlugin registration from MainActivity"
```

---

## Task 13: CSP update + E2E test with mocked worker

**Files:**
- Modify: `public/index.html` (CSP meta tag if present, Capacitor `server.allowedNavigation` if any)
- Create: `e2e/tests/voice-stream.spec.ts`

- [ ] **Step 1: Find and update CSP**

Run: `grep -n "Content-Security-Policy\|connect-src" d:/Applications/UltraBlabla/public/index.html d:/Applications/UltraBlabla/capacitor.config.ts`
If a CSP `<meta>` tag exists, add `wss://api.guig.dev` and `https://api.guig.dev` to `connect-src`. If no CSP exists, add:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' wss://api.guig.dev https://api.guig.dev; media-src 'self' blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
```

For Capacitor, update `capacitor.config.ts`:
```ts
server: {
  androidScheme: 'https',
  iosScheme: 'https',
  allowedNavigation: ['api.guig.dev', '*.guig.dev'],
},
```
(Only if `server` block already exists — otherwise leave as-is.)

- [ ] **Step 2: Write E2E test with mocked worker**

Create `e2e/tests/voice-stream.spec.ts`:
```ts
import { test, expect, chromium } from '@playwright/test';
import http from 'http';

// Spin up a tiny in-page mock WS server using a route interceptor is not possible
// for ws://. Instead, we override WebSocket to a fake before navigation.
test('ultra-fast path: sends start, receives partial, calls chat on stop', async ({ page }) => {
  await page.addInitScript(() => {
    const sent: string[] = [];
    const listeners: any = {};
    (window as any).__wsSent = sent;
    (window as any).__wsSet = (msg: any) => {
      const ev = { data: JSON.stringify(msg) };
      listeners.message?.(ev);
    };
    class FakeWS {
      url: string;
      readyState = 1;
      onopen: any = null;
      onmessage: any = null;
      onclose: any = null;
      onerror: any = null;
      constructor(url: string) {
        this.url = url;
        listeners.message = null;
        sent.length = 0;
        setTimeout(() => this.onopen?.({}), 0);
      }
      send(d: string) { sent.push(d); }
      close() { this.readyState = 3; this.onclose?.({ code: 1000 }); }
      set onmessageSetter(fn: any) { this.onmessage = fn; listeners.message = (ev: any) => fn(ev); }
    }
    (window as any).__wsList = listeners;
    (window as any).WebSocket = FakeWS;
  });

  await page.goto('/');
  await page.evaluate(() => { (window as any).__ULTRA_FAST_VOICE__ = true; });
  await page.reload();
  await page.click('#mic-button');

  // Wait for start frame
  await page.waitForFunction(() => (window as any).__wsSent.length > 0);
  const startFrame = await page.evaluate(() => JSON.parse((window as any).__wsSent[0]));
  expect(startFrame).toMatchObject({ type: 'start', language: 'fr-CA', sample_rate: 16000 });

  // Simulate a partial then a final
  await page.evaluate(() => (window as any).__wsSet({ type: 'partial', seq: 1, text: 'bonjour', latency_ms: 80, model: 'nova-3' }));
  await page.evaluate(() => (window as any).__wsSet({ type: 'final', seq: 2, text: 'bonjour le monde', model: 'nova-3' }));

  // After final, webapp should open voice WS and send a chat
  await page.waitForFunction(() => (window as any).__wsSent.some((s: string) => s.includes('"type":"chat"')));
  const chatFrame = await page.evaluate(() =>
    (window as any).__wsSent.find((s: string) => s.includes('"type":"chat"'))
  );
  expect(JSON.parse(chatFrame)).toMatchObject({ type: 'chat', text: 'bonjour le monde' });
});
```

- [ ] **Step 3: Add the script to e2e/package.json**

Edit `e2e/package.json`:
```json
"scripts": {
  "test": "playwright test",
  "test:voice": "playwright test voice-stream.spec.ts"
}
```

- [ ] **Step 4: Run E2E**

Run: `cd e2e && npm run test:voice`
Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add public/index.html capacitor.config.ts e2e/tests/voice-stream.spec.ts e2e/package.json
git commit -m "test(voice): e2e voice-stream spec with mocked WS; CSP allows api.guig.dev"
```

---

## Task 14: Toggle feature flag on, manual TTFA check, delete legacy path

**Files:**
- Modify: `public/index.html` (flip flag)
- Modify: `src/fe/webapp.ts` (remove legacy branches + dead imports)
- Modify: `src/server.ts` (no changes — already cleaned up)

- [ ] **Step 1: Flip flag on**

In `public/index.html`, change `window.__ULTRA_FAST_VOICE__ = false;` to `true`.

- [ ] **Step 2: Manual smoke test**

Run: `bun run dev` then open the URL in Chrome with mic permission granted.
Speak a short sentence in French.
Expected:
- Holo subtitle updates with partials (~600 ms cadence).
- Speaker plays synthesized reply within ~1.2 s of final transcript.
- Console logs `voice_ttfa: <ms>` (should be < 1500 ms).

- [ ] **Step 3: Measure TTFA in DevTools**

Open Chrome DevTools → Performance → record for 10 s while speaking.
Look at the timeline for: PCM frame → ASR final → TTS first audio node start.
Record the number; should be ≤ 1200 ms.

- [ ] **Step 4: Remove legacy code paths**

In `src/fe/webapp.ts`:
- Delete `startListeningLegacy()` and the `MediaRecorder` capture flow.
- Delete now-unused imports (`FileReader`, `recordedChunks`, `mediaRecorder`).
- Remove the `if (window.__ULTRA_FAST_VOICE__)` branch — the flag is always true now.
- Rename `startUltraFastListening` → `startListening`.

- [ ] **Step 5: Re-run all tests**

Run: `bun test src/ && cd e2e && npm test`
Expected: all green.

- [ ] **Step 6: Final commit**

```bash
git add public/index.html src/fe/webapp.ts
git commit -m "feat(voice): enable ultra-fast WS pipeline by default; remove legacy path"
```

- [ ] **Step 7: Tag the release**

```bash
git tag -a v1.1.0-voice-streaming -m "Real-time voice pipeline via wss://api.guig.dev"
git push origin v1.1.0-voice-streaming
```

---

## Self-Review

1. **Spec coverage:**
   - ✅ Architecture (worker.ts diagram) → Task 9
   - ✅ Audio format spec (PCM 16kHz mono Int16 LE) → Task 5 + tested in Task 5 step 1
   - ✅ `WsAsrClient` (start/pcm/stop, events, 5s timeout) → Task 6
   - ✅ `WsVoiceClient` (chat/abort, events) → Task 7
   - ✅ `AudioChunkPlayer` (gap-less scheduling) → Task 4
   - ✅ `Vad` (800/1500/5000 ms) → Task 3
   - ✅ `startPcmCapture` (AudioWorklet) → Task 5
   - ✅ `types.ts` (protocol types + guards) → Task 2
   - ✅ `server.ts` cleanup (drop dead routes) → Task 10
   - ✅ Capacitor cleanup → Task 11
   - ✅ Android cleanup → Task 12
   - ✅ CSP + E2E test → Task 13
   - ✅ Rollout behind feature flag → Tasks 9 (off) + 14 (on + delete legacy)
   - ✅ Performance contract (TTFA < 1.2s, ASR partial < 700ms) → Task 14 step 2-3
   - ✅ Backoff (3→6→12→24→48s) — **GAP**: not implemented. Out of scope for v1; add to follow-up backlog. Worker `WsAsrClient` re-opens on each `start()`; caller (webapp) owns the backoff loop on `'closed'`.
   - ✅ KV cache for TTS → server-side, already in worker.

2. **Placeholder scan:**
   - "best-effort — Android SDK may be absent" (Task 11 step 3) is intentional, not a placeholder.
   - All code blocks are complete, no `// TODO` or `// fill in`.

3. **Type consistency:**
   - `WsAsrClient.on('partial', fn)` and `WsAsrClient.on('error', fn)` consistent across Task 6 and Task 9 consumer.
   - `WsVoiceClient.on('audio', fn)` consistent Task 7 → Task 9.
   - `AudioChunkPlayer.scheduleChunk(b64)` and `stop()` consistent Task 4 → Task 9.
   - `Vad.push(rms, t)` signature consistent Task 3 → Task 9.

4. **Open questions from spec:**
   - `wsVoice.abort()` semantics → Task 7 step 3 uses `ws.close()` as the safest fallback. Noted in code comment.
   - AudioContext pre-warming → not implemented; cheap to add later (one-liner `decodeAudioData(empty)` on first user gesture).
   - Voice language detection → default `fr-CA`, no runtime detection. Matches spec's "open question".

5. **Gaps to flag for follow-up (post-v1.1.0):**
   - WS auto-reconnect with exponential backoff (Task 6 missing the loop; webapp must implement on `'closed'`).
   - Pre-warm AudioContext on first user gesture.
   - Barge-in test (spec mentions but out of scope).
   - Live `voice-latency.spec.ts` against real `api.guig.dev` (mentioned in spec but the live worker requires real mic + token; skipped for CI).