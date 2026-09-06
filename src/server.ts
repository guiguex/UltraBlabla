import express, { type Request as ExpRequest, type Response as ExpResponse, type NextFunction } from 'express';
import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { ser, pcm16leToFloat32, hintFor, EmotionCache, prewarmSer } from './ser/index.js';
import { agiArena, AGI_TOPICS } from './agi/agi-arena.js';
import { isFemaleVoice, feminizeFrenchText, buildGenderAwareSystemPrompt } from './fe/voice/feminizationService.js';
import { formatQuebecProsody, extractNextSpeechChunk } from './fe/voice/speechChunker.js';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const MODELS_DIR = path.resolve(process.cwd(), 'models/ser-wav2vec2-fr');
const VAD_MODELS_DIR = path.resolve(process.cwd(), 'silero-vad-onnx/onnx');
const ONNX_WEB_DIR = path.resolve(process.cwd(), 'node_modules/onnxruntime-web/dist');

// ─── Configuration des Backends ──────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
const ASR_BACKEND_URL = (process.env.ASR_BACKEND_URL || 'http://localhost:41238').replace(/\/+$/, '');
const TTS_BACKEND_URL = (process.env.TTS_BACKEND_URL || 'http://localhost:41237').replace(/\/+$/, '');
const TTS_SIDECAR_URL = (process.env.TTS_SIDECAR_URL || 'http://localhost:5000').replace(/\/+$/, '');
const LLM_BACKEND_URL = (process.env.LLM_BACKEND_URL || process.env.CLASSIFIER_BACKEND_URL || 'http://api.guig.dev/v1').replace(/\/+$/, '');
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || process.env.CLASSIFIER_MODEL || '@cf/meta/llama-3.1-8b-instruct-fast';
const AUDIO_LLM_URL = (process.env.AUDIO_LLM_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const AUDIO_LLM_MODEL = process.env.AUDIO_LLM_MODEL || '';
const AI_API_URL = (process.env.AI_API_URL || 'https://api.guig.dev').replace(/\/+$/, '');

// Lazy Gemini AI Client initialization
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Helper: WAV Header 16kHz Mono 16-bit
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

// ─── Proxy Universel avec Fallback ────────────────────────────────
async function proxyWithFallback(req: ExpRequest, res: ExpResponse, localBackend: string, cloudBackend: string, rewritePath?: string) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string' && !['host', 'content-length', 'connection', 'keep-alive', 'transfer-encoding'].includes(k.toLowerCase())) {
      headers.set(k, v);
    }
  }

  const rawBody = (req as any).rawBody || (req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : undefined);
  const pathname = rewritePath || req.path;
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';

  // 1) Essai Prioritaire Local Docker C++
  if (localBackend) {
    try {
      const localBackendUrl = new URL(localBackend);
      const targetLocal = `${localBackendUrl.origin}${pathname}${queryString}`;
      const localRes = await fetch(targetLocal, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
        redirect: 'manual',
        signal: AbortSignal.timeout(8000)
      });
      if (localRes.ok) {
        res.status(localRes.status);
        const skipHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
        localRes.headers.forEach((val, key) => {
          if (!skipHeaders.includes(key.toLowerCase())) res.setHeader(key, val);
        });
        res.setHeader('x-voice-source', 'docker-local-cpp');
        const buf = Buffer.from(await localRes.arrayBuffer());
        return res.send(buf);
      }
    } catch {}
  }

  // 2) Fallback Cloudflare
  try {
    const cloudBackendUrl = new URL(cloudBackend);
    const targetCloud = `${cloudBackendUrl.origin}${pathname}${queryString}`;
    headers.set('Origin', 'https://guig.dev');
    headers.set('User-Agent', 'UltraBlabla-Voice-Matrix/5.0');
    if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
      headers.set('Authorization', `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`);
    }
    const cloudRes = await fetch(targetCloud, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
      redirect: 'manual',
      signal: AbortSignal.timeout(6000)
    });
    res.status(cloudRes.status);
    const skipHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
    cloudRes.headers.forEach((val, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) res.setHeader(key, val);
    });
    res.setHeader('x-voice-source', 'cloudflare-cloud');
    const buf = Buffer.from(await cloudRes.arrayBuffer());
    return res.send(buf);
  } catch (error: any) {
    return res.status(502).json({ error: 'Proxy fallback vocal: ' + (error?.message || 'timeout') });
  }
}

const emotionCache = new EmotionCache(8_000);

// Fire-and-forget emotion extraction
function startEmotionExtraction(sessionId: string, audioB64: string, signal: AbortSignal): Promise<string | null> {
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

// ─── Initialisation Express ───────────────────────────────────────
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Cross-Origin Isolation (COOP/COEP/CORP) ──────────────────────
// Active `self.crossOriginIsolated === true` côté navigateur pour permettre
// SharedArrayBuffer, WASM threading et ONNX Runtime multi-thread performant.
// À déployer AVANT toute route / static middleware pour que tous les subresources
// (modèles, fonts, scripts) soient servis avec ces en-têtes.
const COOP = 'same-origin';
const COEP = 'require-corp';
const CORP = 'same-origin';
const setIsolationHeaders = (_req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', COOP);
  res.setHeader('Cross-Origin-Embedder-Policy', COEP);
  res.setHeader('Cross-Origin-Resource-Policy', CORP);
  next();
};
app.use(setIsolationHeaders);

// ─── Statut & Configuration ───────────────────────────────────────
app.get('/api/config', (_req, res) => {
  res.json({
    status: 'online',
    version: '5.4.0-node-express-hybrid',
    backends: {
      asrLocal: ASR_BACKEND_URL,
      ttsLocal: TTS_BACKEND_URL,
      sidecar: TTS_SIDECAR_URL,
      llmLocal: LLM_BACKEND_URL,
      cloudFallback: AI_API_URL,
    },
    ser: ser.stats(),
    features: [
      'express-node-runtime',
      'gemini-ai-ready',
      'local-qwen-asr-cpp',
      'local-tts-server-cpp',
      'wav2vec2-fr-ondevice-ser',
      'qwen3-1.7b-text-chat',
      'cloud-fallback',
      'pcm-streaming',
      'vad',
      'smart-turn-v2',
      'ser-browser-webgpu-wasm'
    ]
  });
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── SER & VAD Models + ORT-WASM Serving ──────────────────────────
app.use('/models/ser', express.static(MODELS_DIR, {
  maxAge: '1y',
  immutable: true
}));

app.use('/models/vad', express.static(VAD_MODELS_DIR, {
  maxAge: '1y',
  immutable: true
}));

app.use('/onnxruntime-web', express.static(ONNX_WEB_DIR, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    }
  }
}));

// ─── Routing Voix & TTS ───────────────────────────────────────────
app.all(['/api/voice/voices', '/v1/audio/voices'], (req, res) => proxyWithFallback(req, res, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/voices'));
app.all(['/api/voice/speak', '/v1/audio/speech'], (req, res) => proxyWithFallback(req, res, TTS_BACKEND_URL, AI_API_URL, '/v1/audio/speech'));
app.all(['/api/voice/transcribe', '/v1/audio/transcriptions'], (req, res) => proxyWithFallback(req, res, ASR_BACKEND_URL, AI_API_URL, '/v1/audio/transcriptions'));
app.all(['/api/voice/classify', '/v1/audio/classify'], (req, res) => proxyWithFallback(req, res, AUDIO_LLM_URL, AI_API_URL, '/chat/completions'));

// ─── Sidecar Python Routing ───────────────────────────────────────
app.all('/v1/audio/voice/clone', (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));
app.all('/v1/audio/voice/design', (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));
app.all('/v1/audio/transcribe_with_alignment', (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));

// ─── Module AGI Arena 2030 (Test de Turing & Détection AGI) ──────
app.get('/api/agi/stats', (_req, res) => {
  res.json(agiArena.getStats());
});

app.get('/api/agi/topics', (_req, res) => {
  res.json(AGI_TOPICS);
});

app.post('/api/agi/start', (req, res) => {
  try {
    const { topicId } = req.body || {};
    const session = agiArena.startSession(topicId);
    res.json({
      sessionId: session.id,
      topic: session.topic,
      roundDuration: 45
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur démarrage session AGI' });
  }
});

app.post('/api/agi/turn', async (req, res) => {
  try {
    const { sessionId, userText } = req.body || {};
    if (!sessionId || !userText) {
      return res.status(400).json({ error: 'sessionId et userText sont requis.' });
    }
    const result = await agiArena.processTurn(sessionId, userText, getGemini());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur traitement échange AGI' });
  }
});

app.post('/api/agi/vote', (req, res) => {
  try {
    const { sessionId, vote, feedback } = req.body || {};
    if (!sessionId || (vote !== 'human' && vote !== 'ai')) {
      return res.status(400).json({ error: 'sessionId et vote valide ("human" ou "ai") sont requis.' });
    }
    const result = agiArena.submitVote(sessionId, vote, feedback);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur enregistrement vote AGI' });
  }
});

// ─── Endpoint Local /chat/completions (OpenAI compatible + Gemini) ─
app.post('/chat/completions', async (req, res) => {
  try {
    const body: any = req.body;
    const parts: any[] = body?.messages?.[0]?.content ?? [];

    // Cas 1: Input Audio SER
    const audioPart = Array.isArray(parts) ? parts.find((p: any) => p?.type === 'input_audio') : null;
    if (audioPart?.input_audio?.data) {
      const wavBytes = Buffer.from(audioPart.input_audio.data, 'base64');
      const pcmBytes = (wavBytes.byteLength > 44 && wavBytes.toString('ascii', 0, 4) === 'RIFF')
        ? wavBytes.subarray(44)
        : wavBytes;
      const pcm = pcm16leToFloat32(pcmBytes);
      const serRes = await ser.classify(pcm);
      const hint = (serRes && serRes.score >= 0.35) ? hintFor(serRes.label) : '';
      return res.json({
        choices: [{ message: { role: 'assistant', content: hint } }]
      });
    }

    // Cas 2: Chat Texte standard
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || 'Bonjour';

    // Priorité 1: Gemini API
    const gemini = getGemini();
    if (gemini) {
      try {
        const aiResp = await gemini.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [
            {
              role: 'user',
              parts: [{ text: `Tu es UltraBlabla, une IA vocale chaleureuse et ultra-réactive. Réponds en 1 ou 2 phrases concises en français.\n\nUtilisateur: ${lastUserMsg}` }]
            }
          ],
          config: { maxOutputTokens: 80, temperature: 0.6 }
        });
        const reply = aiResp.text?.trim() || 'Oui, absolument !';
        return res.json({
          choices: [{ message: { role: 'assistant', content: reply } }]
        });
      } catch (err: any) {
        console.warn('[Gemini error in /chat/completions]:', err?.message);
      }
    }

    // Priorité 2: Fallback Cloudflare AI (api.guig.dev)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': 'https://guig.dev'
      };
      if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
      }
      const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: LOCAL_LLM_MODEL,
          messages,
          max_tokens: 80
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        return res.json(json);
      }
    } catch {}

    // Priorité 3: Réponse intelligente locale intégrée
    const defaultReplies: Record<string, string> = {
      'bonjour': 'Bonjour ! Oui, je suis UltraBlabla, votre assistant vocal. En quoi puis-je vous aider ?',
      'salut': 'Salut ! Prêt pour une nouvelle interaction neuronale.',
      'qui es-tu': 'Je suis UltraBlabla, une interface vocale haute réactivité fonctionnant à vitesse de l’éclair.',
      'aide': 'Vous pouvez me poser n’importe quelle question à voix haute ou par écrit dans ce terminal.'
    };
    const lower = String(lastUserMsg).toLowerCase();
    let reply = 'Oui, absolument ! Je suis à votre écoute et prêt à vous aider.';
    for (const [k, v] of Object.entries(defaultReplies)) {
      if (lower.includes(k)) {
        reply = v;
        break;
      }
    }

    return res.json({
      choices: [{ message: { role: 'assistant', content: reply } }]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Chat completion failed' });
  }
});

// Routing /api/chat et /v1/chat/completions
app.all(['/api/chat', '/v1/chat/completions'], async (req, res) => {
  const messages = req.body?.messages || [];
  const userText = messages.slice().reverse().find((m: any) => m.role === 'user')?.content || 'Bonjour';

  const gemini = getGemini();
  if (gemini) {
    try {
      const aiResp = await gemini.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Tu es UltraBlabla, une IA vocale chaleureuse et ultra-réactive. Réponds en 1-2 phrases courtes en français.\n\nUtilisateur: ${userText}` }]
          }
        ],
        config: { maxOutputTokens: 80, temperature: 0.6 }
      });
      const text = aiResp.text?.trim() || 'Oui, bien sûr !';
      return res.json({
        choices: [{ message: { role: 'assistant', content: text } }]
      });
    } catch (e: any) {
      console.warn('[Gemini /api/chat error]:', e?.message);
    }
  }

  // Cloudflare AI fallback (api.guig.dev)
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': 'https://guig.dev'
    };
    if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
    }
    const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: LOCAL_LLM_MODEL,
        messages,
        max_tokens: 80
      }),
      signal: AbortSignal.timeout(6000)
    });
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      return res.json(json);
    }
  } catch {}

  // Built-in intelligent French voice assistant response
  const lower = String(userText).toLowerCase();
  let reply = 'Oui, absolument ! Je suis à votre écoute et prêt à échanger avec vous.';
  if (lower.includes('bonjour') || lower.includes('salut')) {
    reply = 'Bonjour ! Je suis UltraBlabla, votre assistant vocal. Que puis-je faire pour vous ?';
  } else if (lower.includes('qui es-tu') || lower.includes('t\'es qui')) {
    reply = 'Je suis UltraBlabla, une interface vocale neuronale ultra-rapide.';
  } else if (lower.includes('heure')) {
    const now = new Date();
    reply = `Il est actuellement ${now.getHours()}h${String(now.getMinutes()).padStart(2, '0')}.`;
  }

  return res.json({
    choices: [{ message: { role: 'assistant', content: reply } }]
  });
});

// ─── Fichiers Statiques PWA & UI ──────────────────────────────────
app.use(express.static(PUBLIC_DIR));

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ─── Serveur HTTP & WebSockets ────────────────────────────────────
const server = http.createServer(app);

const wssVoice = new WebSocketServer({ noServer: true });
const wssAsr = new WebSocketServer({ noServer: true });

const activeVoiceStreams = new Map<string, AbortController>();
const wsAsrBuffers = new Map<string, Buffer[]>();

// Routeur d'upgrade WebSocket
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  if (pathname === '/v1/voice/stream') {
    wssVoice.handleUpgrade(request, socket, head, (ws) => {
      wssVoice.emit('connection', ws, request);
    });
  } else if (pathname === '/v1/asr/stream') {
    wssAsr.handleUpgrade(request, socket, head, (ws) => {
      wssAsr.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// ─── WebSocket: Voice Stream Ultra-Rapide (Barge-In + TTS + LLM) ──
let voiceClientCounter = 0;
wssVoice.on('connection', (ws) => {
  const clientId = `ws-${++voiceClientCounter}-${Date.now()}`;

  ws.on('close', () => {
    activeVoiceStreams.get(clientId)?.abort();
    activeVoiceStreams.delete(clientId);
  });

  ws.on('message', async (raw) => {
    let data: any;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // Gestion du Barge-In (Interruption utilisateur)
    if (data.type === 'interrupt') {
      const ctrl = activeVoiceStreams.get(clientId);
      if (ctrl) {
        ctrl.abort();
        activeVoiceStreams.delete(clientId);
      }
      try {
        ws.send(JSON.stringify({ type: 'interrupted', timestamp: Date.now() }));
      } catch {}
      return;
    }

    if (data.type !== 'chat' || !data.text) return;

    // Annuler toute génération précédente sur cette connexion
    activeVoiceStreams.get(clientId)?.abort();
    const abortCtrl = new AbortController();
    activeVoiceStreams.set(clientId, abortCtrl);

    try {
      ws.send(JSON.stringify({ type: 'ready' }));
    } catch {}

    const startMs = Date.now();
    const voice = data.voice || 'guillaume';
    const isFemale = isFemaleVoice(voice);
    const userText = data.text;
    const requestedModel = data.model || LOCAL_LLM_MODEL;
    const userAudioB64: string | undefined = data.audio;
    const BASE_SYSTEM = data.system || `Tu es un compagnon vocal québécois authentique, chaleureux, complice et vif d'esprit.
Réponds en français québécois parlé naturel de manière concise et fluide (1 à 2 phrases courtes à l'oral, ≤ 20 mots au total).
Varie naturellement tes expressions québécoises (ex: "genre", "écoute", "faque", "c'est sûr", "ben oui", "en tout cas", "t'sais").
IMPORTANT: Ne répète pas "t'sais" à chaque phrase ! Dose avec modération et alterne souvent avec "genre", "écoute" ou "faque" pour que l'élocution reste vivante et équilibrée.
Commence souvent par un mot d'amorce court suivi d'une virgule (ex: "Oui,", "Ben,", "Écoute,", "D'accord,", "En fait,").
N'utilise JAMAIS de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;

    let systemPrompt = buildGenderAwareSystemPrompt(voice, BASE_SYSTEM);
    const clientHint: string | undefined = typeof data.emotion_hint === 'string' && data.emotion_hint.trim().length > 0
      ? data.emotion_hint.trim()
      : undefined;

    const cachedEmotion = emotionCache.get(clientId);
    if (cachedEmotion) {
      systemPrompt = `${systemPrompt}\n[Contexte émotionnel : ${cachedEmotion}]`;
    }

    if (clientHint) {
      emotionCache.set(clientId, clientHint);
    } else if (userAudioB64 && !abortCtrl.signal.aborted) {
      startEmotionExtraction(clientId, userAudioB64, abortCtrl.signal)
        .then((hint) => {
          if (hint && !abortCtrl.signal.aborted) emotionCache.set(clientId, hint);
        })
        .catch(() => {});
    }

    let fullText = '';
    let sentenceBuf = '';
    let firstAudioSent = false;
    let ttfaMs = 0;

    // Synthèse audio québécoise avec priorité Docker local puis Cloud PCM
    const synthesizeClause = async (clause: string) => {
      if (abortCtrl.signal.aborted) return;
      let clean = formatQuebecProsody(clause);
      if (isFemale) {
        clean = feminizeFrenchText(clean);
      }
      if (!clean || clean.length < 2) return;

      // 1) Essai Local C++ (timeout rapide 400ms pour ne jamais pénaliser le TTFA si absent)
      try {
        const localTts = await fetch(`${TTS_BACKEND_URL}/v1/audio/speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: clean, voice, response_format: 'pcm' }),
          signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(400)])
        });
        if (localTts.ok) {
          const pcmBuf = await localTts.arrayBuffer();
          if (pcmBuf.byteLength > 0 && !abortCtrl.signal.aborted) {
            const b64 = Buffer.from(pcmBuf).toString('base64');
            if (!firstAudioSent) {
              firstAudioSent = true;
              ttfaMs = Date.now() - startMs;
            }
            ws.send(JSON.stringify({ type: 'audio', data: b64, format: 'pcm' }));
            return;
          }
        }
      } catch {}

      // 2) Fallback Cloud TTS SOTA (api.guig.dev)
      try {
        if (abortCtrl.signal.aborted) return;
        const headers: Record<string, string> = {
          'Origin': 'https://guig.dev',
          'User-Agent': 'UltraBlabla-Voice-Matrix/5.0',
          'Content-Type': 'application/json',
        };
        if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
        }
        const cloudTts = await fetch(`${AI_API_URL}/v1/audio/speech`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ input: clean, voice }),
          signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(3500)])
        });
        if (cloudTts.ok && !abortCtrl.signal.aborted) {
          const pcmBuffer = await cloudTts.arrayBuffer();
          const b64 = Buffer.from(pcmBuffer).toString('base64');
          const contentType = cloudTts.headers.get('content-type') || '';
          const format = (contentType.includes('pcm') || contentType.includes('l16')) ? 'pcm' : 'wav';
          if (!firstAudioSent) {
            firstAudioSent = true;
            ttfaMs = Date.now() - startMs;
          }
          ws.send(JSON.stringify({ type: 'audio', data: b64, format }));
          return;
        }
      } catch {}
    };

    try {
      // Priorité 1: Gemini Stream si clé configurée
      const gemini = getGemini();
      if (gemini) {
        try {
          const stream = await gemini.models.generateContentStream({
            model: 'gemini-3.5-flash-lite',
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nUtilisateur: ${userText}` }] }
            ],
            config: {
              temperature: 0.6,
              maxOutputTokens: 60
            }
          });

          for await (const chunk of stream) {
            if (abortCtrl.signal.aborted) break;
            const delta = chunk.text || '';
            if (delta) {
              fullText += delta;
              sentenceBuf += delta;
              ws.send(JSON.stringify({ type: 'token', content: delta }));

              // 1. Détection de chunk complet avec masquage prosodique québécois
              while (true) {
                const speechChunk = extractNextSpeechChunk(sentenceBuf);
                if (!speechChunk) break;
                sentenceBuf = speechChunk.remaining;
                if (speechChunk.chunk) await synthesizeClause(speechChunk.chunk);
              }

              // 2. Amorce rapide de premier souffle (TTFA < 500ms) si virgule ou mot d'amorce
              if (!firstAudioSent && sentenceBuf.length >= 18 && /\s$/.test(sentenceBuf)) {
                const clause = sentenceBuf.trim();
                sentenceBuf = '';
                if (clause) await synthesizeClause(clause);
              }
            }
          }

          if (sentenceBuf.trim() && !abortCtrl.signal.aborted) {
            await synthesizeClause(sentenceBuf);
          }

          if (!abortCtrl.signal.aborted && fullText.trim()) {
            ws.send(JSON.stringify({
              type: 'done',
              content: fullText.trim(),
              ttfa_ms: ttfaMs || (Date.now() - startMs)
            }));
            return;
          }
        } catch (geminiErr: any) {
          console.warn('[Gemini voice stream error, falling back]:', geminiErr?.message);
        }
      }

      // Priorité 2: Cloudflare Workers AI si token présent
      if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
        const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Origin': 'https://guig.dev',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`
          },
          body: JSON.stringify({
            model: requestedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userText }
            ],
            stream: true,
            max_tokens: 60,
            temperature: 0.6
          }),
          signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(6000)])
        });

        if (cloudRes.ok && cloudRes.body) {
          const reader = cloudRes.body.getReader();
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

                  // 1. Détection de chunk complet avec masquage prosodique québécois
                  while (true) {
                    const speechChunk = extractNextSpeechChunk(sentenceBuf);
                    if (!speechChunk) break;
                    sentenceBuf = speechChunk.remaining;
                    if (speechChunk.chunk) await synthesizeClause(speechChunk.chunk);
                  }

                  // 2. Amorce rapide de premier souffle (TTFA < 500ms)
                  if (!firstAudioSent && sentenceBuf.length >= 18 && /\s$/.test(sentenceBuf)) {
                    const clause = sentenceBuf.trim();
                    sentenceBuf = '';
                    if (clause) await synthesizeClause(clause);
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
          return;
        }
      }

      // Priorité 3: Réponse vocale française intégrée directe
      const lower = userText.toLowerCase();
      let reply = 'Oui, parfaitement, je vous entends 5 sur 5 et je suis opérationnel.';
      if (lower.includes('bonjour') || lower.includes('salut')) {
        reply = 'Bonjour, oui, ravi de vous retrouver sur UltraBlabla !';
      } else if (lower.includes('qui es-tu') || lower.includes('t\'es qui')) {
        reply = 'Je suis UltraBlabla, votre assistant vocal neural haute performance.';
      } else if (lower.includes('heure')) {
        const now = new Date();
        reply = `En fait, il est actuellement ${now.getHours()} heures ${now.getMinutes()}.`;
      } else if (lower.includes('merci')) {
        reply = 'Avec grand plaisir, n’hésitez pas si vous avez une autre question.';
      }

      fullText = reply;
      ws.send(JSON.stringify({ type: 'token', content: fullText }));
      await synthesizeClause(fullText);

      if (!abortCtrl.signal.aborted) {
        ws.send(JSON.stringify({
          type: 'done',
          content: fullText,
          ttfa_ms: ttfaMs || (Date.now() - startMs)
        }));
      }
    } catch (err: any) {
      if (!abortCtrl.signal.aborted) {
        ws.send(JSON.stringify({ type: 'error', message: err?.message || 'Erreur voice stream' }));
      }
    } finally {
      activeVoiceStreams.delete(clientId);
    }
  });
});

// ─── WebSocket: ASR Stream Ultra-Rapide (Speech-to-Text) ──────────
let asrClientCounter = 0;
wssAsr.on('connection', (ws) => {
  const asrId = `asr-${++asrClientCounter}-${Date.now()}`;
  wsAsrBuffers.set(asrId, []);

  ws.send(JSON.stringify({ type: 'ready', model: 'ultrablabla-hybrid-asr' }));

  ws.on('close', () => {
    wsAsrBuffers.delete(asrId);
  });

  ws.on('message', async (raw) => {
    let data: any;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.type === 'start') {
      wsAsrBuffers.set(asrId, []);
      ws.send(JSON.stringify({ type: 'ready', model: 'ultrablabla-hybrid-asr' }));
      return;
    }

    if (data.type === 'pcm' && data.data) {
      let chunks = wsAsrBuffers.get(asrId);
      if (!chunks) {
        chunks = [];
        wsAsrBuffers.set(asrId, chunks);
      }
      chunks.push(Buffer.from(data.data, 'base64'));
      return;
    }

    if (data.type === 'stop') {
      const chunks = wsAsrBuffers.get(asrId) || [];
      wsAsrBuffers.delete(asrId);
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const pcmData = Buffer.concat(chunks, totalLen);

      if (pcmData.length === 0) {
        ws.send(JSON.stringify({ type: 'final', text: '' }));
        return;
      }

      const wavHeader = createWavHeader(pcmData.length, 16000, 1);
      const fullWav = Buffer.concat([Buffer.from(wavHeader), pcmData]);

      // 1) Essai Inférence vocale ASR (Local C++ / Cluster CUDA)
      const asrTargets = [ASR_BACKEND_URL, AI_API_URL].filter(Boolean);
      for (const target of asrTargets) {
        try {
          const formData = new FormData();
          const blob = new Blob([fullWav], { type: 'audio/wav' });
          formData.append('file', blob, 'audio.wav');
          formData.append('language', 'fr');

          const localAsr = await fetch(`${target}/v1/audio/transcriptions`, {
            method: 'POST',
            headers: { 'Origin': 'https://ultrablabla.guig.dev' },
            body: formData,
            signal: AbortSignal.timeout(4000)
          });

          if (localAsr.ok) {
            const asrJson: any = await localAsr.json();
            const text = asrJson.text || asrJson.transcription || '';
            if (text) {
              ws.send(JSON.stringify({ type: 'final', text }));
              return;
            }
          }
        } catch {}
      }

      // 2) Essai Gemini Audio Transcription si GEMINI_API_KEY configuré
      const gemini = getGemini();
      if (gemini && fullWav.length > 44) {
        try {
          const base64Audio = fullWav.toString('base64');
          const resp = await gemini.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
                  { text: 'Transcris fidèlement ce message audio français. Retourne UNIQUEMENT le texte transcrit sans aucun commentaire ni guillemets.' }
                ]
              }
            ]
          });
          const text = resp.text?.trim() || '';
          ws.send(JSON.stringify({ type: 'final', text }));
          return;
        } catch (e: any) {
          console.warn('[Gemini ASR transcription error]:', e?.message);
        }
      }

      // 3) Fallback Cloud ASR (Whisper / Deepgram)
      try {
        const formData = new FormData();
        const blob = new Blob([fullWav], { type: 'audio/wav' });
        formData.append('file', blob, 'audio.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', 'fr');
        const headers: Record<string, string> = {
          'Origin': 'https://guig.dev',
        };
        if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
        }
        const cloudAsr = await fetch(`${AI_API_URL}/v1/audio/transcriptions`, {
          method: 'POST',
          headers,
          body: formData,
          signal: AbortSignal.timeout(5000)
        });
        if (cloudAsr.ok) {
          const asrJson: any = await cloudAsr.json();
          const text = asrJson.text || asrJson.transcription || '';
          if (text) {
            ws.send(JSON.stringify({ type: 'final', text }));
            return;
          }
        }
      } catch {}

      ws.send(JSON.stringify({ type: 'final', text: '' }));
    }
  });
});

// ─── Démarrage Serveur ────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 UltraBlabla Hybrid Voice Server listening on http://0.0.0.0:${PORT}`);
  try {
    const r = await prewarmSer();
    const ep = ser.stats().providers?.join('+') ?? 'n/a';
    console.log(`🧡 wav2vec2-fr SER: ${r.ok ? `loaded in ${r.ms.toFixed(0)} ms (${ep})` : `skipped — ${r.reason}`}`);
  } catch (err: any) {
    console.warn(`[SER Prewarm Warning]: ${err?.message}`);
  }
});
