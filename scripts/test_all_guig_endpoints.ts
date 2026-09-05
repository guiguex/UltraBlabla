import WebSocket from 'ws';

/**
 * Diagnostic exhaustif et validation de TOUS les endpoints de api.guig.dev
 * (HTTP, HTTPS, WSS, Proxies locaux et Cloudflare Workers)
 */

interface TestResult {
  name: string;
  category: 'HTTP' | 'WebSocket' | 'LocalProxy';
  endpoint: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details: string;
}

const results: TestResult[] = [];
const API_BASE = 'https://api.guig.dev';
const WS_BASE = 'wss://api.guig.dev';
const LOCAL_BASE = 'http://127.0.0.1:3000';

const HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'https://guig.dev',
  'User-Agent': 'UltraBlabla-TestRunner/2030.1'
};

async function runAllEndpointTests() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   TEST COMPLET DES ENDPOINTS api.guig.dev & PROXIES ULTRABLABLA   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  // ──────────────────────────────────────────────────────────
  // 1. Endpoints Directs HTTP/REST sur https://api.guig.dev
  // ──────────────────────────────────────────────────────────
  console.log('─── [1/3] TESTS REST API (https://api.guig.dev) ─────────────────');

  // 1.1 Health
  await testHttp('Health Status', `${API_BASE}/health`, 'GET');

  // 1.2 Models
  await testHttp('Catalogue Modèles', `${API_BASE}/v1/models`, 'GET', undefined, (data) => {
    return Array.isArray(data.data) && data.data.length > 0
      ? `${data.data.length} modèles disponibles (${data.data.map((m: any) => m.id.split('/').pop()).join(', ')})`
      : 'Aucun modèle listé';
  });

  // 1.3 Voices (voice/voices)
  await testHttp('Catalogue Voix (voice/voices)', `${API_BASE}/v1/voice/voices`, 'GET', undefined, (data) => {
    return `${data.voices?.length || 0} voix (${data.voices?.map((v: any) => v.id).join(', ')})`;
  });

  // 1.4 Voices (audio/voices)
  await testHttp('Catalogue Voix (audio/voices)', `${API_BASE}/v1/audio/voices`, 'GET', undefined, (data) => {
    return `${data.voices?.length || 0} voix (${data.voices?.map((v: any) => v.id).join(', ')})`;
  });

  // 1.5 Memory Session Minting
  await testHttp('Minting Session Épisodique', `${API_BASE}/v1/memory/session`, 'POST', {}, (data) => {
    return `session_id: ${data.session_id ? data.session_id.slice(0, 8) + '...' : 'absent'}`;
  });

  // 1.6 LLM Chat Completion (GLM 5.3 Flash)
  await testHttp('LLM Chat (@cf/zai-org/glm-5.3-flash)', `${API_BASE}/v1/chat/completions`, 'POST', {
    model: '@cf/zai-org/glm-5.3-flash',
    messages: [{ role: 'user', content: 'Dis bonjour court.' }],
    max_tokens: 15
  }, (data) => {
    const text = data.choices?.[0]?.message?.content || JSON.stringify(data);
    return `Réponse: "${text.trim()}"`;
  });

  // 1.7 LLM Chat Completion (Llama 3.1 8B Instruct Fast)
  await testHttp('LLM Chat (@cf/meta/llama-3.1-8b-instruct-fast)', `${API_BASE}/v1/chat/completions`, 'POST', {
    model: '@cf/meta/llama-3.1-8b-instruct-fast',
    messages: [{ role: 'user', content: 'Dis oui en un mot.' }],
    max_tokens: 10
  }, (data) => {
    const text = data.choices?.[0]?.message?.content || JSON.stringify(data);
    return `Réponse: "${text.trim()}"`;
  });

  // 1.8 TTS Speech (Voix Rémi)
  await testHttpAudio('TTS Synthèse (Voix: remi)', `${API_BASE}/v1/audio/speech`, {
    input: 'Bonjour, ceci est un test de la voix Rémi.',
    voice: 'remi'
  });

  // 1.9 TTS Speech (Voix Mélissa)
  await testHttpAudio('TTS Synthèse (Voix: melissa)', `${API_BASE}/v1/audio/speech`, {
    input: 'Bonjour, ceci est un test de la voix Mélissa.',
    voice: 'melissa'
  });

  // 1.10 TTS Speech (Voix Guillaume)
  await testHttpAudio('TTS Synthèse (Voix: guillaume)', `${API_BASE}/v1/audio/speech`, {
    input: 'Bonjour, ceci est un test de la voix Guillaume.',
    voice: 'guillaume'
  });

  // ──────────────────────────────────────────────────────────
  // 2. Endpoints WebSockets Temps Réel sur wss://api.guig.dev
  // ──────────────────────────────────────────────────────────
  console.log('\n─── [2/3] TESTS WEBSOCKET STREAMING (wss://api.guig.dev) ─────────');

  // 2.1 ASR WebSocket Stream
  await testAsrWebSocket();

  // 2.2 Voice-to-Voice Streaming WebSocket
  await testVoiceWebSocket();

  // ──────────────────────────────────────────────────────────
  // 3. Proxies Locaux & Intégration dans le Serveur UltraBlabla
  // ──────────────────────────────────────────────────────────
  console.log('\n─── [3/3] TESTS PROXIES SERVEUR LOCAL (localhost:3000) ──────────');

  await testLocalProxy('Local Voice Catalog Proxy', `${LOCAL_BASE}/api/voice/voices`, 'GET');
  await testLocalProxyAudio('Local TTS Proxy', `${LOCAL_BASE}/api/voice/speak`, {
    input: 'Test de synthèse via le proxy local.',
    voice: 'remi'
  });
  await testLocalProxy('Local Chat Completion Proxy', `${LOCAL_BASE}/api/chat`, 'POST', {
    messages: [{ role: 'user', content: 'Test local' }]
  });

  // ──────────────────────────────────────────────────────────
  // Synthèse Finale
  // ──────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('                 RÉCAPITULATIF DES TESTS                       ');
  console.log('═══════════════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    const tag = `[${r.category}]`.padEnd(14);
    const name = r.name.padEnd(38);
    const ms = `${r.durationMs}ms`.padStart(8);
    console.log(`${icon} ${tag} ${name} ${ms} -> ${r.details}`);
  });

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log(`TOTAL : ${passed} RÉUSSIS / ${failed} ÉCHECS SUR ${results.length} TESTS`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

async function testHttp(name: string, url: string, method: string, body?: any, detailExtractor?: (data: any) => string) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers: HEADERS,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000)
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      const errText = await res.text();
      results.push({ name, category: 'HTTP', endpoint: url, status: 'FAIL', durationMs: dur, details: `HTTP ${res.status}: ${errText.slice(0, 50)}` });
      console.log(`❌ [HTTP] ${name} (${dur}ms) -> HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    const det = detailExtractor ? detailExtractor(data) : 'HTTP 200 OK';
    results.push({ name, category: 'HTTP', endpoint: url, status: 'PASS', durationMs: dur, details: det });
    console.log(`✅ [HTTP] ${name} (${dur}ms) -> ${det}`);
  } catch (err: any) {
    const dur = Date.now() - t0;
    results.push({ name, category: 'HTTP', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
    console.log(`❌ [HTTP] ${name} (${dur}ms) -> ${err.message}`);
  }
}

async function testHttpAudio(name: string, url: string, body: any) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000)
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      const err = await res.text();
      results.push({ name, category: 'HTTP', endpoint: url, status: 'FAIL', durationMs: dur, details: `HTTP ${res.status}: ${err.slice(0, 50)}` });
      console.log(`❌ [HTTP] ${name} (${dur}ms) -> HTTP ${res.status}`);
      return;
    }
    const buf = await res.arrayBuffer();
    const ct = res.headers.get('content-type') || 'audio';
    const det = `${buf.byteLength} octets (${ct})`;
    results.push({ name, category: 'HTTP', endpoint: url, status: 'PASS', durationMs: dur, details: det });
    console.log(`✅ [HTTP] ${name} (${dur}ms) -> ${det}`);
  } catch (err: any) {
    const dur = Date.now() - t0;
    results.push({ name, category: 'HTTP', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
    console.log(`❌ [HTTP] ${name} (${dur}ms) -> ${err.message}`);
  }
}

async function testAsrWebSocket() {
  const url = `${WS_BASE}/v1/asr/stream`;
  const t0 = Date.now();
  return new Promise<void>((resolve) => {
    try {
      const ws = new WebSocket(url, {
        headers: { 'Origin': 'https://guig.dev' }
      });
      let readyMsg = '';
      const timer = setTimeout(() => {
        ws.close();
        const dur = Date.now() - t0;
        results.push({ name: 'ASR Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: 'Timeout 5s' });
        console.log(`❌ [WS] ASR Stream (${dur}ms) -> Timeout`);
        resolve();
      }, 5000);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'start', language: 'fr', sample_rate: 16000 }));
        setTimeout(() => ws.send(JSON.stringify({ type: 'stop' })), 400);
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.type === 'ready') readyMsg = `Ready (Modèle: ${parsed.model || 'Nova'})`;
          if (parsed.type === 'final') {
            clearTimeout(timer);
            ws.close();
            const dur = Date.now() - t0;
            results.push({ name: 'ASR Stream (wss)', category: 'WebSocket', endpoint: url, status: 'PASS', durationMs: dur, details: readyMsg || 'Connecté & Opérationnel' });
            console.log(`✅ [WS] ASR Stream (${dur}ms) -> ${readyMsg || 'Connecté & Opérationnel'}`);
            resolve();
          }
        } catch {}
      });

      ws.on('error', (err) => {
        clearTimeout(timer);
        const dur = Date.now() - t0;
        results.push({ name: 'ASR Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
        console.log(`❌ [WS] ASR Stream (${dur}ms) -> ${err.message}`);
        resolve();
      });
    } catch (e: any) {
      const dur = Date.now() - t0;
      results.push({ name: 'ASR Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: e.message });
      console.log(`❌ [WS] ASR Stream (${dur}ms) -> ${e.message}`);
      resolve();
    }
  });
}

async function testVoiceWebSocket() {
  const url = `${WS_BASE}/v1/voice/stream`;
  const t0 = Date.now();
  return new Promise<void>((resolve) => {
    try {
      const ws = new WebSocket(url, {
        headers: { 'Origin': 'https://guig.dev' }
      });
      let tokens = 0;
      let audioChunks = 0;
      let reply = '';
      let format = '';

      const timer = setTimeout(() => {
        ws.close();
        const dur = Date.now() - t0;
        results.push({ name: 'Voice-to-Voice Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: 'Timeout 12s' });
        console.log(`❌ [WS] Voice-to-Voice Stream (${dur}ms) -> Timeout`);
        resolve();
      }, 12000);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'chat',
          text: 'Dis bonjour court.',
          voice: 'remi'
        }));
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.type === 'token') {
            tokens++;
            reply += parsed.content;
          } else if (parsed.type === 'audio') {
            audioChunks++;
            format = parsed.format || 'pcm';
          } else if (parsed.type === 'done') {
            clearTimeout(timer);
            ws.close();
            const dur = Date.now() - t0;
            const det = `${tokens} tokens, ${audioChunks} chunks audio (${format.toUpperCase()}), TTFA: ${parsed.ttfa_ms || dur}ms`;
            results.push({ name: 'Voice-to-Voice Stream (wss)', category: 'WebSocket', endpoint: url, status: 'PASS', durationMs: dur, details: det });
            console.log(`✅ [WS] Voice-to-Voice Stream (${dur}ms) -> ${det}`);
            resolve();
          }
        } catch {}
      });

      ws.on('error', (err) => {
        clearTimeout(timer);
        const dur = Date.now() - t0;
        results.push({ name: 'Voice-to-Voice Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
        console.log(`❌ [WS] Voice-to-Voice Stream (${dur}ms) -> ${err.message}`);
        resolve();
      });
    } catch (e: any) {
      const dur = Date.now() - t0;
      results.push({ name: 'Voice-to-Voice Stream (wss)', category: 'WebSocket', endpoint: url, status: 'FAIL', durationMs: dur, details: e.message });
      console.log(`❌ [WS] Voice-to-Voice Stream (${dur}ms) -> ${e.message}`);
      resolve();
    }
  });
}

async function testLocalProxy(name: string, url: string, method: string, body?: any) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000)
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      results.push({ name, category: 'LocalProxy', endpoint: url, status: 'FAIL', durationMs: dur, details: `HTTP ${res.status}` });
      console.log(`❌ [Proxy] ${name} (${dur}ms) -> HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    const src = res.headers.get('x-voice-source') || 'proxy';
    results.push({ name, category: 'LocalProxy', endpoint: url, status: 'PASS', durationMs: dur, details: `HTTP 200 (source: ${src})` });
    console.log(`✅ [Proxy] ${name} (${dur}ms) -> HTTP 200 (source: ${src})`);
  } catch (err: any) {
    const dur = Date.now() - t0;
    results.push({ name, category: 'LocalProxy', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
    console.log(`❌ [Proxy] ${name} (${dur}ms) -> ${err.message}`);
  }
}

async function testLocalProxyAudio(name: string, url: string, body: any) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000)
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      results.push({ name, category: 'LocalProxy', endpoint: url, status: 'FAIL', durationMs: dur, details: `HTTP ${res.status}` });
      console.log(`❌ [Proxy] ${name} (${dur}ms) -> HTTP ${res.status}`);
      return;
    }
    const buf = await res.arrayBuffer();
    const src = res.headers.get('x-voice-source') || 'proxy';
    results.push({ name, category: 'LocalProxy', endpoint: url, status: 'PASS', durationMs: dur, details: `${buf.byteLength} octets audio (source: ${src})` });
    console.log(`✅ [Proxy] ${name} (${dur}ms) -> ${buf.byteLength} octets audio (source: ${src})`);
  } catch (err: any) {
    const dur = Date.now() - t0;
    results.push({ name, category: 'LocalProxy', endpoint: url, status: 'FAIL', durationMs: dur, details: err.message });
    console.log(`❌ [Proxy] ${name} (${dur}ms) -> ${err.message}`);
  }
}

runAllEndpointTests();
