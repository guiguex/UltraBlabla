import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

// Configuration des URLs des serveurs AI (Cloudflare Workers AI Proxy)
const AI_API_URL = process.env.AI_API_URL || 'https://api.guig.dev';
const PORT = Number(process.env.PORT) || 3000;

// Headers par défaut pour la communication avec api.guig.dev
const getProxyHeaders = (incomingHeaders: any = {}, extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Origin': 'https://guig.dev',
    'User-Agent': 'UltraBlabla-Voice-Matrix/4.0',
    'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN || ''}`,
    ...extraHeaders,
  };
  if (incomingHeaders['x-turnstile-token']) headers['X-Turnstile-Token'] = incomingHeaders['x-turnstile-token'];
  return headers;
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

  // Chat Completion (OpenAI format)
  .post('/api/chat', async ({ body, headers, set }) => {
    try {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const response = await fetch(`${AI_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: getProxyHeaders(headers, { 'Content-Type': 'application/json' }),
        body: payload
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

  // Health check
  .get('/healthz', () => ({ status: 'ok', uptime: process.uptime() }))

  // Voice Catalog Proxy
  .get('/api/voice/voices', async ({ headers, set }) => {
    try {
      const response = await fetch(`${AI_API_URL}/v1/voice/voices`, {
        headers: getProxyHeaders(headers)
      });
      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Voice Catalog: ' + (error?.message || error) };
    }
  })

  // Voice Speak Proxy
  .post('/api/voice/speak', async ({ body, headers, set }) => {
    try {
      const response = await fetch(`${AI_API_URL}/v1/voice/speak`, {
        method: 'POST',
        headers: getProxyHeaders(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`Speak API error ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      set.headers['Content-Type'] = response.headers.get('Content-Type') || 'audio/mpeg';
      return new Uint8Array(buffer);
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Voice Speak: ' + (error?.message || error) };
    }
  })

  // Voice Transcribe Proxy
  .post('/api/voice/transcribe', async ({ body, headers, set }) => {
    try {
      const response = await fetch(`${AI_API_URL}/v1/voice/transcribe`, {
        method: 'POST',
        headers: getProxyHeaders(headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Erreur Voice Transcribe: ' + (error?.message || error) };
    }
  })

  .listen(PORT);

console.log(
  `🚀 UltraBlabla Next-Gen Voice Server running at http://${app.server?.hostname}:${app.server?.port} (Proxying to ${AI_API_URL})`
);
