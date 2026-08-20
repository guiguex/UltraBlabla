import { test, expect } from '@playwright/test';

/**
 * Ultra-fast WS voice path (Task 13).
 *
 * Runs against a LOCAL build of the app, because it asserts the wire contract of
 * src/fe/voice/* and the CSP in public/index.html. Start the dev server first:
 *
 *   bun run build && bun run dev        # http://localhost:3000
 *   cd e2e && npm run test:voice
 *
 * Override the target with VOICE_E2E_URL if the server runs elsewhere.
 * `page.goto()` is given an absolute URL so playwright.config.ts's production
 * baseURL does not leak into this spec.
 */
const APP_URL = process.env.VOICE_E2E_URL ?? 'http://localhost:3000/';
const ASR_URL = 'wss://api.guig.dev/v1/asr/stream';
const VOICE_URL = 'wss://api.guig.dev/v1/voice/stream';

/**
 * Installed before any page script runs. Replaces the three things that need
 * real I/O (WebSocket, the microphone, the PCM AudioWorklet's message port)
 * with deterministic doubles, and leaves everything else — WsAsrClient,
 * WsVoiceClient, Vad, the webapp state machine — as production code.
 *
 * `audioWorklet.addModule()` is deliberately NOT stubbed: keeping it real means
 * this test also proves the CSP allows the `blob:` worklet module that
 * startPcmCapture() creates.
 */
function installDoubles() {
  // index.html runs `window.__ULTRA_FAST_VOICE__ = false;` inline, which executes
  // AFTER this init script. A plain assignment here would be overwritten, so
  // expose an accessor whose setter swallows that write.
  Object.defineProperty(window, '__ULTRA_FAST_VOICE__', {
    configurable: true,
    get: () => true,
    set: () => { /* ignore index.html's `= false` */ },
  });

  // ---- WebSocket double -------------------------------------------------
  const sockets: any[] = [];

  class FakeWS {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    url: string;
    readyState = 0;
    sent: string[] = [];
    onopen: any = null;
    onmessage: any = null;
    onclose: any = null;
    onerror: any = null;
    private _listeners: Record<string, Function[]> = {
      open: [], message: [], close: [], error: [],
    };

    constructor(url: string) {
      this.url = url;
      sockets.push(this);
      setTimeout(() => {
        this.readyState = FakeWS.OPEN;
        this.emit('open', {});
      }, 0);
    }

    // Fires BOTH the `on<type>` property and any addEventListener handlers, so
    // the double works no matter which style the client code uses.
    emit(type: string, ev: any) {
      const direct = (this as any)['on' + type];
      if (typeof direct === 'function') direct.call(this, ev);
      for (const fn of this._listeners[type] ?? []) fn.call(this, ev);
    }

    addEventListener(type: string, fn: Function) {
      (this._listeners[type] ??= []).push(fn);
    }

    removeEventListener(type: string, fn: Function) {
      const list = this._listeners[type];
      if (list) this._listeners[type] = list.filter(f => f !== fn);
    }

    send(data: string) { this.sent.push(data); }

    close(code?: number) {
      this.readyState = FakeWS.CLOSED;
      this.emit('close', { code: code ?? 1000, reason: '' });
    }
  }
  (window as any).WebSocket = FakeWS;

  const latest = (url: string) => sockets.filter(s => s.url === url).pop();

  // Frames the page sent on the most recent socket for `url`.
  (window as any).__sent = (url: string): string[] => latest(url)?.sent.slice() ?? [];

  // Deliver a server → client frame on the most recent socket for `url`.
  (window as any).__deliver = (url: string, msg: unknown) => {
    const ws = latest(url);
    if (!ws) throw new Error(`no WebSocket open for ${url}`);
    ws.emit('message', { data: JSON.stringify(msg) });
  };

  // ---- Microphone double ------------------------------------------------
  // A real MediaStream (so ctx.createMediaStreamSource() works) that needs no
  // audio hardware and no --use-file-for-fake-audio-capture file.
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  const md: any = navigator.mediaDevices ?? {};
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', { value: md, configurable: true });
  }
  md.getUserMedia = async () => {
    const ctx = new AudioCtor();
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    osc.connect(dest);
    osc.start();
    return dest.stream;
  };

  // ---- AudioWorkletNode double ------------------------------------------
  // Returns a REAL GainNode (so sourceNode.connect(node) / node.disconnect()
  // behave) carrying a fake `port`, which lets the test feed RMS values into
  // the production Vad instead of depending on the worklet actually rendering.
  const worklets: any[] = [];
  (window as any).AudioWorkletNode = function (ctx: AudioContext) {
    const node: any = ctx.createGain();
    node.port = { onmessage: null, postMessage() { /* noop */ } };
    worklets.push(node);
    return node;
  };

  (window as any).__pushRms = (value: number) => {
    const node = worklets[worklets.length - 1];
    node?.port?.onmessage?.({ data: { kind: 'rms', value } });
  };
}

/** Frames of a given `type` that the page sent on `url`. */
async function sentFrames(page: import('@playwright/test').Page, url: string, type: string) {
  return page.evaluate(
    ([u, t]) =>
      ((window as any).__sent(u) as string[]).filter(s => {
        try { return JSON.parse(s).type === t; } catch { return false; }
      }),
    [url, type] as const,
  );
}

test('ultra-fast path: sends start, streams partial/final, then chats over the voice socket', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', m => {
    // A blocked blob: worklet surfaces here as a CSP violation.
    if (m.type() === 'error') pageErrors.push(m.text());
  });

  await page.addInitScript(installDoubles);
  await page.goto(APP_URL);

  await page.click('#recordBtn');

  // --- 1. start frame -----------------------------------------------------
  await page.waitForFunction(u => (window as any).__sent(u).length > 0, ASR_URL);
  const [startRaw] = await sentFrames(page, ASR_URL, 'start');
  expect(startRaw, 'ASR socket must receive a start frame').toBeTruthy();
  expect(JSON.parse(startRaw)).toMatchObject({
    type: 'start',
    language: 'fr-CA',
    sample_rate: 16000,
  });

  // --- 2. ready -----------------------------------------------------------
  // webapp.ts only calls wsAsr.stop() once `ready` has arrived (task-6 carry
  // forward: send('stop') on a CONNECTING socket throws InvalidStateError).
  await page.evaluate(
    u => (window as any).__deliver(u, { type: 'ready', model: 'nova-3', fallback: 'whisper' }),
    ASR_URL,
  );

  // --- 3. partial renders in the holographic subtitles ---------------------
  await page.evaluate(
    u => (window as any).__deliver(u, {
      type: 'partial', seq: 1, text: 'bonjour', latency_ms: 80, model: 'nova-3',
    }),
    ASR_URL,
  );
  await expect(page.locator('#holo-subtitles')).toContainText('bonjour');

  // --- 4. drive the real Vad to end-of-utterance ---------------------------
  // Vad defaults: rmsThreshold 0.02, silenceMs 1500. webapp polls vad.push()
  // every 100 ms, so one loud reading (~3 polls) then a quiet one yields
  // 'silence' ≈ 1.5 s later, well before the 5 s hard cap.
  await page.evaluate(() => (window as any).__pushRms(0.5));
  await page.waitForTimeout(300);
  await page.evaluate(() => (window as any).__pushRms(0));

  await expect
    .poll(() => sentFrames(page, ASR_URL, 'stop').then(f => f.length), { timeout: 15_000 })
    .toBe(1);

  // --- 5. final resolves stop() and triggers the chat ----------------------
  await page.evaluate(
    u => (window as any).__deliver(u, {
      type: 'final', seq: 2, text: 'bonjour le monde', model: 'nova-3',
    }),
    ASR_URL,
  );

  await expect
    .poll(() => sentFrames(page, VOICE_URL, 'chat').then(f => f.length), { timeout: 10_000 })
    .toBe(1);

  const [chatRaw] = await sentFrames(page, VOICE_URL, 'chat');
  expect(JSON.parse(chatRaw)).toMatchObject({
    type: 'chat',
    text: 'bonjour le monde',
    voice: 'fr-female-1',
  });

  // CSP must not have blocked the blob: AudioWorklet module.
  expect(pageErrors.filter(e => /Content Security Policy|addModule|worklet/i.test(e))).toEqual([]);
});
