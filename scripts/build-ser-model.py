"""
build-ser-model.py — one-shot rebuild of models/ser-wav2vec2-fr/model_fp16.onnx.

NOT needed at runtime (UltraBlabla runs pure Bun+JS via onnxruntime-node).
Run only when:
  - you change the upstream model version on HF
  - you re-train the classifier head with more data
  - you want to convert to INT8 (Layer 3 of docs/MEGA-PLAN-SER-2030.md)

Install the toolchain once:
    python -m pip install "optimum[onnxruntime]" onnx onnxruntime torch transformers soundfile numpy

Usage:
    python scripts/build-ser-model.py
Output:
    models/ser-wav2vec2-fr/model_fp16.onnx   ~602 MB  (fp16)
"""
import shutil
from pathlib import Path

MODEL_ID = "Lajavaness/wav2vec2-lg-xlsr-fr-speech-emotion-recognition"
OUT_DIR  = Path(__file__).resolve().parent.parent / "models" / "ser-wav2vec2-fr"
TMP_DIR  = OUT_DIR / "_tmp_fp32"

print(f"[1/4] Loading {MODEL_ID} ...")
from optimum.onnxruntime import ORTModelForAudioClassification
from transformers import AutoFeatureExtractor

model = ORTModelForAudioClassification.from_pretrained(MODEL_ID, export=True)
feat  = AutoFeatureExtractor.from_pretrained(MODEL_ID)
print(f"     arch   = {model.config.architectures}")
print(f"     labels = {model.config.id2label}")

TMP_DIR.mkdir(parents=True, exist_ok=True)
print("[2/4] Exporting ONNX fp32 (then we'll cast to fp16) ...")
model.save_pretrained(TMP_DIR, dtype="fp32")
feat.save_pretrained(TMP_DIR)

src = TMP_DIR / "model.onnx"
if not src.exists():
    for cand in TMP_DIR.glob("*.onnx"):
        src = cand; break
assert src.exists(), f"no .onnx produced in {TMP_DIR}"

print("[3/4] Casting fp32 → fp16 ...")
import onnx, onnxruntime, numpy as np
from onnxruntime.transformers.float16 import convert_float_to_float16

m = onnx.load(str(src))
fp16_model = convert_float_to_float16(m, keep_io_types=True, min_positive_val=1e-7, max_finite_val=1e4)
OUT_DIR.mkdir(parents=True, exist_ok=True)
dst = OUT_DIR / "model_fp16.onnx"
onnx.save(fp16_model, str(dst))
print(f"     wrote {dst} ({dst.stat().st_size / 1024**2:.1f} MB)")

print("[4/4] Smoke test ...")
from transformers import AutoFeatureExtractor as AFE
import soundfile as sf
afe = AFE.from_pretrained(MODEL_ID)
sr = 16000
audio = (0.3 * np.sin(2 * np.pi * 440 * np.arange(sr * 2) / sr)).astype(np.float32)
inp = afe(audio, sampling_rate=sr, return_tensors="np")
sess = onnxruntime.InferenceSession(str(dst), providers=["CPUExecutionProvider"])
logits = sess.run(None, {"input_values": inp["input_values"].astype(np.float32)})[0]
probs = np.exp(logits - logits.max(axis=-1, keepdims=True))
probs /= probs.sum(axis=-1, keepdims=True)
top = probs[0].argsort()[::-1][:3]
labels = model.config.id2label
print("     top-3 on synthetic 2s tone:")
for i in top:
    print(f"       {labels[int(i)]:<10}  {probs[0, i] * 100:5.1f}%")

for f in TMP_DIR.iterdir():
    if f.is_file(): f.unlink()
TMP_DIR.rmdir()
for name in ("config.json", "preprocessor_config.json"):
    src_cfg = TMP_DIR / name
    if src_cfg.exists():
        shutil.copy(src_cfg, OUT_DIR / name)

print("\nOK — runtime can now load models/ser-wav2vec2-fr/model_fp16.onnx")
print("    bun run scripts/bench-ser.ts    # verify perf")