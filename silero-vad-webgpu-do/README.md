# Silero VAD v5 — WebGPU DO + R2 (WASM from R2)

**Solves the 26.5 MiB WASM problem.** ORT's `ort-wasm-simd-threaded.asyncify.wasm` is 26.5 MiB — too large for Workers static assets (25 MiB per-file limit) and would blow the 64 MiB Worker bundle. This project stores WASM + model in **R2** and serves them via a Worker route.

## The key trick

```js
// build.mjs — esbuild config
external: ["*.wasm", "*.onnx"]  // ← WASM NOT bundled into Worker
```

```js
// onnx-inference.ts — runtime
ort.env.wasm.wasmPaths = "https://<worker-origin>/wasm/";
// ORT fetches WASM from R2 (via Worker route) at session creation time
```

```js
// worker.ts — R2 proxy
if (url.pathname.startsWith("/wasm/")) {
  const object = await env.VAD_ASSETS.get(key);
  return new Response(object.body, { headers });
}
```

## Setup

1. `npm install`
2. `npx wrangler r2 bucket create vad-assets`
3. Download `silero_vad_v5.onnx` into `public/`
4. `npm run r2:upload` — uploads all ORT WASM + model to R2
5. `npm run deploy` — builds with esbuild (WASM excluded) + deploys

## File sizes

| File | Size | Where |
|---|---|---|
| `ort-wasm-simd-threaded.asyncify.wasm` | 26.5 MiB | **R2** |
| Other ORT WASM variants | 6-14 MiB | R2 |
| `silero_vad_v5.onnx` (quantized) | ~1.1 MiB | R2 |
| Worker bundle (JS only) | ~2 MiB | **Deployed** |
| Static assets (HTML/JS) | ~15 KB | **Deployed** |

Worker bundle: ~2 MiB (well under 64 MiB limit)
Largest R2 object: 26.5 MiB (well under 5 TiB limit)
