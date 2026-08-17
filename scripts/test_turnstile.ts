const API_BASE = 'http://localhost:3000/api';

async function testTurnstile() {
  console.log('Testing Turnstile validation on local API...');
  
  // Test 1: No Turnstile token
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://guig.dev'
      },
      body: JSON.stringify({
        model: '@cf/meta/llama-3.1-8b-instruct-fast',
        messages: [{ role: 'user', content: 'Test' }]
      })
    });
    console.log(`[Test 1] No token -> HTTP ${res.status}`);
  } catch (err: any) {
    console.error(`[Test 1] Error: ${err.message}`);
  }

  // Test 2: Invalid Turnstile token
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://guig.dev',
        'X-Turnstile-Token': 'invalid_token_123'
      },
      body: JSON.stringify({
        model: '@cf/meta/llama-3.1-8b-instruct-fast',
        messages: [{ role: 'user', content: 'Test' }]
      })
    });
    console.log(`[Test 2] Invalid token -> HTTP ${res.status}`);
  } catch (err: any) {
    console.error(`[Test 2] Error: ${err.message}`);
  }
}

testTurnstile();
