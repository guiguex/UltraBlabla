Write-Host "Checking for JDK 21..."
$jdkDir = "d:\Applications\UltraBlabla\jdk21"
$jdkZip = "$env:TEMP\jdk21.zip"

if (-not (Test-Path "$jdkDir\bin\java.exe")) {
    Write-Host "Downloading JDK 21..."
    Invoke-WebRequest -Uri "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.4%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.4_7.zip" -OutFile $jdkZip
    Write-Host "Extracting JDK 21..."
    Expand-Archive -Path $jdkZip -DestinationPath "d:\Applications\UltraBlabla\" -Force
    Rename-Item "d:\Applications\UltraBlabla\jdk-21.0.4+7" "jdk21"
}

$env:JAVA_HOME = $jdkDir
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "Java Version:"
java -version

Write-Host "Building web assets..."
bun run build

Write-Host "Syncing Capacitor..."
bunx cap sync android

Write-Host "Building Android App Bundle (AAB)..."
cd d:\Applications\UltraBlabla\android
.\gradlew clean bundleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: AAB generated at android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Green
} else {
    Write-Error "Failed to build AAB"
    exit 1
}
