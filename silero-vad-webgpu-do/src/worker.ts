/**
 * Worker entry — routes:
 *   /ws                    → Durable Object (WebSocket + VAD inference)
 *   /*                     → R2 bucket (serves ORT WASM + ONNX model at root)
 *
 * ORT WASM used by the DO itself is precompiled at deploy time
 * (CompiledWasm rule + build.mjs patches).
 */

export { VadSession } from "./vad-session";

export interface Env {
  VAD_SESSION: DurableObjectNamespace<VadSession>;
  VAD_ASSETS: R2Bucket;
}

async function serveFromR2(env: Env, key: string): Promise<Response> {
  const object = await env.VAD_ASSETS.get(key);
  if (!object) {
    return new Response(`Not found in R2: ${key}`, { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  if (key.endsWith(".wasm")) headers.set("Content-Type", "application/wasm");
  else if (key.endsWith(".mjs")) headers.set("Content-Type", "application/javascript");
  else if (key.endsWith(".onnx")) headers.set("Content-Type", "application/octet-stream");
  return new Response(object.body, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade → Durable Object
    if (url.pathname === "/ws") {
      const room = url.searchParams.get("room") || "default";
      const id = env.VAD_SESSION.idFromName(room);
      const stub = env.VAD_SESSION.get(id);
      return stub.fetch(request);
    }

    // Serve all other GET requests from R2 (root-level WASM/ONNX)
    return serveFromR2(env, url.pathname.slice(1));
  },
};
