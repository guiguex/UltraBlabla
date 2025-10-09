# Script PowerShell de téléchargement des modèles UltraBlabla

$MODEL_DIR = "android\app\src\main\assets\models"
if (!(Test-Path $MODEL_DIR)) {
    New-Item -ItemType Directory -Path $MODEL_DIR -Force
}

Write-Host "🚀 Téléchargement des modèles UltraBlabla..." -ForegroundColor Cyan

# 1. Vosk STT Français
Write-Host "📢 Téléchargement Vosk STT français (40MB)..." -ForegroundColor Yellow
$voskFile = "$MODEL_DIR\vosk-model-small-fr-0.22.zip"
if (!(Test-Path $voskFile)) {
    $voskUrl = "https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip"
    Write-Host "   Téléchargement depuis: $voskUrl"
    Invoke-WebRequest -Uri $voskUrl -OutFile $voskFile -UseBasicParsing
    Write-Host "✅ Vosk STT téléchargé" -ForegroundColor Green
} else {
    Write-Host "✅ Vosk STT déjà présent" -ForegroundColor Green
}

# 2. Qwen3 LLM
Write-Host "🧠 Téléchargement Qwen3-0.5B GGUF (400MB)..." -ForegroundColor Yellow
$qwenFile = "$MODEL_DIR\qwen2.5-0.5b-instruct-q4_k_m.gguf"
if (!(Test-Path $qwenFile)) {
    $qwenUrl = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
    Write-Host "   Téléchargement depuis: $qwenUrl"
    Write-Host "   ⚠️  Fichier volumineux, patience..." -ForegroundColor Magenta
    Invoke-WebRequest -Uri $qwenUrl -OutFile $qwenFile -UseBasicParsing
    Write-Host "✅ Qwen3 LLM téléchargé" -ForegroundColor Green
} else {
    Write-Host "✅ Qwen3 LLM déjà présent" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Modèles prêts pour UltraBlabla Android !" -ForegroundColor Green
Write-Host "📁 Modèles dans: $MODEL_DIR" -ForegroundColor Cyan

# Afficher les fichiers téléchargés
Get-ChildItem -Path $MODEL_DIR | Format-Table Name, @{Name="Taille";Expression={"{0:N2} MB" -f ($_.Length / 1MB)}}, LastWriteTime

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Exécuter: bun run android:build"
Write-Host "   2. Ou: bun run android:run (pour tester directement)"
Write-Host "   3. Intégrer llama.cpp JNI (voir LLAMA_JNI_INTEGRATION.md)"