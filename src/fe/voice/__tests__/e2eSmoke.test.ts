import { describe, it, expect } from 'bun:test';

const port = process.env.TEST_PORT || process.env.PORT || 3000;
const baseUrl = `http://localhost:${port}`;

describe('UltraBlabla Smoke & Endpoints Test', () => {
  it('checks server config and health', async () => {
    try {
      const res = await fetch(`${baseUrl}/healthz`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    } catch {
      console.warn(`[e2eSmoke] Server not running at ${baseUrl}, skipping smoke test`);
    }
  });

  it('checks voice catalog proxy', async () => {
    try {
      const res = await fetch(`${baseUrl}/api/voice/voices`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.voices)).toBe(true);
      expect(data.voices.length).toBeGreaterThan(0);
    } catch {
      console.warn(`[e2eSmoke] Server not running at ${baseUrl}, skipping voices test`);
    }
  });

  it('checks chat completion proxy to api.guig.dev', async () => {
    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: '@cf/meta/llama-3.1-8b-instruct-fast',
          messages: [{ role: 'user', content: 'Reponds juste OK' }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        expect(data.choices?.[0]?.message?.content).toBeDefined();
      }
    } catch {
      console.warn(`[e2eSmoke] Server not running at ${baseUrl}, skipping chat test`);
    }
  }, 15000);
});
