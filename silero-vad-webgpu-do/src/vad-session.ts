import { DurableObject } from "cloudflare:workers";
import { createInferenceSession } from "./onnx-inference";

export interface Env {
  VAD_ASSETS: R2Bucket;
}
/**
 * VadSession — Durable Object with WebSocket Hibernation + WASM ONNX inference.
 *
 * The DO fetches the model from R2 via its own /wasm/* route. WASM is
 * precompiled at deploy time (CompiledWasm rule + build.mjs patches).
 *
 * The Worker origin is captured at WS upgrade time from the incoming Request
 * (via `?origin=` query param set by the client) so dev + prod + custom
 * hostnames all work without code changes.
 */
export class VadSession extends DurableObject {
  private inferenceSession: Awaited<ReturnType<typeof createInferenceSession>> | null = null;
  private workerOrigin: string | null = null;
  private states: Map<WebSocket, Float32Array> = new Map();
  private frameCounts: Map<WebSocket, number> = new Map();

  async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    // Capture origin from the WS upgrade URL so we can build absolute
    // WASM/ONNX URLs later. Falls back to request.host / Host header.
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("origin");
    if (fromQuery) {
      this.workerOrigin = fromQuery.replace(/\/+$/, "");
    } else {
      this.workerOrigin = `${url.protocol}//${url.host}`;
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async getInferenceSession() {
    if (this.inferenceSession) return this.inferenceSession;

    // Single source of truth: fetch the Silero VAD model from the frontend.
    void this.workerOrigin;
    this.inferenceSession = await createInferenceSession();
    return this.inferenceSession;
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    try {
      let audioData: Float32Array;

      if (typeof message === "string") {
        const msg = JSON.parse(message);
        if (msg.type === "init") {
          this.states.set(ws, new Float32Array(2 * 1 * 128));
          this.frameCounts.set(ws, 0);
          ws.send(JSON.stringify({
            type: "ready",
            backend: this.inferenceSession?.backend || "initializing",
          }));
          return;
        }
        if (msg.type === "audio" && msg.data) {
          audioData = new Float32Array(msg.data);
        } else {
          return;
        }
      } else {
        audioData = new Float32Array(message);
      }

      const session = await this.getInferenceSession();

      let state = this.states.get(ws);
      if (!state) {
        state = new Float32Array(2 * 1 * 128);
        this.states.set(ws, state);
      }

      const count = (this.frameCounts.get(ws) || 0) + 1;
      this.frameCounts.set(ws, count);

      const result = await session.run(audioData, state);
      this.states.set(ws, result.state);

      ws.send(JSON.stringify({
        type: "vad",
        speech: result.probability > 0.5,
        probability: result.probability,
        inferenceMs: result.inferenceMs,
        frameCount: count,
        backend: session.backend,
      }));

      const broadcast = JSON.stringify({
        type: "remote_vad",
        speech: result.probability > 0.5,
        probability: result.probability,
        frameCount: count,
      });
      for (const client of this.ctx.getWebSockets()) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(broadcast);
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({
        type: "error",
        message: err instanceof Error ? err.message : "Inference error",
      }));
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    this.states.delete(ws);
    this.frameCounts.delete(ws);
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    this.states.delete(ws);
    this.frameCounts.delete(ws);
    console.error("WebSocket error:", error);
  }
}