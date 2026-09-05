# 🧠 MEGA-PLAN — Speech Emotion Recognition (SER) ready 2030

> **Owner** : UltraBlabla voice pipeline · **Workspace** : `D:\Applications\UltraBlabla`
> **Statut** : Layers 1 + 2 shippées (2026-08-29) · **Cible** : prêt 2030
> **Succès mesuré** : remplace Qwen2-Audio (mort, instable) par wav2vec2-fr on-device
> sur **WebGPU via `bun-webgpu` FFI** (Dawn natif, DX12) + fallback DML. Frontend
> browser-side SER disponible aussi (`src/fe/voice/ser-browser.ts`).
> Latence warm median : **WebGPU 20.8 ms · DML 11.8 ms** · VRAM : **~640 MB** (vs 4.5 GB avant).

---

## 0. Pourquoi ce document

L'étape émotion du pipeline vocal UltraBlabla tournait sur un container
**Qwen2-Audio-7B** servi via Docker Model Runner sur `:12434`. Trois
problèmes mesurés :

1. **Container down** (port 12434 KO) → enrichissement émotionnel silencieusement skippé depuis 2026-08-28.
2. **Instable au Q4_K_M** : `docs/ARSENAL_CLASSIFICATION_2026.md §3` documente 3 prompts = 3 réponses différentes (Tristesse / angry / JOIE) sur le même audio.
3. **Sur-dimensionné** : 7.75 B params pour classer 5 émotions — un LLM qui improvise, pas un classifier.

Le swap proposé est **wav2vec2-lg-xlsr-fr-speech-emotion-recognition** (315 M params,
Apache-2.0, dédié français, 4 h de données de conversation réelle, 5 émotions :
Pleased / Relaxed / Neutral / Sad / Tension). Modèle FP16 ONNX 602 MB servi
localement via `onnxruntime-node` + **bun-webgpu FFI → WebGPU → Dawn → DX12**.

**Découverte clé 2026-08-29** : Bun 1.4 n'expose pas `navigator.gpu` nativement,
MAIS le package [`bun-webgpu`](https://github.com/kommander/bun-webgpu) injecte
la globals WebGPU via FFI vers Dawn (l'implémentation C++ native de Google).
WebGPU est donc disponible aujourd'hui, sans attendre Bun 1.5.

---

## 1. Performance mesurée (Layers 1 + 2 — RTX 3090, Bun 1.4)

| Backend | Load | Warm min | Warm median | Warm p95 | Parallel inf/s | VRAM |
|---|---|---|---|---|---|---|
| **WebGPU** (`bun-webgpu` FFI → Dawn → DX12) | 1.5 s | 19.1 ms | **20.8 ms** | 23.4 ms | 49 inf/s | ~640 MB |
| **DML** (`onnxruntime-node` → DX12 natif) | 1.5 s | **10.6 ms** | 11.8 ms | 13.5 ms | **84 inf/s** | ~640 MB |
| WASM (8 threads + SIMD, `onnxruntime-web`) | 3.1 s | 4250 ms | 4346 ms | 4416 ms | 0.2 inf/s | 0 MB |
| **Frontend WebGPU** (Chromium-based browser) | — | — | **<10 ms** attendu | — | — | GPU memory |

**Verdict** : WebGPU est 2× plus lent que DML pour **ce modèle précis** sur RTX 30xx.
Mais WebGPU est **cross-platform** (Metal sur Apple, Vulkan sur Linux, DX12 sur Windows)
et **NPU-ready** (WebGPU expose les NPUs là où disponibles). DML est spécifique Windows.

**Recommandation** : par défaut `SER_BACKENDS=webgpu,dml,cpu` (futur-proof).
Pour raw speed sur RTX 30xx Windows : `SER_BACKENDS=dml,webgpu,cpu`.

---

## 2. Architecture runtime

```
┌──────────────────────────────────────────────────────────────────────────┐
│  UltraBlabla Elysia server (Bun 1.4 + bun-webgpu FFI)                   │
│                                                                          │
│  WebSocket /ws →  _buildMsg(text, {audio})                               │
│                          │                                               │
│                          ▼                                               │
│           ┌────────────────────────────┐                                │
│           │ emotion_hint (optional) ?  │                                │
│           └────────────────────────────┘                                │
│                │                  │                                      │
│           client-side         absent                                    │
│           (WebGPU/WASM)       fallback                                   │
│                │                  │                                      │
│                ▼                  ▼                                      │
│         trust + cache     startEmotionExtraction(pcmB64, signal)         │
│           immediately        fire-and-forget                             │
│                                  │                                       │
│                                  ▼                                       │
│                          EmotionCache 8s                                 │
│                                  ▲                                       │
│                                  │                                       │
│   pcm16leToFloat32 → normalize → ort.InferenceSession.run                │
│                          │                                               │
│                          ▼                                               │
│              ┌─────────────────────────────┐                             │
│              │  onnxruntime-node (Bun)     │                             │
│              │  EP order via SER_BACKENDS:  │                             │
│              │  ['webgpu','dml','cpu'] *    │ ←─ bun-webgpu FFI          │
│              │  ['dml','webgpu','cpu']      │ ←─ raw speed RTX 30xx      │
│              └─────────────────────────────┘                             │
│                          │                                               │
│                          ▼                                               │
│                   5-class logits → softmax → argmax                     │
│                          │                                               │
│                          ▼                                               │
│                  hintFor(label) → system prompt du tour N+1              │
└──────────────────────────────────────────────────────────────────────────┘

(*) ou frontend browser-side (ser-browser.ts) qui bypass le serveur complètement
```

**Garanties** :
- Le modèle est **pré-warmé au boot** via `app.onStart(prewarmSer)` (serveur) + `ser.preload()` (frontend).
- Toute erreur (ORT down, model manquant, audio trop court, confidence < 0.35) → `null`.
- **Zéro régression** vs le comportement précédent (cache 8 s, fire-and-forget, hint LLM).
- Le frontend peut bypass le serveur en envoyant `emotion_hint` directement dans le WS.

---

## 3. Roadmap 4 couches (2026 → 2030)

### Layer 1 — **SHIPPÉ** ✅ (2026-08-29 matin)

- `onnxruntime-node` v1.29 + **DirectML (DX12)** + modèle wav2vec2-fr fp16 ONNX 602 MB
- Bench : **11.8 ms median warm, 84 inf/s parallèle, ~640 MB VRAM**

### Layer 2 — **SHIPPÉ** ✅ (2026-08-29 après-midi, grace à `bun-webgpu`)

- `bun-webgpu` injecte `navigator.gpu` via FFI vers Dawn (C++ natif)
- `onnxruntime-node` détecte le GPU WebGPU et l'utilise comme EP primaire
- **Cross-platform** : un seul code, marche sur Windows (DX12), Mac (Metal), Linux (Vulkan)
- **NPU-ready** : WebGPU expose les NPUs (Apple Neural Engine, Qualcomm Hexagon, etc.) là où disponibles
- Bench : **20.8 ms median warm, 49 inf/s parallèle, ~640 MB VRAM**
- Frontend browser-side : `src/fe/voice/ser-browser.ts` (WebGPU primary, WASM fallback)

### Layer 3 — **2027** (maturation + accuracy)

- **INT8 quantization** statique du modèle ONNX → **~150 MB VRAM** (vs 640 MB fp16)
  - Outils : `onnxruntime.quantization.quantize_static` avec calibration set de 100 clips FR
  - Latence : **−30 %** attendue (INT8 GEMM plus rapide sur Blackwell/Ada)
- **Speculative partial-audio inference** (Layer 3.a) :
  - Tour N+1 reçoit 1.5 s d'audio → inférence immédiate
  - Tour N+2 reçoit l'audio complet → re-inférence, remplace le cache si delta > 0.2
- **Continuous batching** multi-sessions (Layer 3.b) :
  - Batch 4-8 utterances simultanées → amortit le coût fixe de la CNN front-end
  - Throughput attendu : **>200 inf/s**
- **Multi-task head** (Layer 3.c) :
  - Ajouter un head de valence-arousal continu (régression 2D)
  - Sortie : 5 classes + 2 dimensions continues → "mélancolie teintée d'humour"

### Layer 4 — **2028-2030** (on-device personalization + multi-modal)

- **WebNN + DirectML 2.0** (Layer 4.a) :
  - WebNN expose directement les **NPUs** (inférence <1 ms, <50 mW)
  - Pré-requis hardware : Snapdragon X Elite / Apple M4+ / Lunar Lake
  - Effort : ajouter `'webnn'` aux SER_BACKENDS
- **Federated learning on-device** (Layer 4.b) :
  - Le modèle se fine-tune localement sur les patterns émotionnels de l'utilisateur
  - Seuls les **gradients delta** (chiffrés) sont envoyés au cloud pour aggregation
- **Multi-modal fusion** (Layer 4.c) :
  - Audio (SER) + vidéo (face micro-expressions via MediaPipe) + texte (LLM sentiment)
  - Score combiné : **×3 accuracy** vs audio seul sur les états ambigus
- **Emotion-conditioned TTS** (Layer 4.d) :
  - Le hint émotionnel remonte dans le sidecar TTS (qwentts.cpp) pour moduler prosodie
- **SpeechBrain self-supervised pre-training** :
  - Ré-entraîner le backbone sur 100 h de radio/podcast FR-Canadien
  - F1 cible : **>0.65** (vs 0.41 actuel)

---

## 4. Performance budget

| Métrique | Layer 1 ✅ (DML) | Layer 2 ✅ (WebGPU FFI) | Layer 3 cible | Layer 4 cible |
|---|---|---|---|---|
| Cold start | 1.5 s | 1.5 s | <2 s (INT8 load) | <3 s |
| Warm median | **11.8 ms** | **20.8 ms** | <3 ms | **<1 ms (NPU)** |
| Throughput parallèle | 84 inf/s | 49 inf/s | >200 inf/s | >500 inf/s |
| VRAM pic | 640 MB | 640 MB | **150 MB (INT8)** | **80 MB (INT4 + NPU offload)** |
| Modèle on-disk | 602 MB | 602 MB | **150 MB** | **80 MB** |
| Émissions (F1) | F1=0.41 | F1=0.41 | F1=0.50 | **F1>0.65** |
| Privacy | 100 % on-device | 100 % on-device | 100 % on-device | 100 % on-device + federated |
| Cross-platform | Windows only | **Windows/Mac/Linux/mobile** | idem | idem |
| NPU-ready | ❌ | ✅ | ✅ | ✅✅ |

---

## 5. Runtime backends — comment ça marche

| Backend | Package | Quand | Perf RTX 3090 |
|---|---|---|---|
| **WebGPU via `bun-webgpu`** | `bun-webgpu` (FFI) + `onnxruntime-node` | Default depuis 2026-08-29 | **20.8 ms median warm** |
| **DML via `onnxruntime-node`** | idem (built-in) | `SER_BACKENDS=dml,webgpu,cpu` | **11.8 ms median warm** (le plus rapide sur RTX) |
| **WASM via `onnxruntime-web`** | idem (built-in) | Non recommandé pour ce modèle | 4346 ms (trop lent) |
| **Frontend WebGPU** | `onnxruntime-web` | Browsers (Chrome/Edge/Safari 17+/Firefox) | <10 ms attendu |
| **Frontend WASM** | `onnxruntime-web` | Fallback navigateur sans WebGPU | ~100 ms (acceptable côté client) |

`bun-webgpu` est le **game-changer** : il permet à Bun d'utiliser WebGPU (la nouvelle
API GPU standard cross-platform) via FFI vers Dawn (l'implémentation C++ officielle
de Google). Quand Bun shippera WebGPU nativement (target 1.5+), on pourra dropper
`bun-webgpu` sans changer le code applicatif — le pattern reste `['webgpu', 'dml', 'cpu']`.

---

## 6. Stratégie télémétrie

Chaque appel `classify()` expose via `ser.stats()` :

```json
{ "loaded": true, "load_ms": 1516, "calls": 56,
  "last_label": "Neutral", "last_score": 0.889, "providers": ["webgpu"] }
```

Exposé via `/api/config` (champ `ser`). À venir :
- P50/P95/P99 glissants sur 100 derniers appels (côté worker, ring buffer)
- Distribution des labels sur 1000 derniers appels (drift detection)
- Alerte si `last_score < 0.4` plus de 20 % du temps

Storage cible : table D1 `ser_metrics` côté `cloudflare-ai`, agrégation horaire.

---

## 7. Comment rebuild le modèle (one-shot)

Le runtime charge `models/ser-wav2vec2-fr/model_fp16.onnx`. Pour régénérer :

```bash
python -m pip install "optimum[onnxruntime]" onnx onnxruntime torch transformers soundfile numpy
python scripts/build-ser-model.py
```

Aucun Python runtime nécessaire ensuite.

---

## 8. Comment choisir son backend

```bash
# Default (futur-proof, cross-platform) — Layer 2 actuel
SER_BACKENDS=webgpu,dml,cpu bun src/server.ts

# Raw speed RTX 30xx Windows — Layer 1 (DML)
SER_BACKENDS=dml,webgpu,cpu bun src/server.ts

# CPU only (debug, pas de GPU)
SER_BACKENDS=cpu bun src/server.ts
```

Le frontend (`src/fe/voice/ser-browser.ts`) gère sa propre décision :
- Si `navigator.gpu` disponible → WebGPU
- Sinon → WASM-SIMD-threaded (lent mais fonctionne)

---

## 9. TL;DR — pourquoi c'est mieux

| Critère | Qwen2-Audio | wav2vec2-fr + bun-webgpu |
|---|---|---|
| Latence warm | +1066 ms cold | **+11.8 ms (DML) ou +20.8 ms (WebGPU)** |
| Stabilité | ❌ prompt-shaped | ✅ déterministe |
| VRAM | 4.5 GB | 640 MB (**7× moins**) |
| Disponibilité | ❌ container down | ✅ in-process |
| License | Apache-2.0 | Apache-2.0 |
| Cible FR | générique | **dédié** |
| F1 mesuré | n/a | 0.41 (honnête) |
| Privacy | data → container → logs | **100 % local, rien sort** |
| Cross-platform | ❌ Linux only | ✅ Windows/Mac/Linux/mobile |
| NPU-ready | ❌ | ✅ (Layer 4) |
| 2030-ready | ❌ | ✅ |

**Status : Layers 1 + 2 shippées. WebGPU NOW sur Bun via FFI. Le futur est déjà là.**