/**
 * Pipeline de Test E2E de Bout-en-Bout - UltraBlabla
 * Valide : Catalogue Voix -> LLM Chat -> Synthèse Vocale TTS -> Firebase CDN
 */

const API_BASE = 'https://api.guig.dev/v1';
const HEADERS = {
  'Origin': 'https://guig.dev',
  'Content-Type': 'application/json',
  'User-Agent': 'UltraBlabla-E2E-Tester/1.0'
};

async function runE2ETests() {
  console.log('🧪 ===============================================');
  console.log('🧪 DÉBUT DES TESTS E2E ULTRABLABLA (api.guig.dev)');
  console.log('🧪 ===============================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Catalogue des Voix
  try {
    const t0 = Date.now();
    const res = await fetch(`${API_BASE}/voice/voices?lang=fr`, { headers: HEADERS });
    const dur = Date.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`✅ [1/4] Catalogue Voix FR OK (${dur}ms) - ${data.voices?.length || 0} voix détectées`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [1/4] Échec Catalogue Voix:`, err.message);
    failed++;
  }

  // Test 2: LLM Llama 3.1 8B Instruct Fast
  let generatedText = '';
  try {
    const t0 = Date.now();
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        model: '@cf/meta/llama-3.1-8b-instruct-fast',
        messages: [
          { role: 'system', content: 'Tu es UltraBlabla. Réponds en moins de 10 mots.' },
          { role: 'user', content: 'Dis bonjour.' }
        ],
        max_tokens: 30,
        temperature: 0.5
      })
    });
    const dur = Date.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    generatedText = data.choices?.[0]?.message?.content || data.response || 'Bonjour';
    console.log(`✅ [2/4] LLM Chat OK (${dur}ms) -> "${generatedText.trim()}"`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [2/4] Échec LLM Chat:`, err.message);
    failed++;
  }

  // Test 3: Synthèse Vocale TTS (Deepgram Aura-1 / MeloTTS)
  try {
    const t0 = Date.now();
    const res = await fetch(`${API_BASE}/audio/speech`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        input: generatedText.trim() || 'Bonjour !',
        voice: 'asteria',
        model: '@cf/deepgram/aura-1'
      })
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} : ${errText}`);
    }
    const audioBuffer = await res.arrayBuffer();
    if (audioBuffer.byteLength < 500) throw new Error('Audio retourné trop court');
    console.log(`✅ [3/4] Synthèse Vocale TTS OK (${dur}ms) -> ${audioBuffer.byteLength} octets MP3 reçus`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [3/4] Échec Synthèse Vocale:`, err.message);
    failed++;
  }

  // Test 4: Déploiement CDN Firebase Hosting
  try {
    const t0 = Date.now();
    const res = await fetch(`https://blablabla-74743714-2076b.web.app/`);
    const dur = Date.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`✅ [4/4] Validation Live Firebase CDN OK (${dur}ms) -> Status ${res.status} HTTPS`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [4/4] Échec Validation Firebase:`, err.message);
    failed++;
  }

  console.log('\n===============================================');
  console.log(`🏁 RÉSULTATS : ${passed} passés, ${failed} échoués sur 4 tests.`);
  console.log('===============================================\n');

  if (failed > 0) process.exit(1);
}

runE2ETests();
