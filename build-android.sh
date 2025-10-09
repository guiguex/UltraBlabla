#!/usr/bin/env bash
# Build script optimisé pour UltraBlabla Android NDK

set -e

echo "🚀 UltraBlabla Android NDK Build Script"
echo "========================================"

# 1. Build frontend TypeScript
echo "📦 Building TypeScript..."
bun run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
bun x cap sync android

# 3. Vérifier llama.cpp
LLAMA_PATH="android/app/src/main/cpp/llama.cpp"
if [ ! -d "$LLAMA_PATH" ]; then
    echo "⚠️  llama.cpp not found. Cloning..."
    git clone --depth 1 https://github.com/ggerganov/llama.cpp.git "$LLAMA_PATH"
    echo "✅ llama.cpp cloned successfully"
else
    echo "✅ llama.cpp found"
fi

# 4. Vérifier les modèles
ASSETS_PATH="android/app/src/main/assets"
echo "🔍 Checking required models..."

# Vosk STT
if [ ! -d "$ASSETS_PATH/model-fr" ]; then
    echo "⚠️  Vosk model-fr not found in $ASSETS_PATH/model-fr"
    echo "   Download: https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip"
fi

# Qwen3 LLM
if [ ! -f "$ASSETS_PATH/llm/"*.gguf ]; then
    echo "⚠️  Qwen3 GGUF model not found in $ASSETS_PATH/llm/"
    echo "   Download Q4_K_M format from Hugging Face"
fi

# 5. Configuration NDK
echo "🔧 Android NDK Configuration:"
echo "   - Target: arm64-v8a"
echo "   - API Level: 28+"
echo "   - Quantization: GGUF Q4_K_M optimized"

# 6. Build Android (si Java disponible)
if command -v java &> /dev/null; then
    echo "☕ Java found. Ready for Android build."
    echo "   Run: ./gradlew assembleDebug (in android/ folder)"
else
    echo "⚠️  Java not found. Install JDK to build Android APK"
    echo "   Download: https://adoptium.net/"
fi

echo ""
echo "✅ Build preparation complete!"
echo "🚀 Ready for Android Studio NDK compilation"