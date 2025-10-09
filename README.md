# UltraBlabla Voice AI 🎙️# UltraBlabla Voice AI 🎙️



Assistant vocal ultra-dynamique avec **conversation continue** sur un seul bouton.Assistant vocal ultra-dynamique avec **conversation continue** sur un seul bouton.



## 🚀 Fonctionnement Simple## 🚀 Fonctionnement Simple



**UN SEUL BOUTON PLAY :****UN SEUL BOUTON PLAY :**

1. **Appuyez** → Mode écoute activé1. **Appuyez** → Mode écoute activé

2. **Parlez** → Transcription automatique  2. **Parlez** → Transcription automatique  

3. **IA répond** → Réponse vocale automatique (max 600 caractères)3. **IA répond** → Réponse vocale automatique (max 600 caractères)

4. **Continuez** → Conversation fluide sans interruption4. **Continuez** → Conversation fluide sans interruption



## ⚡ Technologies## ⚡ Technologies



- **STT** : Vosk Android (Français offline)- **STT** : Vosk Android (Français offline)

- **LLM** : Qwen3-0.6B (Local, réponses courtes)- **LLM** : Qwen3-0.6B (Local, réponses courtes)

- **TTS** : Google TTS (Français offline)- **TTS** : Google TTS (Français offline)

- **UI** : Interface holographique 2030- **UI** : Interface holographique 2030



## 🔧 Setup Rapide## 🔧 Setup Rapide



```bash```bash

# Installation# Installation

bun installbun install



# Développement# Développement

bun run build && bun run dev    # http://localhost:3000bun run build && bun run dev    # http://localhost:3000



# Android (nécessite Java + Android SDK)# Android (nécessite Java + Android SDK)

bun run android:sync            # Sync Capacitor  bun run android:sync            # Sync Capacitor  

``````



### Modèles requis (à placer dans `android/app/src/main/assets/`)### Modèles requis (à placer dans `android/app/src/main/assets/`)

- **STT** : `vosk-model-small-fr-0.22` → `assets/model-fr/`- **STT** : `vosk-model-small-fr-0.22` → `assets/model-fr/`

- **LLM** : `Qwen3-0.6B Q4_K_M.gguf` → `assets/llm/`- **LLM** : `Qwen3-0.6B Q4_K_M.gguf` → `assets/llm/`



------

**UltraBlabla** • *Assistant vocal du futur* 🚀**UltraBlabla** • *Assistant vocal du futur* 🚀