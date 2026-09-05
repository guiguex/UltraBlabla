#!/usr/bin/env python3
"""
01-download-cv.py — Télécharge Common Voice 15.0 (fr) + prépare les paths.

Output:
  ./cv-fr/cv-fr-train.tsv   (paroles + paths audio)
  ./cv-fr/cv-fr-test.tsv
  ./cv-fr/cv-fr-dev.tsv
  ./cv-fr/clips/*.mp3      (audio files)

Données cibles: ~300h total, ~150h après filtre qualité.
"""

import os
import sys
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", default="./cv-fr", help="Output directory")
    parser.add_argument("--samples", type=int, default=None,
                        help="Limiter le nombre de samples (debug uniquement)")
    args = parser.parse_args()

    out_dir = args.out_dir
    os.makedirs(out_dir, exist_ok=True)

    print(f"📥 Téléchargement Common Voice 15.0 fr dans {out_dir}")
    print("⚠️  ATTENTION: ~30 GB à télécharger. Connexion stable requise.")

    # HF CLI est plus rapide que datasets.load_dataset pour gros volumes
    cmd = [
        "huggingface-cli", "download",
        "mozilla-foundation/common_voice_15_0",
        "--repo-type", "dataset",
        "--include", "fr/*.tar.gz",
        "--include", "fr/*.tsv",
        "--local-dir", out_dir,
    ]
    print(f"   {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError:
        print("❌ huggingface-cli introuvable. Installer avec: pip install -U huggingface_hub")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"❌ Téléchargement échoué: {e}")
        sys.exit(1)

    # Extraction
    print("📦 Extraction des tar.gz...")
    for tar in ["fr/train.tar.gz", "fr/test.tar.gz", "fr/dev.tar.gz"]:
        tar_path = os.path.join(out_dir, tar)
        if os.path.exists(tar_path):
            subprocess.run(["tar", "-xzf", tar_path, "-C", out_dir], check=True)
            print(f"   ✅ {tar} extrait")

    # Résultat attendu
    for split in ["train", "test", "dev"]:
        tsv = os.path.join(out_dir, f"cv-fr-{split}.tsv")
        if os.path.exists(tsv):
            with open(tsv) as f:
                n_lines = sum(1 for _ in f) - 1  # header
            print(f"   📊 {split}: {n_lines} clips")

    # Optionnel: limiter pour debug
    if args.samples:
        for split in ["train", "test", "dev"]:
            tsv = os.path.join(out_dir, f"cv-fr-{split}.tsv")
            if os.path.exists(tsv):
                subprocess.run([
                    "python3", "-c",
                    f"import csv; "
                    f"rows = list(csv.reader(open('{tsv}'), delimiter='\\t'))[1:{args.samples+1}]; "
                    f"print('client_id\\tpath\\tsentence\\tup_votes\\tdown_votes\\tage\\tgender\\taccent\\tlocale\\tsegment', '\\n'.join(['\\t'.join(r) for r in rows]), sep='\\n')"
                ], check=True)
        print(f"✅ Limité à {args.samples} samples pour debug")

if __name__ == "__main__":
    main()
