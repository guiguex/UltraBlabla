---
license: mit
pipeline_tag: voice-activity-detection
tags:
- onnx
- silero
- vad
- voice-activity-detection
- audio
library_name: onnx
---

# Silero VAD (ONNX)

Silero Voice Activity Detection (VAD) model in ONNX format. Detects when a person is speaking in an audio stream.

Original source: [snakers4/silero-vad](https://github.com/snakers4/silero-vad)

This is an exact copy of [onnx-community/silero-vad](https://huggingface.co/onnx-community/silero-vad).

## Model variants

| File | Quantization |
|------|-------------|
| `onnx/model.onnx` | FP32 (original) |
| `onnx/model_fp16.onnx` | FP16 |
| `onnx/model_int8.onnx` | INT8 |
| `onnx/model_uint8.onnx` | UINT8 |
| `onnx/model_quantized.onnx` | Quantized (generic) |
| `onnx/model_q4.onnx` | 4-bit |
| `onnx/model_q4f16.onnx` | 4-bit + FP16 |
| `onnx/model_bnb4.onnx` | bitsandbytes 4-bit |

## Usage

### With ONNX Runtime

```python
import numpy as np
import onnxruntime as ort

session = ort.InferenceSession("onnx/model_int8.onnx")
input_name = session.get_inputs()[0].name
sr_name = session.get_inputs()[1].name

audio = np.random.randn(1, 512).astype(np.float32)
sample_rate = np.array([16000], dtype=np.int64)

outputs = session.run(None, {input_name: audio, sr_name: sample_rate})
speech_prob = outputs[0]
```

### With silero-vad library

```python
import torch
torch.set_num_threads(1)

model, utils = torch.hub.load(
    repo_or_dir="snakers4/silero-vad",
    model="silero_vad",
)
get_speech_timestamps, _, read_audio, _, _ = utils

wav = read_audio("audio.wav")
speech_timestamps = get_speech_timestamps(wav, model, return_seconds=True)
```

### With faster-whisper (built-in VAD)

```python
from faster_whisper import WhisperModel

model = WhisperModel("small", device="cuda", compute_type="int8", vad_filter=True)
segments, _ = model.transcribe("audio.mp3")
```

## Key features

- **Fast:** ~1ms per 30ms audio chunk on a single CPU thread
- **Lightweight:** ~2 MB model size
- **Accurate:** trained on large corpora covering 6000+ languages
- **Flexible:** supports 8kHz and 16kHz sampling rates
- **Portable:** runs anywhere ON Runtime is available

## License

MIT License (same as [snakers4/silero-vad](https://github.com/snakers4/silero-vad))

## Repository

**Hugging Face:** [mijuanlo/silero-vad-onnx](https://huggingface.co/mijuanlo/silero-vad-onnx)
