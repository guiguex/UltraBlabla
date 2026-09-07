/**
 * Silero VAD v5 client — server-side inference via WebSocket.
 * Same as v2 but WASM/model served from R2 (transparent to client).
 */
const SAMPLE_RATE = 16000;
const WS_PATH = "/ws?room=default";

let audioContext = null, micStream = null, workletNode = null, ws = null;
let isRunning = false, frameCount = 0;

const $ = (id) => document.getElementById(id);
const startBtn = $("startBtn"), stopBtn = $("stopBtn");
const probBar = $("probBar"), probValue = $("probValue");
const speechIndicator = $("speechIndicator");
const statusEl = $("status"), backendEl = $("backend");
const latencyEl = $("latency"), fpsEl = $("fps"), logEl = $("log");

function log(msg) {
  logEl.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + logEl.innerHTML;
}
function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = `status ${cls || ""}`;
}

function connectWs() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${proto}//${location.host}${WS_PATH}`);
  ws.binaryType = "arraybuffer";
  ws.onopen = () => { log("WebSocket connected"); ws.send(JSON.stringify({ type: "init" })); };
  ws.onmessage = (e) => {
    try {
      if (typeof e.data !== "string") return;
      const msg = JSON.parse(e.data);
      if (msg.type === "ready") { log(`DO ready — backend: ${msg.backend}`); backendEl.textContent = msg.backend.toUpperCase(); }
      else if (msg.type === "vad") {
        probBar.style.width = `${msg.probability * 100}%`;
        probValue.textContent = `${(msg.probability * 100).toFixed(1)}%`;
        speechIndicator.className = `indicator ${msg.speech ? "speech" : "silence"}`;
        speechIndicator.textContent = msg.speech ? "🗣 PAROLE" : "🔇 SILENCE";
        latencyEl.textContent = `${msg.inferenceMs.toFixed(2)}ms`;
        if (msg.backend) backendEl.textContent = msg.backend.toUpperCase();
      } else if (msg.type === "remote_vad") log(`Remote: speech=${msg.speech} prob=${(msg.probability * 100).toFixed(0)}%`);
      else if (msg.type === "error") log(`DO error: ${msg.message}`);
    } catch (err) { log(`Parse error: ${err.message}`); }
  };
  ws.onclose = () => log("WebSocket closed");
  ws.onerror = () => log("WebSocket error");
}

async function startVad() {
  if (isRunning) return;
  isRunning = true; startBtn.disabled = true; stopBtn.disabled = false;
  try {
    setStatus("Connecting to DO…", "loading");
    connectWs();
    setStatus("Requesting microphone…", "loading");
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
    log(`AudioContext: ${audioContext.sampleRate}Hz`);
    await audioContext.audioWorklet.addModule("/vad-processor.js");
    workletNode = new AudioWorkletNode(audioContext, "vad-processor");
    audioContext.createMediaStreamSource(micStream).connect(workletNode);
    let fpsCounter = 0, fpsTimer = performance.now();
    workletNode.port.onmessage = (event) => {
      if (event.data.type !== "frame" || !ws || ws.readyState !== WebSocket.OPEN) return;
      frameCount++; fpsCounter++;
      ws.send(event.data.data.buffer);
      const now = performance.now();
      if (now - fpsTimer >= 1000) { fpsEl.textContent = `${fpsCounter} fps`; fpsCounter = 0; fpsTimer = now; }
    };
    setStatus("Running", "running");
    log("VAD started — server-side inference (R2-backed)");
  } catch (e) { log(`ERROR: ${e.message}`); setStatus(`Error: ${e.message}`, "error"); await stopVad(); }
}

async function stopVad() {
  isRunning = false; startBtn.disabled = false; stopBtn.disabled = true;
  if (workletNode) { workletNode.disconnect(); workletNode = null; }
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  if (audioContext) { await audioContext.close(); audioContext = null; }
  if (ws) { ws.close(); ws = null; }
  frameCount = 0; probBar.style.width = "0%"; probValue.textContent = "0.0%";
  speechIndicator.className = "indicator silence"; speechIndicator.textContent = "—";
  latencyEl.textContent = "—"; fpsEl.textContent = "—";
  setStatus("Stopped", ""); log("VAD stopped");
}

startBtn.addEventListener("click", startVad);
stopBtn.addEventListener("click", stopVad);
