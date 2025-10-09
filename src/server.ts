import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

// Configuration des URLs des serveurs AI (UltraCoder)
const ULTRACODER_API = process.env.ULTRACODER_API || 'http://127.0.0.1:8441';
const NEUTT_API = process.env.NEUTT_API || 'https://api-inference.huggingface.co/models/neuphonic/neutts-air';

const app = new Elysia()
  .use(staticPlugin({
    assets: 'public',
    prefix: '/',
  }))
  .get('/', ({ set }) => {
    set.headers['Content-Type'] = 'text/html';
    return Bun.file('public/index.html');
  })
  
  // Proxy vers UltraCoder API (Chat completion)
  .post('/api/chat', async ({ body, set }) => {
    try {
      const response = await fetch(`${ULTRACODER_API}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`UltraCoder API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      set.headers['Content-Type'] = 'application/json';
      return data;
    } catch (error) {
      set.status = 500;
      return { error: 'Erreur UltraCoder API: ' + error };
    }
  })
  
  // ASR français avec Vosk (via UltraCoder ou direct Web Speech API)
  .post('/api/stt', async ({ body, set }) => {
    try {
      // Pour l'instant, on utilise Web Speech API côté client
      // Tu peux ajouter un endpoint Vosk dans ton UltraCoder plus tard
      set.status = 501;
      return { error: 'STT: Utilise Web Speech API côté client pour l\'instant' };
    } catch (error) {
      set.status = 500;
      return { error: 'Erreur STT: ' + error };
    }
  })
  
  // TTS français avec neuTTS (Hugging Face)
  .post('/api/tts', async ({ body, set }) => {
    try {
      const { text } = body as { text: string };
      
      const response = await fetch(NEUTT_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HF_TOKEN || ''}` // Token Hugging Face
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            voice: 'male_1', // ou 'female_1'
            language: 'fr'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`neuTTS API Error: ${response.statusText}`);
      }
      
      const audioBuffer = await response.arrayBuffer();
      set.headers['Content-Type'] = 'audio/wav';
      return new Response(audioBuffer);
    } catch (error) {
      set.status = 500;
      return { error: 'Erreur neuTTS: ' + error };
    }
  })
  
  .listen(3000);

console.log(
  ` UltraBlabla server is running at http://${app.server?.hostname}:${app.server?.port}`
);
