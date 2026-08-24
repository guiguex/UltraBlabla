async function testVoice() {
  console.log(`\n--- Testing wss://api.guig.dev/v1/voice/stream ---`);
  const ws = new WebSocket('wss://api.guig.dev/v1/voice/stream', {
    headers: { Origin: 'https://ultrablabla.guig.dev' }
  } as any);

  ws.onopen = () => {
    console.log('VOICE WS OPENED!');
    ws.send(JSON.stringify({ type: 'chat', text: 'Bonjour Guillaume', voice: 'guillaume' }));
  };

  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    console.log('VOICE WS MSG TYPE:', data.type, data.content || (data.data ? `audio chunk len=${data.data.length}` : ''));
    if (data.type === 'done' || data.type === 'error') {
      ws.close();
      process.exit(0);
    }
  };

  ws.onerror = (err: any) => {
    console.error('VOICE WS ERROR:', err.message || err);
  };

  ws.onclose = (ev) => {
    console.log(`VOICE WS CLOSED: code=${ev.code}, reason=${ev.reason}`);
  };
}

await testVoice();
