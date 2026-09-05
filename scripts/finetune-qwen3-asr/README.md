# Fine-tune qwen3-asr pour fr-CA

Pipeline complet pour fine-tuner qwen3-asr.cpp sur du français québécois.

## Prérequis

```bash
# Outils de base
pip install -U huggingface_hub requests torch torchaudio

# Pour le fine-tune (étape 03)
pip install -U transformers peft datasets accelerate bitsandbytes

# FFmpeg pour la durée audio
apt install -y ffmpeg    # ou choco install ffmpeg sous Windows
```

GPU recommandé : RTX 3090/4090 (24 GB VRAM) ou A5000+ (16+ GB).

## Étapes

### 1. Télécharger Common Voice 15.0 (fr)

```bash
python 01-download-cv.py --out-dir ./cv-fr
# ~30 GB téléchargés, ~1h selon connexion
```

### 2. Générer pseudo-labels via qwen3-asr local

```bash
# Démarrer qwen3-asr.cpp (si pas déjà up)
docker compose up -d qwen-asr

# Lancer le pseudo-labeling
python 02-pseudo-label.py --cv-dir ./cv-fr --out ./cv-fr-pseudo/train.jsonl
# ~3-6h selon GPU, ~150h retenues après filtre confiance
```

### 3. Fine-tune LoRA

```bash
python 03-train-lora.py --data ./cv-fr-pseudo/train.jsonl --out ./lora-out
# Génère ./lora-out/train_lora.py qu'il faut lancer ensuite
# ~6-12h de training
cd ./lora-out && python train_lora.py
```

### 4. Merger LoRA → GGUF (pour llama.cpp)

```bash
python -m transformers.models.qwen2.convert_to_gguf \
    ./lora-out/lora-adapter \
    --outfile ./lora-out/fr-ca-lora.gguf
```

### 5. Évaluer WER avant/après

```bash
python 04-evaluate.py --cv-dir ./cv-fr --max-samples 200
# Génère eval-report.md avec WER baseline vs fine-tuné
```

## Résultats attendus

- **Baseline qwen3-asr fr** : ~8-12% WER sur Common Voice fr
- **Fine-tuné fr-CA** : -2 à -5% WER attendu (varie selon qualité dataset)
- **TTFA** : inchangé (~300ms local)

## Notes

- LoRA r=16, alpha=32, target=q,k,v,o + MLP (paramètres minimaux)
- Épochs=3 suffisant (overfitting rapide sur ASR)
- Si résultats mauvais : augmenter epochs, vérifier pseudo-labels (regarder manuellement 20-30 samples)
- Le LoRA adapter est ensuite mergé avec le modèle de base puis exporté en GGUF pour llama.cpp
