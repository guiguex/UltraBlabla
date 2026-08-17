import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

// Configuration des URLs des serveurs AI (Cloudflare Workers AI Proxy)
const AI_API_URL = process.env.AI_API_URL || 'https://api.guig.dev';
const PORT = Number(process.env.PORT) || 3000;

// Headers par défaut pour la communication avec api.guig.dev
const getProxyHeaders = (extraHeaders: Record<string, string> = {}) => ({
  'Origin': 'https://guig.dev',
  'User-Agent': 'UltraBlabla-Voice-Matrix/4.0',
  ...extraHeaders,
});

// Mapping des voix vers les speakers supportés
const VOICE_MAPPING: Record<string, { model?: string; speaker?: string; voice?: string }> = {
  'fr-female-1': { model: '@cf/myshell-ai/melotts', voice: 'fr-female-1' },
  'fr-male-1': { model: '@cf/myshell-ai/melotts', voice: 'fr-male-1' },
  'en-female-1': { model: '@cf/deepgram/aura-1', voice: 'asteria' },
  'en-female-2': { model: '@cf/deepgram/aura-1', voice: 'luna' },
  'en-male-1': { model: '@cf/deepgram/aura-1', voice: 'orpheus' },
  'es-female-1': { model: '@cf/deepgram/aura-1', voice: 'celeste' },
  'premium-1': { model: 'minimax/speech-2.8-turbo', voice: 'English_expressive_narrator' },
};

const app = new Elysia()
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
        'webmanifest': 'application/manifest+json'
      };
      if (ext && mimeTypes[ext]) {
        set.headers['Content-Type'] = mimeTypes[ext];
      }
      return file;
    }
    set.status = 404;
    return 'Not found';
  })

  // Configuration et statut
  .get('/api/config', () => {
    return {
      status: 'online',
      apiUrl: AI_API_URL,
      version: '4.0.0-neural-nextgen',
      features: ['voice-pipeline', 'transcribe', 'tts', 'chat-stream', 'vad']
    };
  })

  // 1. One-shot Voice Pipeline (STT -> LLM -> TTS)
  .post('/api/voice/pipeline', async ({ body, set }) => {
    const { audio, context, voice = 'fr-female-1' } = body as { audio: string; context?: string; voice?: string };
    
    if (!audio) {
      set.status = 400;
      return { error: 'Audio base64 requis' };
    }

    try {
      // 1. Tentative avec le endpoint distant /v1/voice/pipeline
      const response = await fetch(`${AI_API_URL}/v1/voice/pipeline`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ audio, context, voice })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio_b64 || data.response) {
          set.headers['Content-Type'] = 'application/json';
          return data;
        }
      }

      // 2. Fallback automatique composite : ASR -> LLM -> TTS
      console.log('🔄 Fallback pipeline composite en cours...');
      
      // Étape A : Transcription ASR
      const asrRes = await fetch(`${AI_API_URL}/v1/voice/transcribe`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ audio, mime_type: 'audio/webm' })
      });
      
      const asrData = asrRes.ok ? await asrRes.json() : { text: '' };
      const userText = asrData.text || '';

      if (!userText.trim()) {
        return { transcript: '', response: "Je n'ai pas bien entendu, pouvez-vous répéter ?", audio_b64: '', audio_format: 'mp3' };
      }

      // Étape B : LLM Llama 3.1 8B
      const chatRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          model: '@cf/meta/llama-3.1-8b-instruct-fast',
          messages: [
            { role: 'system', content: context || 'Tu es UltraBlabla, un assistant vocal ultra-rapide. Réponds en français en moins de 40 mots.' },
            { role: 'user', content: userText }
          ],
          max_tokens: 150,
          temperature: 0.6
        })
      });

      const chatData = await chatRes.json();
      const aiReply = chatData.choices?.[0]?.message?.content || chatData.response || 'Bonjour !';

      // Étape C : TTS
      let audioB64 = '';
      try {
        const ttsRes = await fetch(`${AI_API_URL}/v1/audio/speech`, {
          method: 'POST',
          headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            input: aiReply,
            voice: VOICE_MAPPING[voice]?.voice || 'asteria',
            model: '@cf/deepgram/aura-1'
          })
        });

        if (ttsRes.ok) {
          const audioArray = await ttsRes.arrayBuffer();
          audioB64 = Buffer.from(audioArray).toString('base64');
        }
      } catch (ttsErr) {
        console.warn('TTS fallback error:', ttsErr);
      }

      set.headers['Content-Type'] = 'application/json';
      return {
        transcript: userText,
        response: aiReply,
        audio_b64: audioB64,
        audio_format: 'mp3'
      };

    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Voice Pipeline: ' + (error?.message || error) };
    }
  })

  // 2. Transcription Vocale (Whisper Large V3 Turbo)
  .post('/api/voice/transcribe', async ({ body, set }) => {
    try {
      const response = await fetch(`${AI_API_URL}/v1/voice/transcribe`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ASR API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Transcription: ' + (error?.message || error) };
    }
  })

  // 3. Synthèse Vocale (MeloTTS FR / Deepgram Aura-1/2)
  .post('/api/voice/speak', async ({ body, set }) => {
    const { text, input, voice = 'fr-female-1', lang = 'fr' } = body as { text?: string; input?: string; voice?: string; lang?: string };
    const textToSpeak = text || input || '';

    if (!textToSpeak.trim()) {
      set.status = 400;
      return { error: 'Texte requis pour la synthèse vocale' };
    }

    try {
      // 1. Essai direct /v1/voice/speak
      let ttsResponse = await fetch(`${AI_API_URL}/v1/voice/speak`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ text: textToSpeak, voice, lang })
      });

      let audioBuffer: ArrayBuffer | null = null;

      if (ttsResponse.ok) {
        const ct = ttsResponse.headers.get('content-type') || '';
        if (ct.includes('audio/')) {
          audioBuffer = await ttsResponse.arrayBuffer();
        }
      }

      // 2. Fallback sur /v1/audio/speech (OpenAI format) si nécessaire
      if (!audioBuffer || audioBuffer.byteLength < 500) {
        const mappedVoice = VOICE_MAPPING[voice]?.voice || 'asteria';
        ttsResponse = await fetch(`${AI_API_URL}/v1/audio/speech`, {
          method: 'POST',
          headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            input: textToSpeak,
            voice: mappedVoice,
            model: '@cf/deepgram/aura-1'
          })
        });

        if (ttsResponse.ok) {
          audioBuffer = await ttsResponse.arrayBuffer();
        }
      }

      if (!audioBuffer || audioBuffer.byteLength === 0) {
        throw new Error('Synthèse audio impossible');
      }

      set.headers['Content-Type'] = 'audio/mpeg';
      return new Response(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Synthèse Vocale: ' + (error?.message || error) };
    }
  })

  // 4. Catalogue des voix disponibles
  .get('/api/voice/voices', async ({ query, set }) => {
    try {
      const langParam = query.lang ? `?lang=${encodeURIComponent(query.lang as string)}` : '';
      const response = await fetch(`${AI_API_URL}/v1/voice/voices${langParam}`, {
        headers: getProxyHeaders()
      });

      if (!response.ok) {
        throw new Error(`Voices API Error: ${response.statusText}`);
      }

      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Catalogue Voix: ' + (error?.message || error) };
    }
  })

  // 5. Chat Completion (OpenAI format)
  .post('/api/chat', async ({ body, set }) => {
    try {
      const response = await fetch(`${AI_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: getProxyHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Chat API: ' + (error?.message || error) };
    }
  })

  .listen(PORT);

console.log(
  `🚀 UltraBlabla Next-Gen Voice Server running at http://${app.server?.hostname}:${app.server?.port} (Proxying to ${AI_API_URL})`
);
