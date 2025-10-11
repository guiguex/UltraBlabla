# Setup llama.cpp pour UltraBlabla
# À exécuter après clone du repo

$llamaPath = "android/app/src/main/cpp/llama.cpp"

if (Test-Path $llamaPath) {
    Write-Host "✅ llama.cpp déjà présent" -ForegroundColor Green
    exit 0
}

Write-Host "📥 Clonage llama.cpp officiel..." -ForegroundColor Cyan
git clone --depth 1 --branch master https://github.com/ggerganov/llama.cpp.git $llamaPath

if (Test-Path "$llamaPath/CMakeLists.txt") {
    Write-Host "✅ llama.cpp cloné avec succès (24 MB)" -ForegroundColor Green
    Write-Host "🔧 Maintenant vous pouvez compiler avec:" -ForegroundColor Yellow
    Write-Host "   cd android && ./gradlew assembleDebug" -ForegroundColor Yellow
} else {
    Write-Host "❌ Échec du clonage llama.cpp" -ForegroundColor Red
    exit 1
}
