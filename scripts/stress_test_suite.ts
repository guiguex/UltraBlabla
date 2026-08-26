import { performance } from 'perf_hooks';

interface TurnMetric {
  turnIndex: number;
  userText: string;
  botReply: string;
  ttfaMs: number;
  totalMs: number;
  audioChunks: number;
  audioBytes: number;
}

interface ScenarioResult {
  scenarioName: string;
  totalTurns: number;
  turns: TurnMetric[];
  avgTtfaMs: number;
  avgTotalMs: number;
  success: boolean;
}

const SERVER_WS = 'ws://localhost:3000/v1/voice/stream';

// Helper: Run a single conversational turn over WebSocket
function runTurn(ws: WebSocket, userText: string, turnIndex: number): Promise<TurnMetric> {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    let firstAudioTime: number | null = null;
    let audioChunks = 0;
    let audioBytes = 0;
    let fullText = '';

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout on turn ${turnIndex} after 15s`));
    }, 15000);

    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'token') {
          fullText += data.content;
        } else if (data.type === 'audio') {
          audioChunks++;
          const buf = Buffer.from(data.data, 'base64');
          audioBytes += buf.length;
          if (firstAudioTime === null) {
            firstAudioTime = performance.now() - t0;
          }
        } else if (data.type === 'done') {
          const totalMs = performance.now() - t0;
          cleanup();
          resolve({
            turnIndex,
            userText,
            botReply: data.content || fullText,
            ttfaMs: firstAudioTime || totalMs,
            totalMs,
            audioChunks,
            audioBytes
          });
        } else if (data.type === 'error') {
          cleanup();
          reject(new Error(`Server error on turn ${turnIndex}: ${data.message}`));
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const onError = (err: any) => {
      cleanup();
      reject(err);
    };

    function cleanup() {
      clearTimeout(timeout);
      ws.removeEventListener('message', onMessage);
      ws.removeEventListener('error', onError);
    }

    ws.addEventListener('message', onMessage);
    ws.addEventListener('error', onError);

    ws.send(JSON.stringify({
      type: 'chat',
      text: userText,
      voice: 'guillaume'
    }));
  });
}

// ─── TEST 1 : MULTI-TURN CONVERSATIONS (5 PERSONAS) ──────────────────────────
async function runMultiTurnScenarios(): Promise<ScenarioResult[]> {
  const scenarios = [
    {
      name: '1. Réservation Voyage (Précis & Court)',
      dialogue: [
        'Bonjour ! Je souhaite réserver un billet de train pour Montréal.',
        'Je pars demain matin vers 8 heures.',
        'Parfait, confirme la réservation pour 1 personne s\'il te plaît.'
      ]
    },
    {
      name: '2. Support Technique & Dépannage (Technique)',
      dialogue: [
        'Mon application ne parvient pas à se connecter à la base de données.',
        'L\'erreur affichée est connection refused sur le port 5432.',
        'Merci, je vérifie le pare-feu et le service postgres.'
      ]
    },
    {
      name: '3. Créativité & Récit (Imagination)',
      dialogue: [
        'Raconte-moi une courte légende sur la création des étoiles.',
        'Qui était le personnage principal de cette légende ?',
        'Quelle est la morale de cette histoire ?'
      ]
    },
    {
      name: '4. Questions-Réponses Rapides (Vitesse & Concision)',
      dialogue: [
        'Quelle est la distance entre la Terre et la Lune ?',
        'Combien de temps met la lumière du Soleil pour nous parvenir ?',
        'Et quelle est la vitesse du son dans l\'air ?'
      ]
    },
    {
      name: '5. Philosophie & Éthique IA (Nuance)',
      dialogue: [
        'Peux-tu ressentir des émotions humaines ?',
        'Penses-tu qu\'une IA pourra un jour avoir une conscience ?',
        'Comment garantis-tu la sécurité de mes données vocales ?'
      ]
    }
  ];

  console.log('\n===============================================================');
  console.log('  TEST 1 : 5 CONVERSATIONS MULTI-ÉCHANGES (SÉQUENTIELLES)');
  console.log('===============================================================');

  const results: ScenarioResult[] = [];

  for (const scen of scenarios) {
    console.log(`\n▶ Scenario : ${scen.name}`);
    const ws = new WebSocket(SERVER_WS);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const turns: TurnMetric[] = [];
    let scenSuccess = true;

    for (let i = 0; i < scen.dialogue.length; i++) {
      const prompt = scen.dialogue[i];
      try {
        const metric = await runTurn(ws, prompt, i + 1);
        turns.push(metric);
        console.log(`  [Tour ${i+1}] TTFA: \x1b[32m${metric.ttfaMs.toFixed(1)} ms\x1b[0m | Total: ${metric.totalMs.toFixed(1)} ms | Chunks: ${metric.audioChunks}`);
        console.log(`    User : "${prompt}"`);
        console.log(`    Bot  : "${metric.botReply.slice(0, 80)}..."`);
      } catch (err: any) {
        console.error(`  [Tour ${i+1}] Échec :`, err.message);
        scenSuccess = false;
        break;
      }
    }

    ws.close();

    const avgTtfa = turns.length ? turns.reduce((acc, t) => acc + t.ttfaMs, 0) / turns.length : 0;
    const avgTotal = turns.length ? turns.reduce((acc, t) => acc + t.totalMs, 0) / turns.length : 0;

    results.push({
      scenarioName: scen.name,
      totalTurns: turns.length,
      turns,
      avgTtfaMs: avgTtfa,
      avgTotalMs: avgTotal,
      success: scenSuccess
    });
  }

  return results;
}

// ─── TEST 2 : STRESS TEST CONCURRENCE (CLIENTS PARALLÈLES) ───────────────────
async function runConcurrentStressTest(concurrency: number): Promise<{
  concurrency: number;
  successCount: number;
  failCount: number;
  latencies: number[];
  ttfas: number[];
}> {
  console.log('\n===============================================================');
  console.log(`  TEST 2 : STRESS TEST DE CONCURRENCE (${concurrency} CLIENTS SIMULTANÉS)`);
  console.log('===============================================================');

  const prompts = [
    'Donne-moi une recette rapide de crêpes en 2 phrases.',
    'Quelles sont les 3 lois de la robotique d\'Asimov ?',
    'Explique la théorie de la relativité restreinte simplement.',
    'Comment fonctionne un moteur à explosion 4 temps ?',
    'Pourquoi le ciel est-il bleu et le coucher de soleil rouge ?'
  ];

  const tasks = Array.from({ length: concurrency }).map(async (_, idx) => {
    const prompt = prompts[idx % prompts.length];
    const ws = new WebSocket(SERVER_WS);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    try {
      const metric = await runTurn(ws, prompt, 1);
      ws.close();
      return { success: true, metric, clientId: idx + 1 };
    } catch (err: any) {
      ws.close();
      return { success: false, error: err.message, clientId: idx + 1 };
    }
  });

  const t0 = performance.now();
  const outputs = await Promise.all(tasks);
  const totalElapsed = performance.now() - t0;

  const successes = outputs.filter(o => o.success);
  const fails = outputs.filter(o => !o.success);
  const ttfas = successes.map(s => (s as any).metric.ttfaMs);
  const totals = successes.map(s => (s as any).metric.totalMs);

  console.log(`\n  Résultats Concurrence (${concurrency} flux) :`);
  console.log(`  - Succès : ${successes.length} / ${concurrency} (${(successes.length / concurrency * 100).toFixed(0)}%)`);
  console.log(`  - Échecs : ${fails.length}`);
  console.log(`  - TTFA Moyen : ${(ttfas.reduce((a, b) => a + b, 0) / ttfas.length).toFixed(1)} ms`);
  console.log(`  - Latence Totale Moyenne : ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)} ms`);
  console.log(`  - Temps d'exécution total du batch : ${totalElapsed.toFixed(1)} ms`);

  return {
    concurrency,
    successCount: successes.length,
    failCount: fails.length,
    latencies: totals,
    ttfas
  };
}

// ─── TEST 3 : STRESS TEST BARGE-IN RÉPÉTÉ (INTERRUPTIONS EN SÉRIE) ───────────
async function runBargeInStressTest(iterations: number): Promise<{
  iterations: number;
  successCount: number;
  avgInterruptAckMs: number;
  leakedChunks: number;
}> {
  console.log('\n===============================================================');
  console.log(`  TEST 3 : STRESS TEST BARGE-IN RÉPÉTÉ (${iterations} INTERRUPTIONS)`);
  console.log('===============================================================');

  let successCount = 0;
  let totalAckMs = 0;
  let totalLeaked = 0;

  for (let i = 1; i <= iterations; i++) {
    const ws = new WebSocket(SERVER_WS);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const result = await new Promise<{ ackMs: number; leaked: number; ok: boolean }>((resolve) => {
      let chunkCount = 0;
      let interrupted = false;
      let postInterruptChunks = 0;
      let interruptTime = 0;

      const timeout = setTimeout(() => {
        resolve({ ackMs: 0, leaked: postInterruptChunks, ok: false });
      }, 8000);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'audio') {
          chunkCount++;
          if (chunkCount === 1 && !interrupted) {
            interrupted = true;
            interruptTime = performance.now();
            ws.send(JSON.stringify({ type: 'interrupt' }));
          } else if (interrupted) {
            postInterruptChunks++;
          }
        } else if (data.type === 'interrupted') {
          const ackMs = performance.now() - interruptTime;
          clearTimeout(timeout);
          setTimeout(() => {
            resolve({ ackMs, leaked: postInterruptChunks, ok: postInterruptChunks === 0 });
          }, 300);
        }
      };

      ws.send(JSON.stringify({
        type: 'chat',
        text: 'Raconte-moi une histoire très longue et détaillée sur les mystères des fonds marins.',
        voice: 'guillaume'
      }));
    });

    ws.close();

    if (result.ok) {
      successCount++;
      totalAckMs += result.ackMs;
      console.log(`  [Interruption ${i}/${iterations}] \x1b[32mOK\x1b[0m (Ack en ${result.ackMs.toFixed(1)} ms, 0 chunk résiduel)`);
    } else {
      totalLeaked += result.leaked;
      console.log(`  [Interruption ${i}/${iterations}] \x1b[31mÉCHEC\x1b[0m (${result.leaked} chunks résiduels)`);
    }
  }

  const avgAck = successCount ? totalAckMs / successCount : 0;
  console.log(`\n  Résultats Barge-In (${iterations} runs) :`);
  console.log(`  - Succès : ${successCount} / ${iterations}`);
  console.log(`  - Ack Moyen du Serveur : ${avgAck.toFixed(2)} ms`);
  console.log(`  - Chunks résiduels totaux : ${totalLeaked}`);

  return {
    iterations,
    successCount,
    avgInterruptAckMs: avgAck,
    leakedChunks: totalLeaked
  };
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   ULTRABLABLA VOICE SYSTEM - ADVANCED STRESS TEST SUITE      ║');
  console.log('║   Architecture : DMR CUDA (7.75B) + qwen-tts (CUDA) + Elysia ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // 1. Multi-turn scenarios (15 tours au total)
  const multiTurnResults = await runMultiTurnScenarios();

  // 2. Concurrency stress test (3 et 5 clients simultanés)
  const concurrent3 = await runConcurrentStressTest(3);
  const concurrent5 = await runConcurrentStressTest(5);

  // 3. Repeated Barge-In stress test (5 interruptions consécutives)
  const bargeInResults = await runBargeInStressTest(5);

  // Output summary JSON
  const summary = {
    timestamp: new Date().toISOString(),
    multiTurnResults,
    concurrency3: concurrent3,
    concurrency5: concurrent5,
    bargeInResults
  };

  const fs = require('fs');
  fs.writeFileSync('stress_test_raw_results.json', JSON.stringify(summary, null, 2));
  console.log('\n[RÉSULTATS ENREGISTRÉS DANS stress_test_raw_results.json]');
}

main().catch(console.error);
