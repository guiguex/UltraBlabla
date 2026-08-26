Write-Host "🚀 Compilation de l'APK Android UltraBlabla..." -ForegroundColor Green

$jdkDir = "d:\Applications\UltraBlabla\jdk21"
$env:JAVA_HOME = $jdkDir
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "Java Version:"
java -version

Write-Host "Building web assets..."
bun run build

Write-Host "Syncing Capacitor..."
bunx cap sync android

Write-Host "Building Android APK (assembleDebug)..."
cd d:\Applications\UltraBlabla\android
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkSource = "d:\Applications\UltraBlabla\android\app\build\outputs\apk\debug\app-debug.apk"
    $apkDest = "d:\Applications\UltraBlabla\public\app.apk"
    Copy-Item -Path $apkSource -Destination $apkDest -Force
    Write-Host "✅ SUCCESS: APK généré et disponible à l'adresse web !" -ForegroundColor Green
    Write-Host "📲 Téléchargement direct: https://ultrablabla.guig.dev/app.apk" -ForegroundColor Cyan
} else {
    Write-Error "Échec de la compilation de l'APK"
    exit 1
}
