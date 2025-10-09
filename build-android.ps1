# Build script PowerShell optimisé pour UltraBlabla Android NDK

Write-Host "🚀 UltraBlabla Android NDK Build Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

try {
    # 1. Build frontend TypeScript
    Write-Host "📦 Building TypeScript..." -ForegroundColor Yellow
    bun run build

    # 2. Sync Capacitor  
    Write-Host "🔄 Syncing Capacitor..." -ForegroundColor Yellow
    bun x cap sync android

    # 3. Vérifier llama.cpp
    $LlamaPath = "android\app\src\main\cpp\llama.cpp"
    if (!(Test-Path $LlamaPath)) {
        Write-Host "⚠️  llama.cpp not found. Cloning..." -ForegroundColor Red
        git clone --depth 1 https://github.com/ggerganov/llama.cpp.git $LlamaPath
        Write-Host "✅ llama.cpp cloned successfully" -ForegroundColor Green
    } else {
        Write-Host "✅ llama.cpp found" -ForegroundColor Green
    }

    # 4. Vérifier les modèles
    $AssetsPath = "android\app\src\main\assets"
    Write-Host "🔍 Checking required models..." -ForegroundColor Yellow

    # Vosk STT
    if (!(Test-Path "$AssetsPath\model-fr")) {
        Write-Host "⚠️  Vosk model-fr not found in $AssetsPath\model-fr" -ForegroundColor Red
        Write-Host "   Download: https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip" -ForegroundColor Cyan
    }

    # Qwen3 LLM
    if (!(Get-ChildItem "$AssetsPath\llm" -Filter "*.gguf" -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Qwen3 GGUF model not found in $AssetsPath\llm\" -ForegroundColor Red
        Write-Host "   Download Q4_K_M format from Hugging Face" -ForegroundColor Cyan
    }

    # 5. Configuration NDK
    Write-Host "🔧 Android NDK Configuration:" -ForegroundColor Yellow
    Write-Host "   - Target: arm64-v8a" -ForegroundColor White
    Write-Host "   - API Level: 28+" -ForegroundColor White
    Write-Host "   - Quantization: GGUF Q4_K_M optimized" -ForegroundColor White

    # 6. Vérifier Java
    if (Get-Command java -ErrorAction SilentlyContinue) {
        Write-Host "☕ Java found. Ready for Android build." -ForegroundColor Green
        Write-Host "   Run: .\gradlew assembleDebug (in android\ folder)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Java not found. Install JDK to build Android APK" -ForegroundColor Red
        Write-Host "   Download: https://adoptium.net/" -ForegroundColor Cyan
    }

    Write-Host ""
    Write-Host "✅ Build preparation complete!" -ForegroundColor Green
    Write-Host "🚀 Ready for Android Studio NDK compilation" -ForegroundColor Green

} catch {
    Write-Host "❌ Error during build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}