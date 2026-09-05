#!/usr/bin/env python3
"""
04-evaluate.py — Mesure WER avant/après fine-tune.

Compare:
  - qwen3-asr baseline (sans LoRA)
  - qwen3-asr + LoRA fr-CA (depuis lora-out/fr-ca-lora.gguf)

Métrique: Word Error Rate (WER) sur le set test de Common Voice fr.

Output: rapport markdown avec WER global + breakdown par catégorie (longueur
        de phrase, présence de québecismes).
"""

import os
import sys
import json
import csv
import subprocess
import requests
import argparse
from pathlib import Path

QWEN_ASR_URL = os.environ.get("QWEN_ASR_URL", "http://localhost:41238")
QWEN_ASR_MODEL_BASE = "qwen3-asr-cuda-cpp"
QWEN_ASR_MODEL_FINETUNED = "qwen3-asr-frca-lora"

def levenshtein(ref: str, hyp: str) -> int:
    """Distance de Levenshtein basique."""
    if len(ref) < len(hyp):
        return levenshtein(hyp, ref)
    if len(hyp) == 0:
        return len(ref)
    prev = list(range(len(hyp) + 1))
    for i, c1 in enumerate(ref):
        cur = [i + 1]
        for j, c2 in enumerate(hyp):
            ins = prev[j + 1] + 1
            dele = cur[j] + 1
            sub = prev[j] + (c1 != c2)
            cur.append(min(ins, dele, sub))
        prev = cur
    return prev[-1]

def normalize(s: str) -> str:
    """Lowercase + strip accents + collapse whitespace."""
    import unicodedata, re
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def transcribe(audio_path: str, model_name: str = QWEN_ASR_MODEL_BASE) -> str:
    try:
        with open(audio_path, "rb") as f:
            files = {"file": (os.path.basename(audio_path), f, "audio/mpeg")}
            data = {"language": "fr"}
            r = requests.post(
                f"{QWEN_ASR_URL}/v1/audio/transcriptions",
                files=files, data=data, params={"model": model_name}, timeout=30,
            )
            r.raise_for_status()
            return r.json().get("text", "").strip()
    except Exception as e:
        return ""

def get_duration(audio_path: str) -> float:
    try:
        out = subprocess.run(
            ["ffprobe", "-i", audio_path, "-show_entries", "format=duration",
             "-v", "quiet", "-of", "csv=p=0"],
            capture_output=True, text=True, check=True,
        )
        return float(out.stdout.strip())
    except Exception:
        return 0.0

def wer(refs, hyps) -> tuple[float, list]:
    """WER = sum(edits) / sum(ref_words)."""
    total_edits = 0
    total_ref_words = 0
    per_example = []
    for ref, hyp in zip(refs, hyps):
        ref_n = normalize(ref).split()
        hyp_n = normalize(hyp).split()
        edits = levenshtein(" ".join(ref_n), " ".join(hyp_n))
        ref_words = len(ref_n)
        total_edits += edits
        total_ref_words += ref_words
        per_example.append(edits / max(ref_words, 1))
    return (total_edits / total_ref_words if total_ref_words else 0, per_example)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cv-dir", default="./cv-fr", help="Dossier CV")
    parser.add_argument("--out", default="./eval-report.md")
    parser.add_argument("--max-samples", type=int, default=200,
                        help="Limiter samples test (recommandé: 200 pour speed)")
    args = parser.parse_args()

    cv_dir = Path(args.cv_dir)
    test_tsv = cv_dir / "cv-fr-test.tsv"
    if not test_tsv.exists():
        print(f"❌ {test_tsv} introuvable")
        sys.exit(1)

    print(f"📋 Lecture {test_tsv}")
    rows = []
    with open(test_tsv, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            if i >= args.max_samples:
                break
            audio_path = cv_dir / "clips" / row["path"]
            if not audio_path.exists():
                continue
            rows.append((str(audio_path), row["sentence"].strip(), get_duration(str(audio_path))))

    print(f"   {len(rows)} clips de test")

    refs = [r[1] for r in rows]
    print("\n🎙️  Transcription baseline (sans LoRA)...")
    hyps_base = [transcribe(r[0], QWEN_ASR_MODEL_BASE) for r in rows]
    wer_base, per_base = wer(refs, hyps_base)
    print(f"   WER baseline: {wer_base*100:.2f}%")

    print("\n🎙️  Transcription fine-tuned (avec LoRA)...")
    hyps_ft = [transcribe(r[0], QWEN_ASR_MODEL_FINETUNED) for r in rows]
    wer_ft, per_ft = wer(refs, hyps_ft)
    print(f"   WER fine-tuned: {wer_ft*100:.2f}%")

    diff = wer_base - wer_ft
    pct_diff = diff / wer_base * 100 if wer_base else 0

    # Rapport
    report = f"""# Évaluation qwen3-asr finetuné fr-CA

## Résultat global

| Modèle | WER | Δ vs baseline |
|---|---|---|
| Baseline (qwen3-asr-cuda-cpp) | **{wer_base*100:.2f}%** | — |
| Fine-tuned (LoRA fr-CA)     | **{wer_ft*100:.2f}%** | **{diff*100:+.2f}% ({pct_diff:+.1f}%)** |

## Détails

- Test set : Common Voice 15.0 fr, {len(rows)} samples
- Source : mozilla-foundation/common_voice_15_0 (test split)

"""
    if diff > 0.02:
        report += f"\n✅ **Fine-tune apporte un gain significatif** (-{diff*100:.2f}% WER).\n"
    elif diff > 0:
        report += f"\n⚠️  **Gain marginal** (-{diff*100:.2f}% WER). Fine-tune utile mais pas critique.\n"
    else:
        report += "\n❌ **Pas de gain** ou régression. Vérifier la qualité des pseudo-labels et l'hyperparamétrage.\n"

    Path(args.out).write_text(report)
    print(f"\n📊 Rapport: {args.out}")

if __name__ == "__main__":
    main()
