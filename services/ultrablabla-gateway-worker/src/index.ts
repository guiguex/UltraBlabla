// audiollm-gateway Worker v4 -- TTS body sanitization (qwen-tts only has 1 voice baked-in)
// Source = worker distant `ultrablabla-gateway` (Cloudflare dashboard, 2026-09-04).
// Recree localement pour pouvoir modifier + redeploy via wrangler.

interface Env {
  AI: Ai;
  LLM_BACKEND_URL?: string;
  ASR_BACKEND_URL?: string;
  TTS_BACKEND_URL?: string;
  TTS_SIDECAR_URL?: string;
  CORS_ORIGIN?: string;
}

var ASR_BACKEND_URL = "https://asr.guig.dev";
var TTS_BACKEND_URL = "https://tts.guig.dev";
var RAW_CORS_ORIGIN = "*";

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  var lower = origin.toLowerCase().trim();
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(lower)) return true;
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(lower)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?guig\.dev$/.test(lower)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?pages\.dev$/.test(lower)) return true;
  return RAW_CORS_ORIGIN === "*";
}

function corsHeaders(origin: string | null): Headers {
  var h = new Headers();
  var allowed = origin && isOriginAllowed(origin) ? origin : (RAW_CORS_ORIGIN === "*" ? "*" : "");
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

function applyCors(headers: Headers, origin: string | null): Headers {
  corsHeaders(origin).forEach(function(v, k) { if (!headers.has(k)) headers.set(k, v); });
  return headers;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: status || 500,
    headers: { "Content-Type": "application/json", "x-gateway": "audiollm-cf-gateway" }
  });
}

async function proxyTo(request: Request, backend: string, rewritePath?: string): Promise<Response> {
  var url = new URL(request.url);
  var pathname = rewritePath || url.pathname;
  var targetUrl = backend.replace(/\/+$/, "") + pathname + url.search;
  var headers = new Headers();
  var allowed = ["accept", "accept-encoding", "accept-language", "authorization", "content-type", "content-length", "range", "user-agent", "x-api-key", "x-source", "x-requested-with"];
  var src = request.headers;
  for (var i = 0; i < allowed.length; i++) {
    var v = src.get(allowed[i]);
    if (v != null) headers.set(allowed[i], v);
  }
  headers.set("host", new URL(backend).host);
  headers.set("x-gateway", "audiollm-cf-gateway");
  headers.set("x-forwarded-host", src.get("host") || "");
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));
  var xff = src.get("cf-connecting-ip") || src.get("x-real-ip") || (src.get("x-forwarded-for") || "").split(",")[0].trim() || "127.0.0.1";
  headers.set("x-forwarded-for", src.get("x-forwarded-for") || xff);
  var body: BodyInit | null | undefined;
  if (request.method === "GET" || request.method === "HEAD") {
    body = undefined;
  } else {
    body = request.body;
  }
  var init: RequestInit = {
    method: request.method,
    headers: headers,
    body: body,
    redirect: "manual"
  };
  var startTime = Date.now();
  try {
    var response = await fetch(targetUrl, init);
    var rh = new Headers(response.headers);
    rh.set("x-gateway", "audiollm-cf-gateway");
    rh.set("x-gateway-latency-ms", String(Date.now() - startTime));
    applyCors(rh, request.headers.get("origin"));
    return new Response(response.body, { status: response.status, headers: rh });
  } catch (err: any) {
    return jsonError("Backend indisponible: " + (err && err.message || "unknown"), 502);
  }
}

function wrapPcmAsWav(pcmBytes: ArrayBuffer, sampleRate?: number, numChannels?: number, bitsPerSample?: number): ArrayBuffer {
  var sr = sampleRate || 24000;
  var ch = numChannels || 1;
  var bps = bitsPerSample || 32;
  var byteRate = sr * ch * (bps / 8);
  var blockAlign = ch * (bps / 8);
  var dataSize = pcmBytes.byteLength;
  var totalSize = 44 + dataSize;
  var buf = new ArrayBuffer(totalSize);
  var view = new DataView(buf);
  var writeStr = function(off: number, s: string) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bps, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  new Uint8Array(buf, 44).set(new Uint8Array(pcmBytes));
  return buf;
}

async function proxyTTS(request: Request): Promise<Response> {
  var url = new URL(request.url);
  var targetUrl = TTS_BACKEND_URL.replace(/\/+$/, "") + url.pathname + url.search;
  var headers = new Headers();
  var allowed = ["accept", "accept-encoding", "accept-language", "authorization", "content-type", "user-agent", "x-api-key", "x-source", "x-requested-with"];
  var src = request.headers;
  for (var i = 0; i < allowed.length; i++) {
    var v = src.get(allowed[i]);
    if (v != null) headers.set(allowed[i], v);
  }
  headers.set("host", new URL(TTS_BACKEND_URL).host);
  headers.set("x-gateway", "audiollm-cf-gateway");

  var rawBody = await request.text();
  var sanitized = rawBody;
  var wantsWav = true;
  try {
    var parsed = JSON.parse(rawBody);
    if (parsed && typeof parsed === "object") {
      var rf = parsed.response_format;
      wantsWav = rf == null || rf === "" || rf === "wav";
    }
    delete parsed.voice;
    delete parsed.model;
    delete parsed.response_format;
    delete parsed.speed;
    delete parsed.temperature;
    delete parsed.stream_format;
    parsed.response_format = "pcm";
    sanitized = JSON.stringify(parsed);
  } catch (e) {}
  headers.set("content-length", String(new TextEncoder().encode(sanitized).length));
  headers.set("content-type", "application/json");

  var init: RequestInit = {
    method: "POST",
    headers: headers,
    body: sanitized
  };
  var startTime = Date.now();
  try {
    var response = await fetch(targetUrl, init);
    var contentType = response.headers.get("content-type") || "";
    var rh = new Headers();
    rh.set("x-gateway", "audiollm-cf-gateway");
    rh.set("x-gateway-latency-ms", String(Date.now() - startTime));
    applyCors(rh, src.get("origin"));
    if (!response.ok) {
      rh.set("Content-Type", contentType || "application/json");
      return new Response(response.body, { status: response.status, headers: rh });
    }
    if (wantsWav) {
      var pcmBuf = await response.arrayBuffer();
      var wavBuf = wrapPcmAsWav(pcmBuf, 24000, 1, 32);
      rh.set("Content-Type", "audio/wav");
      rh.set("Content-Length", String(wavBuf.byteLength));
      return new Response(wavBuf, { status: 200, headers: rh });
    }
    rh.set("Content-Type", contentType || "audio/pcm");
    return new Response(response.body, { status: response.status, headers: rh });
  } catch (err: any) {
    return jsonError("TTS backend indisponible: " + (err && err.message || "unknown"), 502);
  }
}

function routeReasoningStream(parsed: any): any {
  if (!parsed || typeof parsed !== "object") return parsed;
  var choices = parsed.choices;
  if (!Array.isArray(choices)) return parsed;
  for (var i = 0; i < choices.length; i++) {
    var ch = choices[i];
    if (!ch || typeof ch !== "object") continue;
    var delta = ch.delta;
    if (delta && typeof delta === "object") {
      var dc = delta.content;
      var dr = delta.reasoning_content;
      var inReasoningPhase = !(dr === null || dr === undefined);
      if (inReasoningPhase) {
        if (typeof dr === "string" && dr.length > 0) delta._r = dr;
        delta.content = "";
        delta.reasoning_content = null;
      }
    }
  }
  return parsed;
}

function routeReasoningNonStream(parsed: any): any {
  if (!parsed || typeof parsed !== "object") return parsed;
  var choices = parsed.choices;
  if (!Array.isArray(choices)) return parsed;
  for (var i = 0; i < choices.length; i++) {
    var ch = choices[i];
    if (!ch || typeof ch !== "object") continue;
    var msg = ch.message;
    if (msg && typeof msg === "object") {
      var mr = msg.reasoning_content;
      var mc = msg.content;
      if (typeof mr === "string" && mr.length > 0) msg._reasoning = mr;
      msg.reasoning_content = null;
      if (!mc || mc === "") msg.content = "";
    }
  }
  return parsed;
}

function transformReasoningStream(src: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  var decoder = new TextDecoder();
  var encoder = new TextEncoder();
  var buffer = "";
  var inReasoningPhase = false;
  var transform = new TransformStream<Uint8Array, Uint8Array>({
    transform: function(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
      buffer += decoder.decode(chunk, { stream: true });
      var parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (var i = 0; i < parts.length; i++) {
        var block = parts[i];
        if (!block.trim()) continue;
        var lines = block.split("\n");
        var outLines: string[] = [];
        for (var j = 0; j < lines.length; j++) {
          var line = lines[j];
          if (line.indexOf("data:") !== 0) { outLines.push(line); continue; }
          var payload = line.slice(5).trim();
          if (payload === "" || payload === "[DONE]") { outLines.push(line); continue; }
          var parsed: any;
          try { parsed = JSON.parse(payload); } catch (e) { outLines.push(line); continue; }
          var prevPhase = inReasoningPhase;
          routeReasoningStream(parsed);
          var choices = parsed && parsed.choices;
          if (Array.isArray(choices) && choices.length > 0) {
            var delta = choices[0] && choices[0].delta;
            if (delta && typeof delta === "object") {
              var hasReasoning = typeof delta._r === "string" && delta._r.length > 0;
              var hasContent = typeof delta.content === "string" && delta.content.length > 0;
              if (hasReasoning) inReasoningPhase = true;
              else if (hasContent) inReasoningPhase = false;
            }
          }
          outLines.push("data: " + JSON.stringify(parsed));
        }
        if (prevPhase && !inReasoningPhase) {
          outLines.push("data: " + JSON.stringify({
            object: "chat.completion.chunk",
            choices: [{ index: 0, delta: { _phase: "done" }, finish_reason: null }]
          }));
        }
        controller.enqueue(encoder.encode(outLines.join("\n") + "\n\n"));
      }
    },
    flush: function(controller: TransformStreamDefaultController<Uint8Array>) {
      var rest = buffer;
      if (rest.trim()) {
        var lines = rest.split("\n");
        var outLines: string[] = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf("data:") !== 0) { outLines.push(line); continue; }
          var payload = line.slice(5).trim();
          if (payload === "" || payload === "[DONE]") { outLines.push(line); continue; }
          var parsed: any;
          try { parsed = JSON.parse(payload); } catch (e) { outLines.push(line); continue; }
          routeReasoningStream(parsed);
          outLines.push("data: " + JSON.stringify(parsed));
        }
        controller.enqueue(encoder.encode(outLines.join("\n") + "\n\n"));
      }
    },
  });
  return src.pipeThrough(transform);
}

async function callWorkersAI(body: any, env: Env, origin: string | null): Promise<Response> {
  if (!env || !env.AI) return jsonError("AI binding missing", 500);
  var startTime = Date.now();
  var wantsStream = body.stream === true;
  var defaultModel = body.model || "@cf/zai-org/glm-5.3-flash";
  try {
    if (wantsStream) {
      var stream = await env.AI.run(defaultModel, {
        messages: body.messages || [],
        max_tokens: body.max_tokens || 1024,
        temperature: body.temperature,
        top_p: body.top_p,
        stream: true,
      } as any) as unknown as ReadableStream<Uint8Array>;
      var transformed = transformReasoningStream(stream);
      var sh = new Headers({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "x-gateway": "audiollm-cf-gateway",
        "x-ai-backend": "cloudflare-workers-ai",
      });
      sh.set("x-gateway-latency-ms", String(Date.now() - startTime));
      applyCors(sh, origin);
      return new Response(transformed, { status: 200, headers: sh });
    }
    var result = await env.AI.run(defaultModel, {
      messages: body.messages || [],
      max_tokens: body.max_tokens || 1024,
      temperature: body.temperature,
      top_p: body.top_p,
      stream: false,
    } as any);
    routeReasoningNonStream(result);
    var rh = new Headers({
      "Content-Type": "application/json",
      "x-gateway": "audiollm-cf-gateway",
      "x-ai-backend": "cloudflare-workers-ai",
    });
    rh.set("x-gateway-latency-ms", String(Date.now() - startTime));
    applyCors(rh, origin);
    return new Response(JSON.stringify(result), { status: 200, headers: rh });
  } catch (err: any) {
    return jsonError("Workers AI error: " + (err && err.message || "unknown"), 502);
  }
}

var DEFAULT_VOICES = {
  voices: [
    { id: "remi", name: "remi", language: "french", description: "Voix homme naturelle (Le King)", type: "preset", sample_count: 0 },
    { id: "melissa", name: "melissa", language: "french", description: "Voix femme douce", type: "preset", sample_count: 0 },
    { id: "guillaume", name: "guillaume", language: "french", description: "Voix studio equilibrée", type: "preset", sample_count: 0 },
    { id: "emanuelle", name: "emanuelle", language: "french", description: "Voix femme claire", type: "preset", sample_count: 0 },
    { id: "claire", name: "claire", language: "french", description: "Voix française douce", type: "preset", sample_count: 0 },
    { id: "antoine", name: "antoine", language: "french", description: "Voix française profonde", type: "preset", sample_count: 0 }
  ]
};

var DEFAULT_MODELS = {
  object: "list",
  data: [
    { id: "@cf/qwen/qwen3-30b-a3b-fp8", object: "model", type: "llm", backend: "cloudflare-workers-ai" },
    { id: "@cf/moonshotai/kimi-k2.7-code", object: "model", type: "llm", backend: "cloudflare-workers-ai" },
    { id: "@cf/zai-org/glm-5.3-flash", object: "model", type: "llm", backend: "cloudflare-workers-ai" },
    { id: "@cf/openai/whisper-large-v3-turbo", object: "model", type: "asr", backend: "cloudflare-workers-ai" }
  ]
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    var origin = request.headers.get("origin");
    var url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health" || url.pathname === "/gateway/health") {
      var hb = JSON.stringify({
        status: "ok",
        service: "audiollm-cf-gateway",
        llm_backend: "Cloudflare Workers AI (env.AI.run)",
        asr_backend: ASR_BACKEND_URL,
        tts_backend: TTS_BACKEND_URL,
        ts: Date.now()
      });
      var hh = new Headers({ "Content-Type": "application/json" });
      applyCors(hh, origin);
      return new Response(hb, { status: 200, headers: hh });
    }

    if (url.pathname === "/v1/tts/warmup") {
      var wh = new Headers({ "Content-Type": "application/json", "x-gateway": "audiollm-cf-gateway" });
      applyCors(wh, origin);
      return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: wh });
    }

    if (url.pathname === "/v1/models") {
      var mh = new Headers({ "Content-Type": "application/json", "x-gateway": "audiollm-cf-gateway" });
      applyCors(mh, origin);
      return new Response(JSON.stringify(DEFAULT_MODELS), { status: 200, headers: mh });
    }

    if (url.pathname === "/v1/audio/voices" || url.pathname === "/v1/voices" || url.pathname === "/v1/audio/voice/list" || url.pathname === "/v1/audio/voices/list") {
      var vh = new Headers({ "Content-Type": "application/json", "x-gateway": "audiollm-cf-gateway" });
      applyCors(vh, origin);
      return new Response(JSON.stringify(DEFAULT_VOICES), { status: 200, headers: vh });
    }

    if (url.pathname === "/v1/chat/completions" || url.pathname === "/v1/chat/stream") {
      try {
        var body = await request.json();
        return await callWorkersAI(body, env, origin);
      } catch (e: any) {
        return jsonError("Invalid JSON body: " + (e && e.message || ""), 400);
      }
    }

    if (url.pathname.startsWith("/v1/audio/transcriptions") || url.pathname.startsWith("/v1/audio/transcribe") || url.pathname.startsWith("/v1/audio/record") || url.pathname.startsWith("/v1/audio/transcribe_with_alignment") || url.pathname.startsWith("/v1/audio/transcribe+alignment") || url.pathname.startsWith("/v1/asr/")) {
      return proxyTo(request, ASR_BACKEND_URL);
    }

    if (url.pathname === "/v1/audio/speech") {
      return proxyTTS(request);
    }
    if (url.pathname.startsWith("/v1/audio/speech/") || url.pathname.startsWith("/v1/audio/voices/") || url.pathname === "/v1/audio/voice/list" || url.pathname === "/v1/audio/voice/clone" || url.pathname === "/v1/audio/voice/design" || url.pathname === "/v1/audio/voice/create" || url.pathname === "/v1/audio/voice/custom" || url.pathname.startsWith("/v1/audio/voice/custom/") || url.pathname.startsWith("/v1/audio/voice/") || url.pathname.startsWith("/v1/tts/")) {
      return proxyTo(request, TTS_BACKEND_URL);
    }

    var eh = new Headers({ "Content-Type": "application/json", "x-gateway": "audiollm-cf-gateway" });
    applyCors(eh, origin);
    return new Response(JSON.stringify({ error: "not_found", path: url.pathname }), { status: 404, headers: eh });
  },
};