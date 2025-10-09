#!/bin/bash
# Script de téléchargement des modèles UltraBlabla

MODEL_DIR="android/app/src/main/assets/models"
mkdir -p "$MODEL_DIR"

echo "🚀 Téléchargement des modèles UltraBlabla..."

# 1. Vosk STT Français
echo "📢 Téléchargement Vosk STT français (40MB)..."
if [ ! -f "$MODEL_DIR/vosk-model-small-fr-0.22.zip" ]; then
    wget -O "$MODEL_DIR/vosk-model-small-fr-0.22.zip" \
         "https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip"
    echo "✅ Vosk STT téléchargé"
else
    echo "✅ Vosk STT déjà présent"
fi

# 2. Qwen3 LLM
echo "🧠 Téléchargement Qwen3-0.5B GGUF (400MB)..."
if [ ! -f "$MODEL_DIR/qwen2.5-0.5b-instruct-q4_k_m.gguf" ]; then
    wget -O "$MODEL_DIR/qwen2.5-0.5b-instruct-q4_k_m.gguf" \
         "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
    echo "✅ Qwen3 LLM téléchargé"
else
    echo "✅ Qwen3 LLM déjà présent"
fi

echo "🎉 Modèles prêts pour UltraBlabla Android !"
echo "📁 Modèles dans: $MODEL_DIR"

ls -lh "$MODEL_DIR"