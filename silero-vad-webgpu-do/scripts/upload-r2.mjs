/**
 * Upload ORT WASM files + ONNX model to R2 bucket "vad-assets".
 *
 * Usage:
 *   node scripts/upload-r2.mjs
 *
 * Prerequisites:
 *   1. Create the R2 bucket: wrangler r2 bucket create vad-assets
 *   2. Set up R2 credentials (wrangler uses your Cloudflare account)
 */

import { statSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const BUCKET = "vad-assets";
const ORT_DIST = "public/onnxruntime-web";
const MODEL_FILE = "public/silero_vad_v5.onnx";

const WASM_GLOBS = [
  "ort-wasm-simd-threaded.asyncify.wasm",
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-threaded.wasm",
  "ort-wasm-simd.wasm",
  "ort-wasm.wasm",
  "ort-wasm.jsep.wasm",
  "ort-wasm-simd-threaded.jsep.asyncify.wasm",
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.jsep.mjs",
  "ort-wasm-threaded.mjs",
  "ort-wasm-simd.mjs",
  "ort-wasm.mjs",
  "ort-wasm.jsep.mjs",
];

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  R2 Upload — ORT WASM + VAD Model");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📦 ORT runtime files:");
for (const filename of WASM_GLOBS) {
  const filePath = join(ORT_DIST, filename);
  if (existsSync(filePath)) {
    const ct = filename.endsWith(".mjs") ? "application/javascript" : "application/wasm";
    console.log(`  Uploading ${filePath} → R2:${BUCKET}/${filename} ...`);
    try {
      execSync(
        `npx wrangler r2 object put ${BUCKET}/${filename} --file="${filePath}" --content-type="${ct}"`,
        { stdio: "pipe" },
      );
      const size = statSync(filePath).size;
      console.log(`  ${filename} (${(size / 1024 / 1024).toFixed(2)} MiB)`);
    } catch {
      console.log(` Skipped ${filename}`);
    }
  }
}

console.log("\n📦 VAD model:");
if (existsSync(MODEL_FILE)) {
  console.log(`  Uploading ${MODEL_FILE} → R2:${BUCKET}/silero_vad_v5.onnx ...`);
  try {
    execSync(
      `npx wrangler r2 object put ${BUCKET}/silero_vad_v5.onnx --file="${MODEL_FILE}" --content-type="application/octet-stream"`,
      { stdio: "pipe" },
    );
    const size = statSync(MODEL_FILE).size;
    console.log(`   silero_vad_v5.onnx (${(size / 1024 / 1024).toFixed(2)} MiB)`);
  } catch (e) {
    console.log(`  Failed to upload model: ${e.message}`);
  }
} else {
  console.log("  public/silero_vad_v5.onnx not found — skipping");
  console.log("  Download from https://github.com/snakers4/silero-vad");
}

console.log("\n R2 upload complete!");
console.log(`   Bucket: ${BUCKET}`);
console.log(`   Served via: Worker /wasm/* route → R2`);
console.log(`   ORT wasmPaths: <worker-origin>/wasm/`
);