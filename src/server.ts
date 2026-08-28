import { Elysia } from 'elysia';

// ─── Configuration des Backends (Docker C++ CUDA Local + Fallback Cloudflare) ───
const ASR_BACKEND_URL = (process.env.ASR_BACKEND_URL || 'http://localhost:41238').replace(/\/+$/, '');
const TTS_BACKEND_URL = (process.env.TTS_BACKEND_URL || 'http://localhost:41237').replace(/\/+$/, '');
const TTS_SIDECAR_URL = (process.env.TTS_SIDECAR_URL || 'http://localhost:5000').replace(/\/+$/, '');
// LLM local léger pour le chat texte (Qwen3-1.7B ≈ 1.2 GB VRAM)
const LLM_BACKEND_URL = (process.env.LLM_BACKEND_URL || process.env.CLASSIFIER_BACKEND_URL || 'http://api.guig.dev/v1').replace(/\/+$/, '');
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || process.env.CLASSIFIER_MODEL || '@cf/zai-org/glm-5.3-flash';
// 2026-08-28: Qwen2-Audio sur conteneur llama.cpp dédié. Pas de fallback Cloudflare
// (Workers AI n'expose pas ce modèle multimodal audio) — si le container est down,
// l'enrichissement émotionnel est simplement skippé (non bloquant).
const AUDIO_LLM_URL = (process.env.AUDIO_LLM_URL || '').replace(/\/+$/, '');
const AUDIO_LLM_MODEL = process.env.AUDIO_LLM_MODEL || 'qwen2-audio-7b';
const AI_API_URL = (process.env.AI_API_URL || 'https://api.guig.dev').replace(/\/+$/, '');
const PORT = Number(process.env.PORT) || 3000;

// Helper: Générer un WAV Header 16kHz Mono 16-bit
function createWavHeader(pcmLength: number, sampleRate = 16000, numChannels = 1): Uint8Array {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmLength, true);
  return new Uint8Array(buffer);
}

// ─── Proxy Universel avec Priorité Docker C++ & Fallback Cloudflare ─────────
const proxyWithFallback = async (request: Request, localBackend: string, cloudBackend: string, rewritePath?: string): Promise<Response> => {
  const incomingHeaders = request.headers;
  const headers = new Headers(incomingHeaders);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  headers.delete('keep-alive');
  headers.delete('transfer-encoding');

  let bodyBuffer: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyBuffer = await request.arrayBuffer();
  }

  const url = new URL(request.url);
  const pathname = rewritePath || url.pathname;

  // 1) Essai Prioritaire Local Docker C++
  if (localBackend) {
    try {
      const localBackendUrl = new URL(localBackend);
      const targetLocal = `${localBackendUrl.origin}${pathname}${url.search}`;
      const localRes = await fetch(targetLocal, {
        method: request.method,
        headers,
        body: bodyBuffer,
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      });
      if (localRes.ok) {
        const resHeaders = new Headers(localRes.headers);
        resHeaders.set('x-voice-source', 'docker-local-cpp');
        return new Response(localRes.body, { status: localRes.status, headers: resHeaders });
      }
    } catch {}
  }

  // 2) Fallback Cloudflare
  try {
    const cloudBackendUrl = new URL(cloudBackend);
    const targetCloud = `${cloudBackendUrl.origin}${pathname}${url.search}`;
    const cloudHeaders = new Headers(headers);
    cloudHeaders.set('Origin', 'https://guig.dev');
    cloudHeaders.set('User-Agent', 'UltraBlabla-Voice-Matrix/5.0');
    if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
      cloudHeaders.set('Authorization', `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`);
    }
    const cloudRes = await fetch(targetCloud, {
      method: request.method,
      headers: cloudHeaders,
      body: bodyBuffer,
      redirect: 'manual',
      signal: AbortSignal.timeout(8000)
    });
    const resHeaders = new Headers(cloudRes.headers);
    resHeaders.set('x-voice-source', 'cloudflare-cloud');
    return new Response(cloudRes.body, { status: cloudRes.status, headers: resHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Erreur proxy vocal: ' + error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

const wsAsrBuffers = new Map<string, Buffer[]>();
const activeVoiceStreams = new Map<string, AbortController>();

// 2026-08-28: Emotion cache — non-blocking Qwen2-Audio. Map<sessionId, {hint, ts}>.
// Skip emotion ce tour, cache pour le prochain. Latence tour N: 300ms (LLM seul).
// Tour N+1: prompt enrichi via cache, Qwen2-Audio lancé en background pour tour N+2.
const EMOTION_CACHE_TTL_MS = 8000;
const emotionCache = new Map<string, { hint: string; timestamp: number }>();

function getCachedEmotion(sessionId: string): string | null {
  const cached = emotionCache.get(sessionId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > EMOTION_CACHE_TTL_MS) {
    emotionCache.delete(sessionId);
    return null;
  }
  return cached.hint;
}

function storeCachedEmotion(sessionId: string, hint: string): void {
  emotionCache.set(sessionId, { hint, timestamp: Date.now() });
}

// Fire-and-forget Qwen2-Audio emotion extraction.
// Runs en parallèle du LLM, le résultat sera utilisé au tour suivant.
// Retourne la Promise (non awaited) pour tracking.
function startEmotionExtraction(
  sessionId: string,
  audioB64: string,
  signal: AbortSignal
): Promise<string | null> {
  if (!AUDIO_LLM_URL) return Promise.resolve(null);
  return (async () => {
    try {
      const pcmBuf = Buffer.from(audioB64, 'base64');
      const wavHeader = createWavHeader(pcmBuf.length, 16000, 1);
      const fullWavBuf = Buffer.concat([Buffer.from(wavHeader), pcmBuf]);
      const audioRes = await fetch(`${AUDIO_LLM_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AUDIO_LLM_MODEL,
          messages: [{
            role: 'user',
            content: [
              { type: 'input_audio', input_audio: { data: fullWavBuf.toString('base64'), format: 'wav' } },
              { type: 'text', text: 'Évalue en 1 phrase très courte (max 12 mots) : ton émotionnel de cette voix. Forme: "Ton : [adj]. [Émotion]. [Registre]." Pas de markdown.' }
            ]
          }],
          max_tokens: 40,
          temperature: 0.1
        }),
        signal: AbortSignal.any([signal, AbortSignal.timeout(2500)])
      });
      if (!audioRes.ok) return null;
      const audioJson: any = await audioRes.json();
      return (audioJson.choices?.[0]?.message?.content || '').trim() || null;
    } catch {
      return null;
    }
  })();
}

const app = new Elysia()
  // ─── Fichiers Statiques & PWA ────────────────────────────────────
  .get('/', async ({ set }) => {
    set.headers['Content-Type'] = 'text/html';
    const file = Bun.file(new URL('../public/index.html', import.meta.url));
    return file;
  })
  .get('/*', async ({ params, set }) => {
    const path = params['*'];
    if (!path) return new Response('Not found', { status: 404 });

    const file = Bun.file(new URL(`../public/${path}`, import.meta.url));
    if (await file.exists()) {
      const ext = path.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'css': 'text/css;charset=utf-8',
        'js': 'application/javascript;charset=utf-8',
        'html': 'text/html;charset=utf-8',
        'png': 'image/png',
        'ico': 'image/x-icon',
        'webmanifest': 'application/manifest+json',
        'apk': 'application/vnd.android.package-archive',
        'aab': 'application/octet-stream'
      };
      if (ext && mimeTypes[ext]) {
        set.headers['Content-Type'] = mimeTypes[ext];
        if (ext === 'apk') {
          set.headers['Content-Disposition'] = 'attachment; filename="UltraBlabla.apk"';
        }
      }
      return file;
    }
    set.status = 404;
    return 'Not found';
  })

  // ─── Statut & Configuration ─────────────────────────────────────
  .get('/api/config', () => ({
    status: 'online',
    version: '5.1.0-qwen2audio-native',
    backends: {
      asrLocal: ASR_BACKEND_URL,
      ttsLocal: TTS_BACKEND_URL,
      sidecar: TTS_SIDECAR_URL,
      llmLocal: LLM_BACKEND_URL,
      audioLlmModel: AUDIO_LLM_MODEL,
      cloudFallback: AI_API_URL,
    },
    features: ['local-qwen-asr-cpp', 'local-tts-server-cpp', 'qwen2-audio-native-multimodal', 'qwen3-1.7b-text-chat', 'cloud-fallback', 'pcm-streaming', 'vad']
  }))
  .get('/healthz', () => ({ status: 'ok', uptime: process.uptime() }))

  // ─── Routing Voix & TTS ──────────────────────────────────────────
  .all('/api/voice/voices', ({ request }) => proxyWithFallback(request, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/voices'))
  .all('/v1/audio/voices', ({ request }) => proxyWithFallback(request, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/voices'))
  .all('/api/voice/speak', ({ request }) => proxyWithFallback(request, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/speech'))
  .all('/v1/audio/speech', ({ request }) => proxyWithFallback(request, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/speech'))

  // ─── Routing ASR (Transcription) ─────────────────────────────────
  .all('/api/voice/transcribe', ({ request }) => proxyWithFallback(request, ASR_BACKEND_URL, AI_API_URL, '/v1/audio/transcriptions'))
  .all('/v1/audio/transcriptions', ({ request }) => proxyWithFallback(request, ASR_BACKEND_URL, AI_API_URL, '/v1/audio/transcriptions'))

  // 2026-08-28: pointe vers AUDIO_LLM_URL (container llama.cpp) qui comprend l'audio.
  // Le path /v1/audio/classify est réécrit en /chat/completions (endpoint multimodal llama.cpp).
  .all('/api/voice/classify', ({ request }) => proxyWithFallback(request, AUDIO_LLM_URL, AI_API_URL, '/chat/completions'))
  .all('/v1/audio/classify', ({ request }) => proxyWithFallback(request, AUDIO_LLM_URL, AI_API_URL, '/chat/completions'))
  // .all('/v1/audio/classify', ({ request }) => proxyWithFallback(request, LLM_BACKEND_URL, AI_API_URL, '/v1/audio/classify'))

  // ─── Routing Sidecar Python (Design de Voix & Alignement) ─────────
  .all('/v1/audio/voice/clone', ({ request }) => proxyWithFallback(request, TTS_SIDECAR_URL, AI_API_URL))
  .all('/v1/audio/voice/design', ({ request }) => proxyWithFallback(request, TTS_SIDECAR_URL, AI_API_URL))
  .all('/v1/audio/transcribe_with_alignment', ({ request }) => proxyWithFallback(request, TTS_SIDECAR_URL, AI_API_URL))

  // ─── Routing LLM ─────────────────────────────────────────────────
  .all('/api/chat', ({ request }) => proxyWithFallback(request, '', AI_API_URL, '/v1/chat/completions'))
  .all('/v1/chat/completions', ({ request }) => proxyWithFallback(request, '', AI_API_URL, '/v1/chat/completions'))

  // ─── WebSocket: Voice Stream Ultra-Rapide (Local C++ -> Fallback Cloud + Barge-In) ───
  .ws('/v1/voice/stream', {
    close(ws) {
      activeVoiceStreams.get(ws.id)?.abort();
      activeVoiceStreams.delete(ws.id);
    },
    async message(ws, message: any) {
      let data: any;
      try {
        data = typeof message === 'string' ? JSON.parse(message) : message;
      } catch {
        return;
      }

      // Gestion du Barge-In (Interruption utilisateur)
      if (data.type === 'interrupt') {
        const existingCtrl = activeVoiceStreams.get(ws.id);
        if (existingCtrl) {
          existingCtrl.abort();
          activeVoiceStreams.delete(ws.id);
        }
        ws.send(JSON.stringify({ type: 'interrupted', timestamp: Date.now() }));
        return;
      }

      if (data.type !== 'chat' || !data.text) return;

      // Annuler toute génération précédente en cours sur ce socket
      activeVoiceStreams.get(ws.id)?.abort();
      const abortCtrl = new AbortController();
      activeVoiceStreams.set(ws.id, abortCtrl);

      ws.send(JSON.stringify({ type: 'ready' }));

      const startMs = Date.now();
      const voice = data.voice || 'guillaume';
      const userText = data.text;
      const userAudioB64: string | undefined = data.audio; // PCM base64 envoyé par le frontend
      const BASE_SYSTEM = data.system || `Tu es UltraBlabla, une IA vocale ultra-réactive, chaleuréuse et naturelle.
Réponds de manière concise, directe et vivante (1 phrase courte à l'oral, ≤ 15 mots).
Commence TOUJOURS ta réponse par un mot d'amorce court suivi d'une virgule (ex: "Oui,", "D'accord,", "En fait,", "Absolument,", "Bien sûr,", "Regarde,").
Jamais de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;

      // ── Étape 0 : Enrichissement émotionnel Québécois via Qwen2-Audio (NON-BLOQUANT) ──
      // Stratégie cache: tour N utilise émotion du tour N-1 (cache 8s).
      // Tour N lance Qwen2-Audio en background pour tour N+1.
      // Latence ajoutée: 0ms (au lieu de 1066ms séquentiel).
      let systemPrompt = BASE_SYSTEM;
      const sessionId: string = String(data.session_id || '').trim();
      const stableSession = sessionId || `anon-${ws.id}`;

      // 1. Lookup cache (rapide, pas de fetch)
      const cachedEmotion = getCachedEmotion(ws.id);
      if (cachedEmotion) {
        systemPrompt = `${BASE_SYSTEM}
[Contexte émotionnel de l'utilisateur : ${cachedEmotion} Adapte ton registre en conséquence, reste naturel et québécois.]`;
        console.info('[emotion] cache hit:', cachedEmotion.slice(0, 40));
      }

      // 2. Lance Qwen2-Audio en background (fire-and-forget), cache pour le prochain tour
      if (userAudioB64 && AUDIO_LLM_URL && !abortCtrl.signal.aborted) {
        const emotionPromise = startEmotionExtraction(stableSession, userAudioB64, abortCtrl.signal);
        emotionPromise.then((hint) => {
          if (hint && !abortCtrl.signal.aborted) {
            storeCachedEmotion(ws.id, hint);
            console.info('[emotion] cached for next turn:', hint.slice(0, 40));
          }
        }).catch(() => { /* silent fail */ });
      }

      // 3. 2026-08-28: smart-turn-v2 server-side VAD (fire-and-forget).
      //    Calls Cloudflare Workers AI @cf/pipecat-ai/smart-turn-v2 to validate
      //    that the captured audio is real speech (not noise/silence/before-talk).
      //    If `complete: false` → abort the LLM mid-flight + notify client.
      //    Zero latency impact on the happy path (parallel with everything else).
      if (userAudioB64 && audioDurationMs >= 500 && !abortCtrl.signal.aborted) {
        const turnPcmBuf = Buffer.from(userAudioB64, 'base64');
        const turnWavHeader = createWavHeader(turnPcmBuf.length, 16000, 1);
        const turnFullWav = Buffer.concat([Buffer.from(turnWavHeader), turnPcmBuf]);
        const turnB64 = turnFullWav.toString('base64');
        const turnStart = Date.now();
        fetch(`${AI_API_URL}/v1/voice/turn-detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://guig.dev',
            ...(process.env.MCP_AUTH_TOKEN ? { 'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {}),
          },
          body: JSON.stringify({ audio: turnB64, sample_rate: 16000 }),
          signal: AbortSignal.timeout(2500),
        })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (!j || abortCtrl.signal.aborted) return;
          const dur = Date.now() - turnStart;
          if (j.complete === false && j.confidence >= 0.6) {
            // High-confidence noise/before-silence detection — abort everything
            console.info(`[turn-detect] NOISE rejected (conf=${j.confidence.toFixed(2)} ${dur}ms)`);
            abortCtrl.abort();
            try { ws.send(JSON.stringify({ type: 'noise_detected', confidence: j.confidence })); } catch {}
          } else {
            console.info(`[turn-detect] OK (complete=${j.complete} conf=${j.confidence?.toFixed(2)} ${dur}ms)`);
          }
        })
        .catch(err => console.warn('[turn-detect] skipped:', err?.message));
      }

      let fullText = '';
      let sentenceBuf = '';
      let firstAudioSent = false;
      let ttfaMs = 0;

      // Conversation memory lives in the shared api.guig.dev episodic store so
      // UltraBlablId: string = String(data.session_id || '').trim();
      const sessionToken: string = String(data.session_token || '').trim();
      let history: Array<{ role: string; content: string }> = [];
      if (sessionId && sessionToken) {
        try {
          const hRes = await fetch(
            `${AI_API_URL}/v1/memory/messages?session_id=${encodeURIComponent(sessionId)}&limit=10`,
            {
              headers: {
                'Origin': 'https://guig.dev',
                'Authorization': `Bearer ${sessionToken}`
              },
              signal: AbortSignal.timeout(2500)
            }
          );
          if (hRes.ok) {
            const hJson: any = await hRes.json();
            if (Array.isArray(hJson?.messages)) history = hJson.messages;
          }
        } catch (e: any) {
          console.warn('[memory] history fetch failed:', e?.message ?? e);
        }
      }
      const threadMessages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userText }
      ];

      const persistTurn = async (reply: string) => {
        if (!sessionId || !sessionToken || !reply.trim()) return;
        try {
          await fetch(`${AI_API_URL}/v1/memory/messages?session_id=${encodeURIComponent(sessionId)}`, {
            method: 'POST',
            headers: {
              'Origin': 'https://guig.dev',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
              messages: [
                { role: 'user', content: userText },
                { role: 'assistant', content: reply }
              ]
            }),
            signal: AbortSignal.timeout(3000)
          });
        } catch (e: any) {
          console.warn('[memory] persist failed:', e?.message ?? e);
        }
      };

      // Synthèse audio avec priorité Docker C++ puis fallback Cloud
      const synthesizeClause = async (clause: string) => {
        if (abortCtrl.signal.aborted) return;
        const clean = clause.trim();
        if (!clean || clean.length < 2) return;

        // 1) Essai Local C++ (21ms)
        try {
          const localTts = await fetch(`${TTS_BACKEND_URL}/v1/audio/speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: clean,
              voice: voice,
              response_format: 'pcm'
            }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(3000)])
          });
          if (localTts.ok) {
            const pcmBuffer = await localTts.arrayBuffer();
            if (pcmBuffer.byteLength > 0 && !abortCtrl.signal.aborted) {
              const b64 = Buffer.from(pcmBuffer).toString('base64');
              if (!firstAudioSent) {
                firstAudioSent = true;
                ttfaMs = Date.now() - startMs;
              }
              ws.send(JSON.stringify({ type: 'audio', data: b64, format: 'pcm' }));
              return;
            }
          }
        } catch {}

        // 2) Fallback Cloud
        try {
          if (abortCtrl.signal.aborted) return;
          const cloudTts = await fetch(`${AI_API_URL}/v1/voice/speak`, {
            method: 'POST',
            headers: {
              'Origin': 'https://guig.dev',
              'Content-Type': 'application/json',
              ...(process.env.MCP_AUTH_TOKEN ? { 'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {})
            },
            body: JSON.stringify({ input: clean, voice: voice }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(5000)])
          });
          if (cloudTts.ok && !abortCtrl.signal.aborted) {
            const mp3Buffer = await cloudTts.arrayBuffer();
            const b64 = Buffer.from(mp3Buffer).toString('base64');
            if (!firstAudioSent) {
              firstAudioSent = true;
              ttfaMs = Date.now() - startMs;
            }
            ws.send(JSON.stringify({ type: 'audio', data: b64, format: 'wav' }));
          }
        } catch (err: any) {
          console.warn('[Fallback Cloud TTS Warning]', err.message);
        }
      };

      try {
        let llmRes: Response | null = null;

        // 1) Essai Prioritaire Local Docker Model Runner — Qwen3-1.7B texte-only (1.2 GB VRAM)
        try {
          llmRes = await fetch(`${LLM_BACKEND_URL}/chat/completions`, {
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'https://guig.dev',
              ...(process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN
                ? { 'Authorization': `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}` }
                : {})
            },
            body: JSON.stringify({
              model: LOCAL_LLM_MODEL,
              messages: threadMessages,
              stream: true,
              max_tokens: 80,
              temperature: 0.3
            }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(5000)])
          });
          if (!llmRes.ok || !llmRes.body) {
            llmRes = null;
          }
        } catch {
          llmRes = null;
        }

        // 2) Fallback Cloudflare
        if (!llmRes && !abortCtrl.signal.aborted) {
          llmRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Origin': 'https://guig.dev',
              'Content-Type': 'application/json',
              ...(process.env.MCP_AUTH_TOKEN ? { 'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {})
            },
            body: JSON.stringify({
              model: '@cf/zai-org/glm-5.3-flash',
              messages: threadMessages,
              stream: true,
              max_tokens: 100,
              temperature: 0.6
            }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(8000)])
          });
        }

        if (abortCtrl.signal.aborted) return;

        if (!llmRes || !llmRes.ok || !llmRes.body) {
          // Fallback direct non-stream
          const fallbackRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Origin': 'https://guig.dev',
              'Content-Type': 'application/json',
              ...(process.env.MCP_AUTH_TOKEN ? { 'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {})
            },
            body: JSON.stringify({
              model: '@cf/zai-org/glm-5.3-flash',
              messages: threadMessages,
              max_tokens: 60
            }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(6000)])
          });
          const json: any = await fallbackRes.json();
          const reply = json.choices?.[0]?.message?.content || json.response || 'Bonjour !';
          if (!abortCtrl.signal.aborted) {
            ws.send(JSON.stringify({ type: 'token', content: reply }));
            await synthesizeClause(reply);
            await persistTurn(reply);
            ws.send(JSON.stringify({ type: 'done', content: reply, ttfa_ms: Date.now() - startMs }));
          }
          activeVoiceStreams.delete(ws.id);
          return;
        }

        const reader = llmRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!abortCtrl.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (abortCtrl.signal.aborted) break;
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content || parsed.response || '';
              if (delta && !abortCtrl.signal.aborted) {
                fullText += delta;
                sentenceBuf += delta;
                ws.send(JSON.stringify({ type: 'token', content: delta }));

                // Découpage instantané ultra-rapide (ponctuation OU premier bloc de 4-5 mots pour TTFA < 300ms)
                const punctMatch = sentenceBuf.match(/([.!?;,:：，。！？]+)(\s+|$)/);
                if (punctMatch && punctMatch.index !== undefined) {
                  const cutIdx = punctMatch.index + punctMatch[1].length;
                  const clause = sentenceBuf.slice(0, cutIdx).trim();
                  sentenceBuf = sentenceBuf.slice(cutIdx);
                  if (clause) await synthesizeClause(clause);
                } else if (!firstAudioSent) {
                  const words = sentenceBuf.trim().split(/\s+/);
                  if (words.length >= 4 && /\s$/.test(sentenceBuf)) {
                    const clause = sentenceBuf.trim();
                    sentenceBuf = '';
                    await synthesizeClause(clause);
                  }
                }
              }
            } catch {}
          }
        }

        if (sentenceBuf.trim() && !abortCtrl.signal.aborted) {
          await synthesizeClause(sentenceBuf);
        }

        if (!abortCtrl.signal.aborted) {
          await persistTurn(fullText.trim());
          ws.send(JSON.stringify({
            type: 'done',
            content: fullText.trim(),
            ttfa_ms: ttfaMs || (Date.now() - startMs)
          }));
        }
      } catch (err: any) {
        if (!abortCtrl.signal.aborted) {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
        }
      } finally {
        activeVoiceStreams.delete(ws.id);
      }
    }
  })

  // ─── WebSocket: ASR Stream Ultra-Rapide (Local C++ -> Fallback Cloud) ─────
  .ws('/v1/asr/stream', {
    open(ws) {
      wsAsrBuffers.set(ws.id, []);
      ws.send(JSON.stringify({ type: 'ready', model: 'qwen3-asr-cuda-cpp' }));
    },
    async message(ws, message: any) {
      let data: any;
      try {
        data = typeof message === 'string' ? JSON.parse(message) : message;
      } catch {
        return;
      }

      if (data.type === 'start') {
        wsAsrBuffers.set(ws.id, []);
        ws.send(JSON.stringify({ type: 'ready', model: 'qwen3-asr-cuda-cpp' }));
        return;
      }

      if (data.type === 'pcm' && data.data) {
        let chunks = wsAsrBuffers.get(ws.id);
        if (!chunks) {
          chunks = [];
          wsAsrBuffers.set(ws.id, chunks);
        }
        const bin = Buffer.from(data.data, 'base64');
        chunks.push(bin);
        return;
      }

      if (data.type === 'stop') {
        const chunks = wsAsrBuffers.get(ws.id) || [];
        wsAsrBuffers.delete(ws.id);
        const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
        const pcmData = Buffer.concat(chunks, totalLen);

        if (pcmData.length === 0) {
          ws.send(JSON.stringify({ type: 'final', text: '' }));
          return;
        }

        const wavHeader = createWavHeader(pcmData.length, 16000, 1);
        const fullWav = Buffer.concat([Buffer.from(wavHeader), pcmData]);

        // 1) Essai Local C++ ASR (174ms)
        try {
          const formData = new FormData();
          const blob = new Blob([fullWav], { type: 'audio/wav' });
          formData.append('file', blob, 'audio.wav');
          formData.append('language', 'fr');

          const localAsr = await fetch(`${ASR_BACKEND_URL}/v1/audio/transcriptions`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(4000)
          });

          if (localAsr.ok) {
            const asrJson: any = await localAsr.json();
            const text = asrJson.text || asrJson.transcription || '';
            ws.send(JSON.stringify({ type: 'final', text }));
            return;
          }
        } catch {}

        // 2) Fallback Cloud ASR (OpenAI compatible Whisper)
        try {
          const formData = new FormData();
          const blob = new Blob([fullWav], { type: 'audio/wav' });
          formData.append('file', blob, 'audio.wav');
          formData.append('model', 'whisper-1');
          formData.append('language', 'fr');
          const cloudAsr = await fetch(`${AI_API_URL}/v1/audio/transcriptions`, {
            method: 'POST',
            headers: {
              'Origin': 'https://guig.dev',
              ...(process.env.MCP_AUTH_TOKEN ? { 'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {})
            },
            body: formData,
            signal: AbortSignal.timeout(6000)
          });
          if (cloudAsr.ok) {
            const asrJson: any = await cloudAsr.json();
            const text = asrJson.text || asrJson.transcription || '';
            ws.send(JSON.stringify({ type: 'final', text }));
            return;
          }
        } catch {}

        ws.send(JSON.stringify({ type: 'final', text: '' }));
      }
    },
    close(ws) {
      wsAsrBuffers.delete(ws.id);
    }
  })

  .listen(PORT);

console.log(`🚀 UltraBlabla Hybrid Voice Server running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`🎙️  ASR Local Docker C++ : ${ASR_BACKEND_URL}`);
console.log(`🔊 TTS Local Docker C++ : ${TTS_BACKEND_URL}`);
console.log(`🧠 Cloud Fallback       : ${AI_API_URL}`);
