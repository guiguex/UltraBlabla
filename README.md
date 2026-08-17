# 🎙️ UltraBlabla • AI Voice Neural Interface

![UltraBlabla Banner](https://blablabla-74743714-2076b.web.app/icons/icon-512.png)

> **L'assistant vocal Next Gen : Ultra-rapide, Fluide, et Connecté.**

UltraBlabla est une application vocale "Edge" conçue pour offrir une interaction vocale sans friction avec l'Intelligence Artificielle. Avec une interface holographique futuriste, une détection dynamique de la parole (VAD), et un pipeline composite (ASR -> LLM -> TTS) déployé sur l'infrastructure Cloudflare Edge, UltraBlabla redéfinit la réactivité des assistants virtuels.

## ✨ Caractéristiques Principales

- 🧠 **Intelligence Artificielle de Pointe** : Propulsé par le modèle LLM *Llama 3.1 8B Instruct* via Cloudflare Workers AI.
- ⚡ **Latence Quasi-Nulle (Edge)** : Pipeline de traitement composite (Whisper Large V3 + Deepgram Aura TTS) exécuté au plus près de l'utilisateur.
- 🎙️ **Détection Vocale Adaptative (VAD)** : Écoute intelligente à 60 FPS qui détecte précisément la fin de parole pour un enchaînement naturel.
- 🌌 **Design Holographique "Next Gen"** : Interface neuronale avec effets quantiques, moniteur d'activité en temps réel, et mode "ChatBox" intégré.
- 📱 **Multi-plateformes** : WebApp ultra-performante et application native Android 15 (Target SDK 35) via Capacitor 8.5.

## 🏗️ Architecture

L'application est structurée en plusieurs couches haute performance :
1. **Frontend UI** : Vanilla JS/HTML/CSS optimisé. Aucune dépendance lourde, garantissant une fluidité parfaite des animations holographiques.
2. **Logiciel Audio (VAD/WebRTC)** : Script client `webapp.ts` gérant la capture microphonique et la détection d'énergie (silences & onsets).
3. **Backend Proxy (Bun & ElysiaJS)** : Un serveur relais local ultra-rapide (`src/server.ts`) qui sécurise les requêtes vers l'API Cloudflare globale (`https://api.guig.dev`).

## 🚀 Démarrage Rapide (Quick Start)

### 🐳 Via Docker (Recommandé pour serveur)
UltraBlabla est entièrement conteneurisé.
```bash
# 1. Construire l'image
docker build -t ultrablabla:latest .

# 2. Lancer le conteneur sur le port 3000
docker run -d -p 3000:3000 --name ultrablabla ultrablabla:latest
```

### 💻 Via Bun (Développement Local)
```bash
# 1. Installer les dépendances
bun install

# 2. Compiler le frontend (Minification)
bun run build

# 3. Lancer le serveur de développement avec Hot-Reload
bun run dev
```

### 🤖 Build Android (Capacitor)
```bash
# Synchroniser le web (public) vers le projet Android
bun run android:sync

# Ouvrir Android Studio
bun run android:open
```

## 🔒 Confidentialité & Sécurité
Le serveur Bun agit comme un bouclier pour l'API Edge, protégeant les clés d'API et gérant les requêtes CORS. Consultez le fichier [SECURITY.md](SECURITY.md) pour plus de détails.

---
*Build 2030.10.08 • Quantum Neural Engine*
