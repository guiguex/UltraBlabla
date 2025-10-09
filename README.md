# UltraBlabla Voice AI 🎙️

Assistant vocal ultra-dynamique avec **conversation continue** déclenchée par un seul bouton.

## 🚀 Fonctionnement Simple

**UN SEUL BOUTON PLAY :**

1. **Appuyez** → Mode écoute activé
2. **Parlez** → Transcription automatique (Vosk FR offline)
3. **IA répond** → Réponse courte (<= 600 caractères) + synthèse vocale instantanée
4. **Continuez** → Conversation fluide sans interruption

## ⚡ Technologies

- **STT** : Vosk Android (`vosk-model-small-fr-0.22`)
- **LLM** : Qwen3-0.6B (GGUF quantifié, via llama.cpp JNI)
- **TTS** : Google Text-to-Speech (voix françaises offline)
- **UI** : Interface holographique futuriste

## 🔧 Setup Rapide

```bash
# Installation des dépendances web
bun install

# Build + serveur de dev
bun run build
bun run dev   # http://localhost:3000

# Android (nécessite Java + SDK + NDK)
bun run android:sync   # Synchronise Capacitor + Gradle
```

### Modèles requis (`android/app/src/main/assets/`)

- **STT** : `vosk-model-small-fr-0.22.zip` (fichier à décompresser automatiquement au lancement)
- **LLM** : `llm/qwen3-0.6b-instruct.Q4_K_M.gguf`

------

**UltraBlabla** • *Assistant vocal du futur* 🚀
