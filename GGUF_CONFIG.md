# Configuration Modèles GGUF pour UltraBlabla

## 📁 Structure Assets Android

```
android/app/src/main/assets/
├── model-fr/                          # Vosk STT français
│   ├── am/
│   ├── graph/
│   ├── ivector/
│   ├── conf/
│   └── ...                           # vosk-model-small-fr-0.22 dézippé
└── llm/
    └── qwen3-0.6b-instruct.Q4_K_M.gguf  # Modèle quantisé
```

## 🔧 Modèle Qwen3-0.6B GGUF Recommandé

### Format de quantisation optimal pour Android :
- **Q4_K_M** : Équilibre optimal qualité/taille (~350MB)
- **Q4_0** : Plus compact (~300MB) si espace limité
- **IQ4_NL** : Qualité supérieure (~380MB) si RAM suffit

### Téléchargement (Hugging Face) :
```bash
# Option 1: Via huggingface_hub Python
pip install huggingface_hub
python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='Qwen/Qwen2.5-0.5B-Instruct-GGUF',
    filename='qwen2.5-0.5b-instruct-q4_k_m.gguf',
    local_dir='android/app/src/main/assets/llm/'
)
"

# Option 2: Curl direct
curl -L "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf" \
  -o android/app/src/main/assets/llm/qwen3-0.6b-instruct.Q4_K_M.gguf
```

## ⚙️ Configuration JNI Optimisée

### Paramètres llama.cpp pour Android :
```cpp
// Context params optimisés GGUF mobile
ctx_params.n_ctx = 2048;        // Context optimal mobile
ctx_params.n_threads = 4;       // ARM64 cores
ctx_params.n_batch = 512;       // Batch size mobile
ctx_params.use_mmap = true;     // Memory mapping performance
ctx_params.use_mlock = false;   // Éviter mlock sur Android
```

### Quantisation supportées par ordre de préférence :
1. **Q4_K_M** - Optimal pour la plupart des cas
2. **Q4_0** - Compact, bonne qualité 
3. **Q5_K_M** - Qualité supérieure (si RAM suffisante)
4. **Q6_K** - Très haute qualité (appareils haut de gamme)

## 🚀 Compilation NDK

### Prérequis :
```bash
# Android SDK + NDK
export ANDROID_NDK=/path/to/ndk
export ANDROID_SDK=/path/to/sdk

# Cloner llama.cpp dans le projet
git clone https://github.com/ggerganov/llama.cpp.git \
  android/app/src/main/cpp/llama.cpp
```

### Build avec Gradle :
```bash
./gradlew assembleDebug    # Build APK avec NDK
```

## 📊 Performance GGUF sur Android ARM64

| Format | Taille | RAM Usage | Tokens/sec | Qualité |
|--------|--------|-----------|------------|---------|
| Q4_0   | ~300MB | ~500MB    | ~8-12      | Bonne   |
| Q4_K_M | ~350MB | ~600MB    | ~6-10      | Très bonne |
| Q5_K_M | ~420MB | ~700MB    | ~4-8       | Excellente |
| Q6_K   | ~500MB | ~850MB    | ~3-6       | Optimale |

## 🔍 Validation Modèle

### Test via llama-cli (desktop) :
```bash
llama-cli -m qwen3-0.6b-instruct.Q4_K_M.gguf \
  -p "Bonjour, comment allez-vous ?" \
  -c 2048 -n 50 --temp 0.7
```

### Vérification GGUF :
```bash
# Vérifier le format
file qwen3-0.6b-instruct.Q4_K_M.gguf

# Output attendu: "GGUF model file"
```

---
**UltraBlabla Voice AI** • *Configuration GGUF pour Android* 🚀