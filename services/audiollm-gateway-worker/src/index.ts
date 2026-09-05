// audiollm-gateway-worker — Cloudflare Worker port of audiollm/gateway/index.ts (Bun/Elysia).
// Same proxy + CORS logic, runs on Cloudflare edge, no local infra.
//
// Bindings/env (set in wrangler.toml):
//   LLM_BACKEND_URL  default "https://api.guig.dev"  (or your local via Tunnel)
//   ASR_BACKEND_URL  default ""                       (402 if unset)
//   TTS_BACKEND_URL  default ""                       (402 if unset)
//   TTS_SIDECAR_URL  default ""                       (402 if unset)
//   CORS_ORIGIN      default "*"                     (comma-separated whitelist, or "*")

interface Env {
  LLM_BACKEND_URL?: string;
  ASR_BACKEND_URL?: string;
  TTS_BACKEND_URL?: string;
  TTS_SIDECAR_URL?: string;
  CORS_ORIGIN?: string;
}

const LLM_BACKEND_URL = (env_or("LLM_BACKEND_URL", "https://api.guig.dev")).replace(/\/+$/, "");
const ASR_BACKEND_URL = (env_or("ASR_BACKEND_URL", "")).replace(/\/+$/, "");
const TTS_BACKEND_URL = (env_or("TTS_BACKEND_URL", "")).replace(/\/+$/, "");
const TTS_SIDECAR_URL = (env_or("TTS_SIDECAR_URL", "")).replace(/\/+$/, "");
const RAW_CORS_ORIGIN = (env_or("CORS_ORIGIN", "*")).trim();

function env_or(k: string, d: string): string {
  // Workers env comes via the env arg passed to fetch, not globals
  return d; // default — overridden per-fetch from env
}

const explicitOrigins = RAW_CORS_ORIGIN !== "*"
  ? RAW_CORS_ORIGIN.split(",").map(o => o.trim().toLowerCase()).filter(Boolean)
  : [];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const lower = origin.toLowerCase().trim();
  if (explicitOrigins.includes(lower)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(lower)) return true;
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(lower)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?guig\.dev$/.test(lower)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?pages\.dev$/.test(lower)) return true;
  return RAW_CORS_ORIGIN === "*";
}

function corsHeaders(origin: string | null): Headers {
  const h = new Headers();
  const allowed = origin && isOriginAllowed(origin) ? origin : (RAW_CORS_ORIGIN === "*" ? "*" : "");
  if (allowed) {
    h.set("Access-Control-Allow-Origin", allowed);
    h.set("Access-Control-Allow-Credentials", "true");
    h.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Key, X-Source, X-Turnstile-Token");
    h.set("Access-Control-Expose-Headers", "Content-Length, Content-Type, X-Gateway, X-Gateway-Latency-Ms");
    h.set("Access-Control-Max-Age", "86400");
  }
  return h;
}

async function proxyRequest(request: Request, backend: string, rewritePath?: string): Promise<Response> {
  if (!backend) {
    return new Response(JSON.stringify({ error: "Backend non configuré (URL vide)" }), {
      status: 502,
      headers: { "Content-Type": "application/json", "x-gateway": "cf-worker" },
    });
  }
  const incomingHeaders = request.headers;
  const headers = new Headers(incomingHeaders);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("keep-alive");
  headers.delete("transfer-encoding");
  const clientIp =
    incomingHeaders.get("cf-connecting-ip") ||
    incomingHeaders.get("x-real-ip") ||
    incomingHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const existingForwardedFor = incomingHeaders.get("x-forwarded-for");
  headers.set("x-forwarded-for", existingForwardedFor ? `${existingForwardedFor}, ${clientIp}` : clientIp);
  headers.set("x-real-ip", clientIp);
  headers.set("x-forwarded-host", incomingHeaders.get("host") || "");
  headers.set("x-forwarded-proto", new URL(request.url).protocol.replace(":", ""));
  headers.set("x-gateway", "cf-worker");
  if (backend === LLM_BACKEND_URL) headers.set("x-source", "audiollmx-cf-gateway");

  const url = new URL(request.url);
  const backendUrl = new URL(backend);
  const pathname = rewritePath || url.pathname;
  const targetUrl = `${backendUrl.origin}${pathname}${url.search}`;

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  };

  const startTime = Date.now();
  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("x-gateway", "cf-worker");
    responseHeaders.set("x-gateway-latency-ms", String(Date.now() - startTime));
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Backend indisponible", target: targetUrl, message: (error as any)?.message ?? "Erreur de connexion" }),
      { status: 502, headers: { "Content-Type": "application/json", "x-gateway": "cf-worker" } }
    );
  }
}

function proxyVoiceManagement(request: Request, rewritePath?: string): Promise<Response> {
  const target = request.method === "DELETE" ? TTS_SIDECAR_URL : TTS_BACKEND_URL;
  return proxyRequest(request, target, rewritePath);
}

// ─── Routing table (Elysia .all() → fetch path matching) ────
interface Route { match: (p: string) => boolean; rewrite?: string; pick: "asr" | "tts" | "voice" | "tts-sidecar" | "llm"; }

const ROUTES: Route[] = [
  // ASR
  { match: p => p === "/v1/audio/transcriptions" || p === "/v1/audio/transcribe" || p === "/v1/audio/record" || p.startsWith("/v1/audio/transcriptions/") || p.startsWith("/v1/audio/transcribe/") || p.startsWith("/v1/audio/record/"), pick: "asr" },
  { match: p => p === "/v1/audio/transcribe_with_alignment" || p === "/v1/audio/transcribe+alignment", pick: "tts-sidecar" },
  // TTS / Voice
  { match: p => p === "/v1/audio/speech" || p.startsWith("/v1/audio/speech/"), pick: "tts" },
  { match: p => p === "/v1/audio/voices" || p.startsWith("/v1/audio/voices/"), pick: "voice" },
  { match: p => p === "/v1/audio/voice/list" || p === "/v1/voices", rewrite: "/v1/audio/voices", pick: "voice" },
  { match: p => p === "/v1/audio/voice/clone" || p === "/v1/audio/voice/design" || p === "/v1/audio/voice/create" || p === "/v1/audio/voice/custom" || p.startsWith("/v1/audio/voice/custom/"), pick: "tts-sidecar" },
  { match: p => p.startsWith("/v1/audio/voice/"), pick: "voice" },
  { match: p => p === "/v1/tts/warmup", pick: "tts-sidecar" }, // warmup short-circuits to 200
  { match: p => p.startsWith("/v1/tts/"), pick: "tts" },
  // LLM
  { match: p => p === "/v1/chat/completions" || p === "/v1/models" || p.startsWith("/api/"), pick: "llm" },
];

const llmFallbackCF = "https://api.guig.dev";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ─── Local routes ───
    if (url.pathname === "/health" || url.pathname === "/gateway/health") {
      const body = JSON.stringify({
        status: "ok",
        service: "audiollm-cf-gateway",
        llm_backend: env.LLM_BACKEND_URL || LLM_BACKEND_URL,
        asr_backend: env.ASR_BACKEND_URL || ASR_BACKEND_URL || "unconfigured",
        tts_backend: env.TTS_BACKEND_URL || TTS_BACKEND_URL || "unconfigured",
        tts_sidecar: env.TTS_SIDECAR_URL || TTS_SIDECAR_URL || "unconfigured",
        ts: Date.now(),
      });
      return new Response(body, { status: 200, headers: { "Content-Type": "application/json", ...Object.fromEntries(corsHeaders(origin)) } });
    }
    if (url.pathname === "/v1/tts/warmup") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "x-gateway": "cf-worker", ...Object.fromEntries(corsHeaders(origin)) },
      });
    }

    // ─── Find route ───
    const LLM = env.LLM_BACKEND_URL || LLM_BACKEND_URL;
    const ASR = env.ASR_BACKEND_URL || ASR_BACKEND_URL;
    const TTS = env.TTS_BACKEND_URL || TTS_BACKEND_URL;
    const SIDE = env.TTS_SIDECAR_URL || TTS_SIDECAR_URL;
    const route = ROUTES.find(r => r.match(url.pathname));
    let backend: string;
    if (route?.pick === "asr") backend = ASR;
    else if (route?.pick === "tts") backend = TTS;
    else if (route?.pick === "voice") return proxyVoiceManagement(request, route.rewrite);
    else if (route?.pick === "tts-sidecar") backend = SIDE;
    else backend = ""; // catch-all = LLM

    let resp: Response;
    // /v1/chat/completions has CF-fallback logic (mirroring original)
    if (url.pathname === "/v1/chat/completions" && backend && backend !== llmFallbackCF) {
      try {
        const localRes = await fetch(`${backend}${url.pathname}${url.search}`, {
          method: request.method,
          headers: request.headers,
          body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
          signal: AbortSignal.timeout(6000),
        });
        if (localRes.ok) {
          const h = new Headers(localRes.headers);
          h.set("x-gateway", "cf-worker-llm");
          resp = new Response(localRes.body, { status: localRes.status, headers: h });
        } else {
          resp = await proxyRequest(request, llmFallbackCF);
        }
      } catch {
        resp = await proxyRequest(request, llmFallbackCF);
      }
    } else if (backend) {
      resp = await proxyRequest(request, backend, route?.rewrite);
    } else {
      // catch-all → LLM
      resp = await proxyRequest(request, LLM);
    }

    // Attach CORS headers to proxied response
    const out = new Headers(resp.headers);
    for (const [k, v] of corsHeaders(origin)) if (!out.has(k)) out.set(k, v);
    return new Response(resp.body, { status: resp.status, headers: out });
  },
} satisfies ExportedHandler<Env>;