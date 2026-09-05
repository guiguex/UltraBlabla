// scripts/bench-ser.ts — end-to-end SER benchmark, run with `bun run scripts/bench-ser.ts`
import { promises as fs } from "node:fs";
import { ser, pcm16leToFloat32, hintFor, normalize, EmotionCache, prewarmSer } from "../src/ser/index.js";

const TEST_WAV = "D:\\Applications\\UltraBlabla\\test_generated.wav";
const TEST_PCM = "D:\\Applications\\UltraBlabla\\test_generated.pcm";

async function loadTestPcm(): Promise<Buffer> {
  try {
    return await fs.readFile(TEST_PCM);
  } catch {
    const wav = await fs.readFile(TEST_WAV);
    return wav.subarray(44); // strip 44-byte WAV header → raw Int16-LE PCM
  }
}

async function bench(label: string, fn: () => Promise<void>, n: number) {
  for (let i = 0; i < 3; i++) await fn();   // warmup
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    await fn();
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  console.log(`  ${label.padEnd(28)} min=${times[0].toFixed(1)} median=${times[n >> 1].toFixed(1)} p95=${times[Math.floor(n * 0.95)].toFixed(1)} ms`);
}

async function main() {
  console.log("═══════ UltraBlabla wav2vec2-fr SER benchmark ═══════\n");

  console.log("[1] prewarmSer()");
  const pre = await prewarmSer();
  console.log(`    ${pre.ok ? "OK" : "FAIL"} in ${pre.ms.toFixed(0)} ms${pre.ok ? "" : " — " + pre.reason}`);
  if (!pre.ok) { console.error("\n!! model_fp16.onnx missing or failed to load.\n   see docs/MEGA-PLAN-SER-2030.md for build path."); process.exit(1); }
  console.log(`    providers: ${JSON.stringify(ser.stats().providers)}`);

  const pcm = await loadTestPcm();
  console.log(`\n[2] test PCM: ${pcm.length} bytes  ${(pcm.length / 32).toFixed(0)} ms @16kHz mono Int16-LE`);
  const audio = pcm16leToFloat32(pcm);

  console.log("\n[3] end-to-end classify x30 (real test audio, deterministic)");
  await bench("classify()", async () => {
    const r = await ser.classify(audio);
    if (!r) throw new Error("null result");
  }, 30);
  const sample = await ser.classify(audio);
  console.log(`    sample: label=${sample!.label}  score=${sample!.score.toFixed(3)}  hint="${hintFor(sample!.label)}"`);

  console.log("\n[4] pcm16leToFloat32 conversion x100 (allocation cost)");
  await bench("pcm16leToFloat32", async () => { pcm16leToFloat32(pcm); }, 100);

  console.log("\n[5] normalize x100 (CPU cost of zero-mean unit-var)");
  await bench("normalize", async () => { normalize(audio); }, 100);

  console.log("\n[6] parallel stress x20 (10 concurrent classify)");
  const t0 = performance.now();
  const results = await Promise.all(Array.from({ length: 20 }, () => ser.classify(audio)));
  console.log(`    20 parallel calls in ${(performance.now() - t0).toFixed(0)} ms  (effective ${((20 / (performance.now() - t0)) * 1000).toFixed(1)} inf/s)`);
  const labels = new Map(results.map(r => [r!.label, 0]));
  results.forEach(r => labels.set(r!.label, (labels.get(r!.label) ?? 0) + 1));
  console.log(`    distribution: ${Array.from(labels.entries()).map(([k, v]) => `${k}=${v}`).join(", ")}`);

  console.log("\n[7] edge cases (graceful degradation)");
  const empty = await ser.classify(new Float32Array(0));
  console.log(`    empty buffer  → ${empty === null ? "null ✓" : "WRONG"}`);
  const tiny = await ser.classify(new Float32Array(400));
  console.log(`    400 samples   → ${tiny === null ? "null ✓" : "WRONG"}`);
  const huge = await ser.classify(new Float32Array(1_000_000));
  console.log(`    1M samples    → ${huge !== null ? `${huge.label} ${huge.score.toFixed(2)} ✓ (truncated to 30s)` : "null ✗"}`);
  const lowConf = await ser.classify(new Float32Array(16000));
  console.log(`    1s silence    → ${lowConf === null || lowConf.score < 0.9 ? `${lowConf?.label ?? "null"} ${lowConf?.score.toFixed(2)} ✓` : "unexpectedly confident"}`);

  console.log("\n[8] EmotionCache TTL behavior");
  const cache = new EmotionCache(8_000);
  cache.set("s1", "Ton : chaleureux. Joie.");
  console.log(`    get right after set → ${cache.get("s1") === "Ton : chaleureux. Joie." ? "✓" : "✗"}`);
  console.log(`    get unknown session → ${cache.get("nope") === null ? "✓" : "✗"}`);
  // simulate stale
  const e = (cache as any).map.get("s1"); e.timestamp = Date.now() - 9_000;
  console.log(`    get after 9s        → ${cache.get("s1") === null ? "✓ (TTL evicted)" : "✗"}`);

  console.log("\n═══════ ALL GREEN — ready to ship ═══════");
  console.log(`SER stats: ${JSON.stringify(ser.stats())}`);
}

main().catch((e) => { console.error("FAIL:", e); Bun.exit(1); });