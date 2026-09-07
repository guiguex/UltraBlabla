$baseUrl = "https://unpkg.com/onnxruntime-web@1.29.0/dist/"
$targetDir = "public\onnxruntime-web"

# Créer le dossier s'il n'existe pas
if (-not (Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$files = @(
    "ort-wasm-simd-threaded.asyncify.wasm",
    "ort-wasm-simd-threaded.asyncify.mjs",
    "ort-wasm-simd-threaded.jspi.wasm",
    "ort-wasm-simd-threaded.jspi.mjs",
    "ort-wasm-simd-threaded.jsep.wasm",
    "ort-wasm-simd-threaded.jsep.mjs",
    "ort-wasm-simd-threaded.wasm",
    "ort-wasm-simd-threaded.mjs"
)

foreach ($file in $files) {
    $outPath = Join-Path -Path $targetDir -ChildPath $file
    
    Write-Host "Téléchargement de $file dans $targetDir..."
    Invoke-WebRequest -Uri "$baseUrl$file" -OutFile $outPath
    
    # Si le fichier est un .wasm, on le compresse
    if ($file -match "\.wasm$") {
        $archivePath = "$outPath.7z"
        Write-Host "Compression 7-Zip maximale pour $file..."
        
        # a : ajouter à l'archive
        # -mx=9 : niveau de compression ultra (maximum)
        & 7z.exe a -mx=9 "$archivePath" "$outPath"
    }
}

Write-Host "Terminé !"