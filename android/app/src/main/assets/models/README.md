# Modèles UltraBlabla

## Téléchargements requis

### 1. Vosk STT Français (obligatoire)
```bash
# Modèle small (~42 MB)
wget https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip
# Placer le ZIP dans android/app/src/main/assets/
```
> `StorageService.unpack` décompresse automatiquement le ZIP au premier lancement.

### 2. Qwen3-0.6B GGUF (obligatoire)
```bash
# Modèle Qwen3 0.6B quantifié Q4_K_M (~640 MB)
wget https://huggingface.co/<org>/<repo>/resolve/main/qwen3-0_6b-instruct-q4_k_m.gguf
# Renommer en qwen3-0.6b-instruct.Q4_K_M.gguf si nécessaire
# Copier vers android/app/src/main/assets/llm/
```

## Intégration llama.cpp

1. Cloner https://github.com/ggerganov/llama.cpp dans `android/app/src/main/cpp/llama.cpp`
2. Suivre `docs/android.md` du projet llama.cpp pour compiler via NDK
3. CMake construit la bibliothèque `libllama-jni.so` et la relie au plugin `Voice`
4. Aucune modification Java supplémentaire n'est requise (JNI exposé via `LlamaNative`)

## Structure attendue
```
android/app/src/main/assets/
├── llm/
│   └── qwen3-0.6b-instruct.Q4_K_M.gguf
├── model-fr/                # (créé à l'exécution)
├── vosk-model-small-fr-0.22.zip
└── models/README.md
```
