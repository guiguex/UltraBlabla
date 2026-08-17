const API_BASE = 'https://api.guig.dev/v1';
const HEADERS = {
  'Origin': 'https://guig.dev',
  'Content-Type': 'application/json',
};

async function test() {
  const res = await fetch(`${API_BASE}/audio/speech`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      input: 'Bonjour tout le monde',
      voice: 'asteria',
      model: '@cf/deepgram/aura-1'
    })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body length:', text.length, 'preview:', text.slice(0, 100));
}

test();
