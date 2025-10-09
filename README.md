# UltraBlabla Voice AI �️🤖

**Assistant vocal IA native Android ultra-dynamique avec conversation continue et interface holographique 2030.**

## ⚡ Architecture Ultra-Moderne

### 🧠 **IA Native Complète**
- **STT** : Vosk Android 0.3.70 (Français offline)
- **LLM** : Qwen3-0.6B GGUF Q4_K_M + llama.cpp JNI
- **TTS** : Google TTS (Français offline)
- **Compilation** : Android NDK avec optimisations ARM64

### 🎨 **Interface Futuriste 2030**
- Design holographique avec effets quantiques
- Animations neurales interactives
- Canvas effects avec particules dynamiques
- Glassmorphism et néomorphism avancés

### � **Conversation Ultra-Dynamique**
- **Interruption naturelle** : Touchez pour interrompre l'IA
- **Écoute continue** : Pas besoin d'appuyer sur un bouton
- **Réponses courtes** : IA optimisée pour conversation fluide
- **Reprise automatique** : Conversation reprend après réponse IA

## � Installation & Setup

### 1. **Prérequis**
```bash
# Java Development Kit (requis pour Android)
# Téléchargez depuis : https://adoptium.net/
# Définissez JAVA_HOME dans votre PATH

# Android Studio avec NDK
# Ou Android SDK + NDK standalone
```

### 2. **Installation**
```bash
# Clone et installation
bun install
```

### 3. **Modèles IA**
```bash
# Téléchargez et placez dans android/app/src/main/assets/
# 
# STT: vosk-model-small-fr-0.22 → assets/model-fr/
# LLM: Qwen3-0.6B Q4_K_M.gguf → assets/llm/
```

### 4. **Compilation**
```bash
# Développement web
bun run dev           # http://localhost:3000

# Build TypeScript
bun run build         # Génère public/webapp.js

# Android Native
bun run android:sync  # Sync Capacitor
bun run android:build # Compile APK avec NDK
``` 

## 🎛️ Commandes utiles

```powershell
# Développement
bun run build       # Compile le TypeScript
bun run dev         # Lance le serveur avec hot reload
bun run setup-ai    # Vérifie que tout est OK

# Mobile
bun run capacitor:sync    # Sync plugins
bun run capacitor:open    # Ouvre Android Studio
```

## 🧠 Architecture

### Architecture hybride
- **UltraCoder API**: Port 8441 (ton serveur llama.cpp)
- **neuTTS**: Hugging Face API (cloud, haute qualité)
- **STT**: Web Speech API (natif navigateur)
- **TTS Fallbacks**: Capacitor → Web Speech API

### Proxy Elysia
- `/api/chat` → UltraCoder `/v1/chat/completions`
- `/api/stt` → Web Speech API (côté client)  
- `/api/tts` → neuTTS (Hugging Face)

### Configuration (`.env`)
```
ULTRACODER_API=http://127.0.0.1:8441
NEUTT_API=https://api-inference.huggingface.co/models/neuphonic/neutts-air
HF_TOKEN=ton_token_hugging_face (optionnel)
```

## 🔧 Tests manuels des APIs

```powershell
# Test UltraCoder (LLM)
curl -X POST http://localhost:8441/v1/chat/completions `
  -H "Content-Type: application/json" `
  -d '{"model":"default","messages":[{"role":"user","content":"Bonjour en français"}]}'

# Test neuTTS via proxy local
curl -X POST http://localhost:3000/api/tts `
  -H "Content-Type: application/json" `
  -d '{"text":"Salut mon chum!"}' `
  --output audio.wav

# STT: Web Speech API (pas de test curl, intégré navigateur)
```

## 📱 Mobile (Capacitor)

```powershell
bun run capacitor:sync    # Sync avec Android
bun run capacitor:open    # Ouvre Android Studio
bun run capacitor:run     # Build et lance sur device
```

---

**CRISSE QUE C'EST BON ! Ton assistant vocal local est prêt ! 🔥**

Hydraulic cylinder design and visualization tool with comprehensive API support.

## Description

UltraCylinder WebGPU is an engineering application for hydraulic cylinder specification and configuration. The project provides a clean API-driven architecture for cylinder design with real-time parameter adjustment.

## Features

- Multi-series cylinder design (HTR, HTH, HCL series)
- Real-time parameter configuration
- Material selection and calculations
- Cross-platform deployment (Desktop, Web, Mobile)
- RESTful API architecture

## API Structure

Key endpoints for practical integration:

- `GET /api/meta` - Series database and materials
- `GET /api/state` - Current configuration
- `POST /api/state` - Update configuration
- `GET /api/derived` - Calculated parameters
- `GET /api/frame` - Rendered visualization

## Technology

**Backend**: Bun.js, Elysia.js, TypeScript, Zod validation
**Frontend**: TypeScript, Alpine.js, Preact
**Deployment**: Wails (desktop), Capacitor (mobile), PWA (web)

## Installation

```bash
# Development
bun install
bun run dev

# Build
bun run build:web
```

## Roadmap

- Extended series library (20+ additional cylinder series planned)
- Enhanced material database
- Advanced rendering capabilities

## License

Licensed under the Apache License, Version 2.0 - see [LICENSE](LICENSE) file for details.