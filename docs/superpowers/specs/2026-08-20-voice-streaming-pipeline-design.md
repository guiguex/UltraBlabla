---
title: Real-Time Voice Streaming Pipeline — Design Spec
date: 2026-08-20
status: approved (Approach A + Full Overhaul)
author: brainstorming session
---

# Real-Time Voice Streaming Pipeline

## Context

UltraBlabla brands itself as a "Cloudflare Edge" voice assistant but is in fact a thin
Bun + Elysia proxy that buffers Opus-in-WebM blobs, POSTs them to `/api/voice/pipeline`,
forwards to `https://api.guig.dev`, then buffers the entire MP3 reply before any audio
plays. **Three sequential network hops + full-buffer playback** = perceived TTFA in the
3–6 s range.

Meanwhile, the upstream CF Worker (`portfolio/cloudflare-ai`, deployed at `api.guig.dev`)
already exposes three real-time WebSocket endpoints with proven sub-second TTFA:

| Endpoint | Purpose | Protocol | TTFA |
|----------|---------|----------|------|
| `wss://api.guig.dev/v1/asr/stream` | Streaming ASR | JSON envelopes, base64 Int16 PCM 16 kHz | partial @ 600 ms |
| `wss://api.guig.dev/v1/voice/stream` | Sentence-streaming TTS | JSON envelopes, base64 WAV chunks | **0.6–1.2 s** |
| `wss://api.guig.dev/v1/chat/stream` | LLM token stream | SSE-in-JSON | TTFT <500 ms |

The fix is to **wire UltraBlabla's frontend directly to those endpoints** instead of
re-routing through an HTTP proxy. The Bun proxy is kept only for Turnstile/admin.
This requires zero new infrastructure, mirrors an architecture already proven in
production at `api.guig.dev`, and unlocks the 3–6 s → <1.5 s latency target.

## Goals (measured, not aspirational)

1. **TTFA < 1.2 s** for any utterance ≤ 35 words (matches portfolio's measured number).
2. **ASR partial latency < 700 ms** after 600 ms of silence in the rolling PCM buffer.
3. **Zero audible gap** between consecutive TTS chunks (sample-accurate scheduling).
4. **WS auto-reconnect** with exponential backoff (3 → 6 → 12 → 24 → 48 s, cap 60 s).
5. **Capacitor Android** continues to work via the same webapp code (no platform fork).

## Non-Goals

- Deploying a new Cloudflare Worker. UltraBlabla stays a Bun proxy.
- Replacing the underlying AI providers (we keep using `api.guig.dev`).
- On-device ASR (Whisper/TFLite). Network round-trip is fast enough at 16 kHz mono.
- Local on-device TTS. The remote `gemini-3.1-flash-tts` already meets the TTFA target.

## Architecture

### Component diagram

```
┌─────────────────────────────────────────────────┐     ┌──────────────────────────┐
│ [UltraBlabla Browser — webapp.ts]                │     │ [CF Worker api.guig.dev] │
│                                                  │     │                          │
│  AudioContext 48k/44.1k                          │     │  /v1/asr/stream (WSS)    │
│   ↓                                              │     │   ├─ nova-3 (primary)    │
│  AudioWorklet pcm-16k-processor                  │     │   └─ whisper-l-v3-turbo  │
│   ├─ decimates by ratio (srcRate/16000)          │     │                          │
│   ├─ emits transferable Int16Array.buffer @100ms │     │  /v1/voice/stream (WSS)  │
│   └─ posts RMS level @10Hz → VAD                 │     │   ├─ qwq-32b stream      │
│        ↓                                         │     │   ├─ gemini-flash-tts    │
│  wsAsrClient.sendPcm(frame)                      │     │   └─ minimax-speech-2.8  │
│        └──── wss://api.guig.dev/v1/asr/stream ──→│ ─→  │                          │
│                ↑↓ JSON {partial, final}          │ ←─ │                          │
│                ↓                                 │     │                          │
│  vad.ts detects end → onFinal(text)              │     │                          │
│        ↓                                         │     │                          │
│  wsVoiceClient.chat(text, voice)                 │     │                          │
│        └──── wss://api.guig.dev/v1/voice/stream ─│ ─→  │                          │
│                ↑↓ JSON {token, audio:<WAV b64>}  │ ←─ │                          │
│                ↓                                 │     │                          │
│  audioPlayer.scheduleChunk(b64)                  │     │                          │
│   ├─ decodeAudioData (WAV or MP3 wrapped in WAV) │     │                          │
│   ├─ source.start(nextStartTime)                 │     │                          │
│   └─ nextStartTime += buffer.duration            │     │                          │
│        ↓                                         │     │                          │
│  Speaker output                                  │     │                          │
└─────────────────────────────────────────────────┘     └──────────────────────────┘
```

### Audio format spec

| Layer | Format | Sample rate | Channels | Bit depth | Notes |
|--------|--------|-------------|----------|-----------|-------|
| Mic capture (browser) | Float32 planar | native 48k/44.1k | mono | — | AudioWorklet input |
| ASR wire (`/v1/asr/stream`) | Int16 LE PCM | 16 kHz | mono | 16 | Base64 in `{type:"pcm"}` |
| ASR frames | chunked | — | — | — | 100 ms = 3200 samples ≈ 6.4 KB raw, ~8.5 KB b64 |
| TTS output (worker → client) | WAV (RIFF + PCM or MP3-in-WAV) | 24 kHz (Gemini) | mono | 16 | Base64 in `{type:"audio"}` |
| TTS playback | decoded AudioBuffer | as decoded | mono | — | scheduled sample-accurate |

## Components

### New modules (`src/fe/voice/`)

#### 1. `pcmWorklet.ts` — AudioWorklet loader

Inlines `pcm-16k-processor.js` as a string (the file is small, ~70 lines). Loads it via
`ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([source], { type: 'application/javascript' })))`.

Processor logic (adapted from `portfolio/src/services/voiceClient.ts:startPcmCapture`):

```js
class PCM16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;          // 3 for 48k → 16k
    this.acc = [];                            // leftover samples
    this.buffer = new Float32Array(1600);     // 100 ms @ 16k
    this.bufferPos = 0;
    this.frames = 0;
  }
  process(inputs) {
    const ch = inputs[0][0];                  // mono
    for (let i = 0; i < ch.length; i++) {
      if (this.bufferPos >= this.buffer.length) {
        const int16 = new Int16Array(this.buffer.length);
        for (let j = 0; j < this.buffer.length; j++) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]));
          int16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        this.port.postMessage(int16.buffer, [int16.buffer]);
        this.bufferPos = 0;
      }
      const srcIdx = (this.frames * this.ratio) | 0;
      if (i === srcIdx) this.buffer[this.bufferPos++] = ch[i];
      this.frames++;
    }
    return true;
  }
}
registerProcessor('pcm-16k', PCM16kProcessor);
```

#### 2. `wsAsrClient.ts` — ASR WebSocket wrapper

State machine + reconnect (mirrors `useWSChat.ts` backoff):

```ts
type AsrEvents = {
  ready: (model: string, fallback: string) => void;
  partial: (text: string, seq: number, latency_ms: number) => void;
  final:   (text: string, seq: number) => void;
  error:   (msg: string) => void;
  closed:  (code: number, reason: string) => void;
};

export class WsAsrClient {
  constructor(url = 'wss://api.guig.dev/v1/asr/stream', opts?: { language?: string });
  start(): void;                              // opens socket, sends {type:'start'}
  sendPcm(frame: Int16Array): void;           // base64-encode + send {type:'pcm', seq}
  stop(): Promise<string>;                    // sends {type:'stop'}, resolves on 'final' or 5s timeout
  on<E extends keyof AsrEvents>(e: E, fn: AsrEvents[E]): () => void;
  close(): void;
}
```

Key behaviors:
- Auto-reconnect with backoff on unexpected close; resets on `start()`.
- `seq` counter monotonic per session.
- 5-second hard timeout on `stop()` — resolves with last partial if no `final`.
- Sends `{type:'start', language:'fr-CA', sample_rate:16000}` once on connect.

#### 3. `wsVoiceClient.ts` — Voice WebSocket wrapper

```ts
type VoiceEvents = {
  ready:   () => void;
  token:   (content: string) => void;
  audio:   (b64: string, format: 'wav') => void;
  done:    (content: string, ttfa_ms: number) => void;
  error:   (msg: string) => void;
};

export class WsVoiceClient {
  constructor(url = 'wss://api.guig.dev/v1/voice/stream');
  chat(text: string, opts?: { voice?: string; system?: string }): void;
  abort(): void;                              // for barge-in
  on<E extends keyof VoiceEvents>(e: E, fn: VoiceEvents[E]): () => void;
  close(): void;
}
```

`abort()` sends a control frame (or just closes the socket, opens a new one — TBD in
implementation; whichever the worker supports cleanly).

#### 4. `audioPlayer.ts` — Gap-less chunk player

Adapted from `voiceClient.ts:AudioChunkPlayer`:

```ts
export class AudioChunkPlayer {
  constructor(ctx?: AudioContext);
  async scheduleChunk(b64: string): Promise<void>;
  stop(): void;                               // ramps gain, stops sources
  isPlaying(): boolean;
  onEnd(fn: () => void): () => void;
}
```

Internals:
- Single shared `AudioContext` (created lazily, resumed on first user gesture).
- Each `scheduleChunk`:
  1. `bytes = base64ToBytes(b64)`
  2. `buffer = await ctx.decodeAudioData(bytes.buffer.slice(0))` — `.slice(0)` detaches the
     underlying buffer so the next decode doesn't see a neutered `ArrayBuffer`
     (Chromium requirement).
  3. `source = ctx.createBufferSource(); source.buffer = buffer;`
  4. `startAt = Math.max(this.nextStartTime, ctx.currentTime + 0.02)` — 20 ms safety
     margin against decode latency.
  5. `source.start(startAt); source.connect(ctx.destination);`
  6. `this.nextStartTime = startAt + buffer.duration;`
- Pending chunks queue serially in `drain()` — a slow decode cannot reorder chunks.
- `stop()` sets `gainNode.gain.linearRampToValueAtTime(0.001, now + 0.035)` then
  `setTimeout(() => source.stop(), 40)` to avoid the race documented in webapp.ts:493.

#### 5. `vad.ts` — RMS-based voice activity detection

```ts
export class Vad {
  constructor(opts?: { minSpeechMs?: number; silenceMs?: number; rmsThreshold?: number });
  push(rms: number, t: number): 'speech' | 'silence' | 'idle';
  reset(): void;
}
```

Constants (from portfolio):
- `MIN_SPEECH_MS = 800`
- `SILENCE_MS = 1500`
- `RMS_THRESHOLD = 0.02`
- Hard 5 s cap on silence detection (matches `asr.stop()` timeout).

#### 6. `types.ts` — Shared protocol types

```ts
export type AsrStart = { type: 'start'; language?: string; sample_rate?: number };
export type AsrPcm   = { type: 'pcm';   seq: number; data: string };
export type AsrStop  = { type: 'stop' };
export type AsrServerMsg =
  | { type: 'ready';   model: string; fallback: string }
  | { type: 'partial'; seq: number; text: string; latency_ms: number; model: string }
  | { type: 'final';   seq: number; text: string; model: string }
  | { type: 'error';   message: string };
// mirror for voice/stream
```

### Modified files

#### `src/fe/webapp.ts` — Refactor to use voice/* modules

Replace the MediaRecorder capture path with `pcmWorklet`. The state machine stays
(idle → listening → speaking → idle) but transitions are now driven by VAD events
and `wsAsrClient.on('final')` / `wsVoiceClient.on('done')`.

Key changes:
- Drop `mediaRecorder`, `recordedChunks[]`, `FileReader.readAsDataURL`, base64-of-WebM.
- Add `wsAsr`, `wsVoice`, `pcmCapture`, `audioPlayer`, `vad` instances.
- `startListening()`:
  1. `await wsAsr.start()`
  2. `await pcmCapture.start({ onFrame: wsAsr.sendPcm, onRms: vad.push })`
- `stopListening()`:
  1. `pcmCapture.stop()`
  2. `const text = await wsAsr.stop()` — returns final or last partial
  3. `wsVoice.chat(text, { voice: this.currentVoice() })`
- `onPartial(text)`: update holo subtitle (CSS typewriter kept)
- `wsVoice.on('audio')`: `audioPlayer.scheduleChunk(b64)`
- `wsVoice.on('done')`: `audioPlayer.onEnd(() => state = 'idle')`
- **Keep** all the existing UI/visuals (holographic effect, neural-effects.js, etc.).
- **Remove** the `WebM` MIME-type dance, `FileReader`, and `decodeAudioData(arrayBuffer)`
  for the response blob — those are gone.

#### `src/server.ts` — Strip dead voice proxy routes

Delete:
- `/api/voice/pipeline`
- `/api/voice/transcribe`
- `/api/voice/speak`
- `/api/voice/voices`

Keep:
- `/api/chat` (LLM proxy, useful for text-mode)
- `/api/config`
- Static `/static/*` (Elysia static plugin)
- Turnstile-aware proxy helpers (`getProxyHeaders`)

Add `cors` allowlist for `wss://api.guig.dev` so the frontend can connect (technically
the WebSocket itself doesn't need server-side CORS, but OPTIONS preflights on HTTP
fallbacks do).

#### `capacitor.config.ts` — Remove dead plugin

Drop the `plugins.Voice` block. Keep `@capacitor-community/text-to-speech` and add
proper config under `plugins.TextToSpeech`.

#### `android/app/src/main/java/com/ultrablabla/app/MainActivity.java` — Remove bridge

Drop the `VoicePlugin` registration (file never existed anyway, but Capacitor 8 warns
on missing plugins). Wire `@capacitor-community/text-to-speech` initialization only.

#### `android/app/build.gradle` — Remove voice plugin deps

Drop `com.ultrablabla.app.VoicePlugin` references if any.

#### `package.json`

- Move `@capacitor-community/text-to-speech` into `dependencies` (it already is)
  and ensure webapp.ts uses it as the Android fallback path:
  ```ts
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    // delegate TTS to native
  }
  ```

### Tests (`e2e/tests/`)

#### `voice-stream.spec.ts` (Playwright)

End-to-end happy path with a mocked `wss://api.guig.dev/v1/asr/stream` server:

```ts
test('captures mic, streams PCM, gets partial + final', async ({ page }) => {
  const mock = await mockAsrServer(page, {
    partials: ['bonjour', 'bonjour comment', "bonjour comment ça va"],
  });
  await page.goto('/');
  await page.click('#mic-button');
  await page.evaluate(() => fakeSpeech(2000));   // 2 s of synthetic PCM via AudioContext
  await expect(page.locator('#holo-subtitle')).toHaveText(/comment ça va/);
  await mock.close();
});
```

#### `voice-latency.spec.ts`

Against real `api.guig.dev` (gated by `RUN_LIVE_TESTS=1` env var):

```ts
test('TTFA < 1500ms for short utterance', async ({ page }) => {
  const t0 = Date.now();
  let ttfa = 0;
  page.on('console', (msg) => {
    if (msg.text().startsWith('voice_ttfa:')) ttfa = +msg.text().slice(10);
  });
  await page.click('#mic-button');
  await page.evaluate(() => fakeSpeech(1500));
  await page.waitForFunction(() => (window as any).__firstAudioPlayed);
  expect(ttfa).toBeLessThan(1500);
});
```

## Performance contract

| Metric | Target | Source of truth |
|--------|--------|-----------------|
| TTFA (TTS) | < 1.2 s | `wsVoice.done.ttfa_ms` |
| ASR partial latency | < 700 ms | `partial.latency_ms` |
| Buffer playback gap | 0 ms | sample-accurate `nextStartTime` scheduling |
| WS reconnect backoff | 3 → 6 → 12 → 24 → 48 s, cap 60 s, 5 retries | `WsAsrClient`/`WsVoiceClient` |
| ASR stop timeout | 5 s hard | `WsAsrClient.stop()` |

## Error handling

| Failure | Behavior |
|---------|----------|
| WS auth failure (401) | Show "session expirée", offer reconnect button |
| WS unexpected close | Exponential backoff auto-reconnect, surface error after 5 retries |
| ASR `error` event | Show inline "je n'ai pas compris", no auto-restart |
| TTS `error` event | Show "synthèse indisponible", retry once after 2 s |
| Mic permission denied | Persistent banner with instructions |
| CSP blocks `wss://api.guig.dev` | Update `<meta http-equiv="Content-Security-Policy">` and Capacitor `server.allowedNavigation` |
| Echo loop (TTS picks up its own audio) | Don't close `getUserMedia` between turns; tighten VAD silence threshold post-TTS |

## Risks & mitigations

1. **CSP `connect-src`**. Current `public/index.html` likely only allows `'self'`. Add
   `wss://api.guig.dev` and `https://api.guig.dev` to the directive. Same in Capacitor
   `server.androidScheme`/`iosScheme`.
2. **Echo during TTS**. The mic stream stays open across TTS playback; VAD RMS threshold
   must ignore the TTS signal. Mitigation: post-TTS, raise RMS threshold to 0.05 for
   500 ms while speaker ramps down.
3. **Android WebView AudioWorklet support**. Chrome 80+ supports it; Capacitor 8 ships
   WebView ≥ Chrome 100. Verified by `@capacitor/core` version check.
4. **Worker rate-limits nova-3**. Frontend must respect 429s; add a per-WS backoff with
   `Retry-After` header honored.
5. **iOS Safari quirks** (out of scope but flagged): `AudioContext` must be resumed on
   user gesture; AudioWorklet fallback to ScriptProcessor if `audioWorklet` undefined.
6. **Barge-in**. First cut: `audioPlayer.stop()` + `wsVoice.abort()`. Worker side support
   for `abort` TBD — fallback is closing the socket (loses stream continuity).

## Verification plan

- [ ] Unit: `WsAsrClient` protocol round-trips with mock WS (Vitest, see
      `portfolio/cloudflare-ai/scripts/smoke.ts` for the model).
- [ ] Unit: `WsVoiceClient` accumulates tokens, queues audio chunks in order.
- [ ] Unit: `AudioChunkPlayer` schedules decode → startAt without overlap (mocked
      `AudioContext`).
- [ ] Unit: `Vad` transitions through speech → silence correctly under noise.
- [ ] E2E: `voice-stream.spec.ts` mocks `api.guig.dev` and exercises the full mic →
      WS → TTS → speaker path with a synthetic PCM source.
- [ ] Live (gated by env): `voice-latency.spec.ts` measures TTFA against the real
      worker.
- [ ] Manual: speech-to-speech round-trip in `bun run dev`, observe TTFA in DevTools
      Performance panel.

## Rollout

1. Land the new `src/fe/voice/*` modules behind a feature flag `ULTRA_FAST_VOICE`
   (default off) so we can A/B test.
2. Wire `webapp.ts` to read the flag and choose between the old `MediaRecorder` path
   and the new WS path. Keep both working for one release.
3. Toggle flag to `true` in `public/index.html` config; capture metrics.
4. After one week of healthy metrics, delete the legacy path.

## Out of scope for this spec

- Server-side changes to `api.guig.dev` — already deployed.
- LLM streaming (`/v1/chat/stream`) — keep using `/api/chat` proxy for non-voice replies.
- Capacitor push notifications, deep links, app icons, store metadata.
- Wails desktop WebView2 specifics — same webapp code runs in WebView2; verify after
  flag rollout.

## Open questions

1. **`wsVoice.abort()` semantics**: does the worker support an in-band abort frame,
   or do we close + reopen the socket? Worker inspection needed.
2. **AudioContext pre-warming**: warm the context on app load (silent `decodeAudioData`)
   to shave ~30 ms off first `scheduleChunk`? Cheap win if yes.
3. **Voice language defaults**: switch `language` based on detected locale, or keep
   `fr-CA` as the only default?

These can be answered during implementation; none block the design above.