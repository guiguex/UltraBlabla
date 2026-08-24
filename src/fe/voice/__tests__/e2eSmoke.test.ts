import { describe, it, expect } from 'bun:test';

describe('UltraBlabla Smoke & Endpoints Test', () => {
  it('checks server config and health', async () => {
    const res = await fetch('http://localhost:44432/healthz');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });

  it('checks voice catalog proxy', async () => {
    const res = await fetch('http://localhost:44432/api/voice/voices');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.voices)).toBe(true);
    expect(data.voices.length).toBeGreaterThan(0);
  });

  it('checks chat completion proxy to api.guig.dev', async () => {
    const res = await fetch('http://localhost:44432/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: '@cf/moonshotai/kimi-k2.7-code',
        messages: [{ role: 'user', content: 'Reponds juste OK' }]
      })
    });
    if (!res.ok) {
      console.error('Chat error status:', res.status, 'body:', await res.text());
    }
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.choices?.[0]?.message?.content).toBeDefined();
  }, 15000);
});
