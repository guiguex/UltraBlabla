import { Elysia } from 'elysia';

// ─── Configuration des Backends (Docker C++ CUDA Local + Fallback Cloudflare) ───
const ASR_BACKEND_URL = (process.env.ASR_BACKEND_URL || 'http://localhost:41238').replace(/\/+$/, '');
const TTS_BACKEND_URL = (process.env.TTS_BACKEND_URL || 'http://localhost:41237').replace(/\/+$/, '');
const TTS_SIDECAR_URL = (process.env.TTS_SIDECAR_URL || 'http://localhost:5000').replace(/\/+$/, '');
const CLASSIFIER_BACKEND_URL = (process.env.CLASSIFIER_BACKEND_URL || 'http://localhost:12434/engines/v1').replace(/\/+$/, '');
const CLASSIFIER_MODEL = process.env.CLASSIFIER_MODEL || 'hf.co/mradermacher/Qwen2-Audio-7B-Instruct-GGUF:Q4_K_M';
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
    if (process.env.MCP_AUTH_TOKEN) {
      cloudHeaders.set('Authorization', `Bearer ${process.env.MCP_AUTH_TOKEN}`);
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
      }
      return file;
    }
    set.status = 404;
    return 'Not found';
  })

  // ─── Statut & Configuration ─────────────────────────────────────
  .get('/api/config', () => ({
    status: 'online',
    version: '5.0.0-hybrid-docker-cuda',
    backends: {
      asrLocal: ASR_BACKEND_URL,
      ttsLocal: TTS_BACKEND_URL,
      sidecar: TTS_SIDECAR_URL,
      classifierLocal: CLASSIFIER_BACKEND_URL,
      cloudFallback: AI_API_URL,
    },
    features: ['local-qwen-asr-cpp', 'local-tts-server-cpp', 'local-qwen2-audio-classifier', 'cloud-fallback', 'pcm-streaming', 'vad']
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

  // ─── Routing Détection Vocale & Classification Qwen2-Audio ───────
  .all('/api/voice/classify', ({ request }) => proxyWithFallback(request, CLASSIFIER_BACKEND_URL, AI_API_URL, '/v1/audio/classify'))
  .all('/v1/audio/classify', ({ request }) => proxyWithFallback(request, CLASSIFIER_BACKEND_URL, AI_API_URL, '/v1/audio/classify'))

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
      const systemPrompt = data.system || `Tu es UltraBlabla, une IA vocale ultra-réactive, chaleureuse et naturelle.
Réponds de manière concise, directe et vivante (1 phrase courte à l'oral, ≤ 15 mots).
Commence TOUJOURS ta réponse par un mot d'amorce court suivi d'une virgule (ex: "Oui,", "D'accord,", "En fait,", "Absolument,", "Bien sûr,", "Regarde,").
Jamais de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;

      let fullText = '';
      let sentenceBuf = '';
      let firstAudioSent = false;
      let ttfaMs = 0;

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

        // 1) Essai Prioritaire Local Docker Model Runner (CUDA natif)
        try {
          llmRes = await fetch(`${CLASSIFIER_BACKEND_URL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: CLASSIFIER_MODEL,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
              ],
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
              model: '@cf/meta/llama-3.1-8b-instruct-fast',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
              ],
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
              model: '@cf/meta/llama-3.1-8b-instruct-fast',
              messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText }],
              max_tokens: 60
            }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(6000)])
          });
          const json: any = await fallbackRes.json();
          const reply = json.choices?.[0]?.message?.content || json.response || 'Bonjour !';
          if (!abortCtrl.signal.aborted) {
            ws.send(JSON.stringify({ type: 'token', content: reply }));
            await synthesizeClause(reply);
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

        // 2) Fallback Cloud ASR
        try {
          const formData = new FormData();
          const blob = new Blob([fullWav], { type: 'audio/wav' });
          formData.append('file', blob, 'audio.wav');
          const cloudAsr = await fetch(`${AI_API_URL}/v1/voice/transcribe`, {
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
