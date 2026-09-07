/**
 * Build: esbuild + CosteGieF 3-patch pattern for onnxruntime-web in Cloudflare Workers.
 *
 *  Patch 1: preamble — static imports for the precompiled WASM module
 *           (CompiledWasm rule in wrangler.jsonc compiles at deploy time,
 *           bypassing workerd's WebAssembly.compile() block).
 *
 *  Patch 2: instantiateWasm — inject a callback onto ORT's Emscripten
 *           config that uses the precompiled module directly, no compile().
 *
 *  Patch 3: kill dynamic import() — workerd rejects variable dynamic
 *           imports at module analysis time.
 *
 * The ONNX model is NOT bundled — it's fetched at runtime by onnx-inference.ts
 * from the frontend (single source of truth).
 *
 * The WASM files in public/onnxruntime-web/ are served via the Worker's
 * /onnxruntime-web/* route (backed by the R2 wrangler binding) to the browser.
 */
import * as esbuild from "esbuild";
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("dist");
const WASM_URL = "https://vad.guig.dev/ort-wasm-simd-threaded.asyncify.wasm";
const LOCAL_FALLBACK = resolve("node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm");
const OUT_WASM = resolve(OUT, "ort-wasm-simd-threaded.asyncify.wasm");

// ── Cleanup ──
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// ── 1. esbuild bundle ──
await esbuild.build({
  entryPoints: ["src/worker.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outfile: resolve(OUT, "worker.mjs"),
  sourcemap: true,
  loader: { ".wasm": "file" },
  external: ["cloudflare:workers"],
  define: {
    "import.meta.url": JSON.stringify("https://placeholder.invalid/"),
  },
  logOverride: { "import-is-undefined": "silent" },
});

// ── 2. Fetch WASM from vad.guig.dev (R2-backed) → dist/ for CompiledWasm rule ──
console.log(`  ⬇️  fetching WASM from ${WASM_URL}`);
let wasmResponse = await fetch(WASM_URL);
if (!wasmResponse.ok && existsSync(LOCAL_FALLBACK)) {
  console.log(`  ⚠️  ${WASM_URL} returned ${wasmResponse.status} — falling back to local node_modules copy (first deploy bootstrap)`);
  wasmResponse = new Response(readFileSync(LOCAL_FALLBACK));
}
if (!wasmResponse.ok) {
  throw new Error(`Failed to fetch WASM from ${WASM_URL}: ${wasmResponse.status} ${wasmResponse.statusText}. Make sure the Worker is already deployed and serving WASM.`);
}
const wasmBytes = new Uint8Array(await wasmResponse.arrayBuffer());
writeFileSync(OUT_WASM, wasmBytes);
console.log(`  ✅ fetched ort-wasm-simd-threaded.asyncify.wasm (${(wasmBytes.length / 1024 / 1024).toFixed(2)} MiB)`);

// ── 3. CosteGieF post-process patches ──
let code = readFileSync(resolve(OUT, "worker.mjs"), "utf8");

// Patch 1: preamble — static import for precompiled WASM module
const preamble = [
  `import __ORT_WASM__ from "./ort-wasm-simd-threaded.asyncify.wasm";`,
  `globalThis.__ORT_WASM__ = __ORT_WASM__;`,
].join("\n") + "\n";
code = preamble + code;

// Patch 2: inject instantiateWasm callback on ORT's Emscripten config
const configMatch = code.match(/let\s+(\w+)\s*=\s*\{\s*numThreads:\s*(\w+)\s*\}/);
if (!configMatch) {
  throw new Error("Could not find Emscripten config `let X = { numThreads: Y }` — ORT version changed?");
}
const configVar = configMatch[1];

const factoryCallRe = new RegExp(`(\\w+)\\(${configVar}\\)\\.then\\(`);
const factoryMatch = code.match(factoryCallRe);
if (!factoryMatch) {
  throw new Error(`Could not find factory call FUNC(${configVar}).then( — ORT version changed?`);
}

const instantiateWasmSnippet =
  `${configVar}.instantiateWasm = (imports, cb) => {` +
  ` var inst = new WebAssembly.Instance(__ORT_WASM__, imports);` +
  ` cb(inst, __ORT_WASM__);` +
  ` return inst.exports; };`;

code = code.replace(factoryMatch[0], instantiateWasmSnippet + " " + factoryMatch[0]);
console.log(`  ✅ injected instantiateWasm on config var "${configVar}"`);

// Patch 3: kill dynamic import(variable) — workerd rejects at module analysis
let dynamicImportCount = 0;
code = code.replace(/await import\([\s\S]*?\)/g, (match) => {
  if (/await import\(\s*["'`]/.test(match)) return match; // keep static string imports
  dynamicImportCount++;
  return 'await Promise.reject(new Error("dynamic import disabled in workerd"))';
});
console.log(`  ✅ patched ${dynamicImportCount} dynamic import() call(s)`);

// ── 4. Write + verify ──
writeFileSync(resolve(OUT, "worker.mjs"), code);
console.log(`\n✅ Build complete — dist/worker.mjs (${(code.length / 1024).toFixed(0)} KB)`);

for (const f of ["worker.mjs", "ort-wasm-simd-threaded.asyncify.wasm"]) {
  if (!existsSync(resolve(OUT, f))) {
    throw new Error(`Missing dist/${f}`);
  }
}
console.log("✅ all assets verified\n");
console.log("Deploy with:");
console.log("  wrangler deploy");
