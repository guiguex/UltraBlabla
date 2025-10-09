# Script de setup pour UltraBlabla - Utilise UltraCoder + neuTTS

Write-Host "🚀 Setup UltraBlabla avec UltraCoder + neuTTS" -ForegroundColor Green

Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si UltraCoder est accessible
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8441/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ UltraCoder API accessible (port 8441)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ UltraCoder API non accessible sur port 8441" -ForegroundColor Red
    Write-Host "   Lance d'abord ton UltraCoder !" -ForegroundColor Yellow
}

# Vérifier neuTTS (Hugging Face)
try {
    $headers = @{"User-Agent"="UltraBlabla/1.0"}
    $response = Invoke-WebRequest -Uri "https://api-inference.huggingface.co/models/neuphonic/neutts-air" -Headers $headers -Method HEAD -TimeoutSec 5
    Write-Host "✅ neuTTS (Hugging Face) accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  neuTTS non accessible (pas grave, on a des fallbacks)" -ForegroundColor Yellow
}

Write-Host "� SETUP TERMINÉ !" -ForegroundColor Green
Write-Host "🎤 Lance maintenant :" -ForegroundColor Cyan
Write-Host "   1. Assure-toi que ton UltraCoder tourne (port 8441)" -ForegroundColor White
Write-Host "   2. bun run build && bun run dev" -ForegroundColor White
Write-Host "   3. Va sur http://localhost:3000" -ForegroundColor White