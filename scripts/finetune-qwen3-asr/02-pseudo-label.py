#!/usr/bin/env python3
"""
02-pseudo-label.py — Génère pseudo-labels via qwen3-asr.cpp local.

Input:  ./cv-fr/clips/*.mp3 + cv-fr-train.tsv
Output: ./cv-fr-pseudo/train.jsonl avec {"audio": path, "text": transcript, "confidence": float}

Filtre: confidence > 0.7, durée audio 1-15s.
"""

import os
import sys
import json
import csv
import time
import requests
import argparse
from pathlib import Path

QWEN_ASR_URL = os.environ.get("QWEN_ASR_URL", "http://localhost:41238")
QWEN_ASR_MODEL = os.environ.get("QWEN_ASR_MODEL", "qwen3-asr-cuda-cpp")
MIN_CONFIDENCE = 0.7
MIN_DURATION_S = 1.0
MAX_DURATION_S = 15.0

def transcribe(audio_path: str) -> tuple[str, float]:
    """Appelle qwen3-asr.cpp, retourne (text, confidence_score)."""
    try:
        with open(audio_path, "rb") as f:
            files = {"file": (os.path.basename(audio_path), f, "audio/mpeg")}
            data = {"language": "fr", "response_format": "verbose_json"}
            r = requests.post(
                f"{QWEN_ASR_URL}/v1/audio/transcriptions",
                files=files, data=data, timeout=30,
            )
            r.raise_for_status()
            j = r.json()
            text = j.get("text", "").strip()
            # qwen-asr ne retourne pas toujours un confidence — on infère via logprob
            # ou no_speech_prob. À défaut, 1.0 si non-vide.
            confidence = 1.0 - float(j.get("no_speech_prob", 0.0))
            return text, confidence
    except Exception as e:
        print(f"   ❌ {audio_path}: {e}")
        return "", 0.0

def get_duration(audio_path: str) -> float:
    """ffprobe pour durée audio."""
    try:
        import subprocess
        out = subprocess.run(
            ["ffprobe", "-i", audio_path, "-show_entries", "format=duration",
             "-v", "quiet", "-of", "csv=p=0"],
            capture_output=True, text=True, check=True,
        )
        return float(out.stdout.strip())
    except Exception:
        return 0.0

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cv-dir", default="./cv-fr", help="Dossier Common Voice")
    parser.add_argument("--out", default="./cv-fr-pseudo/train.jsonl")
    parser.add_argument("--max-samples", type=int, default=None)
    args = parser.parse_args()

    cv_dir = Path(args.cv_dir)
    tsv_path = cv_dir / "cv-fr-train.tsv"
    if not tsv_path.exists():
        print(f"❌ {tsv_path} introuvable. Lancer 01-download-cv.py d'abord.")
        sys.exit(1)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"📋 Lecture {tsv_path}")
    rows = []
    with open(tsv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            if args.max_samples and i >= args.max_samples:
                break
            audio_path = cv_dir / "clips" / row["path"]
            if not audio_path.exists():
                continue
            duration = get_duration(str(audio_path))
            if duration < MIN_DURATION_S or duration > MAX_DURATION_S:
                continue
            rows.append((str(audio_path), row["sentence"].strip(), duration))

    print(f"   {len(rows)} clips après filtre durée ({MIN_DURATION_S}-{MAX_DURATION_S}s)")

    written = 0
    skipped_low_conf = 0
    start = time.time()

    with open(out_path, "w", encoding="utf-8") as f:
        for i, (audio_path, original_text, duration) in enumerate(rows):
            transcript, conf = transcribe(audio_path)
            if not transcript or conf < MIN_CONFIDENCE:
                skipped_low_conf += 1
                continue
            out = {
                "audio": audio_path,
                "text": transcript,
                "confidence": conf,
                "duration_s": duration,
                "original_text": original_text,
            }
            f.write(json.dumps(out, ensure_ascii=False) + "\n")
            written += 1
            if (i + 1) % 50 == 0:
                elapsed = time.time() - start
                rate = (i + 1) / elapsed
                eta = (len(rows) - i - 1) / rate
                print(f"   {i+1}/{len(rows)} | {rate:.1f} clips/s | ETA {eta/60:.0f}min | kept {written} skip {skipped_low_conf}")

    print(f"\n✅ Pseudo-labels générés: {out_path}")
    print(f"   Gardés: {written} | Skipped (low conf): {skipped_low_conf}")
    print(f"   Taux: {written / len(rows) * 100:.1f}%")

if __name__ == "__main__":
    main()
