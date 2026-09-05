#!/usr/bin/env python3
"""
03-train-lora.py — LoRA fine-tune qwen3-asr.cpp.

Input:  ./cv-fr-pseudo/train.jsonl (from 02-pseudo-label.py)
Output: ./lora-out/fr-ca-lora.gguf

Prérequis:
  pip install -U llama-cpp-python peft datasets accelerate

Note: llama.cpp finetune/ utilise actuellement la voie "convert to HF → LoRA
      → merge → export GGUF". C'est plus simple d'utiliser Hugging Face
      transformers + peft, puis exporter en GGUF via llama.cpp convert script.
"""

import os
import sys
import json
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="./cv-fr-pseudo/train.jsonl")
    parser.add_argument("--base-model",
                        default="Qwen/Qwen3-ASR-1.7B",
                        help="HF model id (peut nécessiter accès)")
    parser.add_argument("--out", default="./lora-out")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    print("⚠️  Cette étape est lourde. Prérequis :")
    print("   1. Avoir un compte Hugging Face avec accès à Qwen3-ASR-1.7B")
    print("   2. pip install transformers peft datasets accelerate bitsandbytes")
    print("   3. GPU avec ≥ 16 GB VRAM (RTX 3090/4090 ou A5000)")
    print("   4. ~6-12h de training selon dataset size")
    print()

    # --- Script de LoRA fine-tune ---
    # Inspiré de: https://github.com/ggml-org/llama.cpp/blob/master/examples/train
    # Mais on utilise transformers + peft (plus stable pour ASR)
    fine_tune_script = '''
import json
import torch
from datasets import Dataset
from transformers import (
    AutoProcessor, AutoModelForSpeechSeq2Seq,
    TrainingArguments, Trainer,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import BitsAndBytesConfig

# --- Config ---
BASE_MODEL = "%s"
DATA_PATH = "%s"
OUTPUT_DIR = "%s"
EPOCHS = %d
BATCH_SIZE = %d
LR = %f

# --- Load processor & model (4-bit quantized pour économiser VRAM) ---
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)
processor = AutoProcessor.from_pretrained(BASE_MODEL, trust_remote_code=True)
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    BASE_MODEL, quantization_config=bnb_config, trust_remote_code=True,
)
model = prepare_model_for_kbit_training(model)

# --- LoRA config (cible q,k,v,o + MLP) ---
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="SEQ_2_SEQ_LM",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# --- Dataset ---
def load_jsonl(path):
    rows = []
    with open(path) as f:
        for line in f:
            rows.append(json.loads(line))
    return rows

data = load_jsonl(DATA_PATH)
print(f"Loaded {len(data)} training examples")

def preprocess(example):
    # example = {"audio": path, "text": transcript}
    import torchaudio
    waveform, sr = torchaudio.load(example["audio"])
    if sr != 16000:
        waveform = torchaudio.transforms.Resample(sr, 16000)(waveform)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)  # mono
    inputs = processor(
        waveform.squeeze().numpy(),
        sampling_rate=16000,
        return_tensors="pt",
    )
    labels = processor.tokenizer(example["text"], return_tensors="pt").input_ids
    return {
        "input_features": inputs.input_features[0],
        "labels": labels[0],
    }

dataset = Dataset.from_list(data)
dataset = dataset.map(preprocess, remove_columns=dataset.column_names)

# --- Training ---
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=4,
    learning_rate=LR,
    warmup_ratio=0.1,
    bf16=True,
    save_steps=500,
    save_total_limit=2,
    logging_steps=20,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)
trainer.train()
model.save_pretrained(OUTPUT_DIR + "/lora-adapter")
print(f"✅ LoRA adapter saved: {OUTPUT_DIR}/lora-adapter")
print()
print("Pour merger en GGUF (utilisable par llama.cpp):")
print("  python -m transformers.models.qwen2.convert_to_gguf \\")
print(f"    {OUTPUT_DIR}/lora-adapter \\")
print(f"    --outfile {OUTPUT_DIR}/fr-ca-lora.gguf")
''' % (args.base_model, args.data, args.out, args.epochs, args.batch_size, args.lr)

    out_path = Path(args.out)
    out_path.mkdir(parents=True, exist_ok=True)
    train_script = out_path / "train_lora.py"
    train_script.write_text(fine_tune_script)

    print(f"📝 Script de LoRA généré: {train_script}")
    print(f"   Pour lancer: python {train_script}")
    print()
    print("⚠️  Ce script nécessite:")
    print("   - transformers >= 4.45 (pour Qwen3-ASR support)")
    print("   - peft >= 0.10")
    print("   - bitsandbytes (pour quantization 4-bit)")
    print("   - GPU ≥ 16 GB VRAM")

if __name__ == "__main__":
    main()
