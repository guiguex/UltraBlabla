$keytool = "C:\Program Files\tuxguitar\jre\bin\keytool.exe"
$keystorePath = "android\app\release.jks"

if (Test-Path $keystorePath) {
    Remove-Item $keystorePath -Force
}

& $keytool -genkey -v -keystore $keystorePath -keyalg RSA -keysize 2048 -validity 10000 -alias ultrablabla -dname "CN=UltraBlabla, OU=UltraBlabla, O=UltraBlabla, L=Montreal, S=QC, C=CA" -storepass "ultrapassword" -keypass "ultrapassword"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Keystore généré avec succès dans $keystorePath"
} else {
    Write-Error "Échec de la génération du Keystore"
    exit 1
}
