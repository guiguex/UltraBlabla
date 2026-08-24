async function testSocket(url: string, origin: string) {
  console.log(`\n--- Testing ${url} (Origin: ${origin}) ---`);
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url, {
        headers: {
          Origin: origin,
        }
      } as any);

      const timer = setTimeout(() => {
        console.error('TIMEOUT after 5s');
        ws.close();
        resolve(false);
      }, 5000);

      ws.onopen = () => {
        console.log('WS OPENED!');
        clearTimeout(timer);
        if (url.includes('voice')) {
          ws.send(JSON.stringify({ type: 'chat', text: 'Bonjour', voice: 'guillaume' }));
        } else if (url.includes('asr')) {
          ws.send(JSON.stringify({ type: 'start', language: 'fr-CA', sample_rate: 16000 }));
        }
      };

      ws.onmessage = (ev) => {
        console.log('WS MESSAGE RECEIVED:', ev.data);
      };

      ws.onerror = (err: any) => {
        console.error('WS ERROR:', err.message || err);
      };

      ws.onclose = (ev) => {
        console.log(`WS CLOSED: code=${ev.code}, reason=${ev.reason}`);
        clearTimeout(timer);
        resolve(true);
      };
    } catch (e) {
      console.error('Exception:', e);
      resolve(false);
    }
  });
}

await testSocket('wss://api.guig.dev/v1/asr/stream', 'https://ultrablabla.guig.dev');
await testSocket('wss://api.guig.dev/v1/voice/stream', 'https://ultrablabla.guig.dev');
