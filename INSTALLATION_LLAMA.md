# Installation llama.cpp pour UltraBlabla Android

## Prérequis Android Studio
- Android NDK installé (SDK Manager > SDK Tools > NDK)
- CMake installé (SDK Manager > SDK Tools > CMake)

## Installation llama.cpp

### 1. Clone llama.cpp dans le projet
```bash
cd android/app/src/main/cpp
git clone https://github.com/ggerganov/llama.cpp.git
```

### 2. Build avec Android Studio
1. Ouvrez `android/` dans Android Studio
2. Le CMakeLists.txt détectera automatiquement llama.cpp
3. Build > Make Project
4. Les librairies natives seront compilées automatiquement

### 3. Alternative: Build manuel avec NDK
```bash
# Si vous préférez compiler manuellement
export ANDROID_NDK_HOME=/path/to/ndk
cd android/app/src/main/cpp/llama.cpp

mkdir build-android && cd build-android
cmake -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake \
      -DANDROID_ABI=arm64-v8a \
      -DANDROID_PLATFORM=android-23 \
      -DLLAMA_BUILD_SHARED=ON \
      -DGGML_USE_METAL=OFF \
      ..
make -j4
```

## Status actuel UltraBlabla

### ✅ Prêt et fonctionnel
- **Interface clean** (fini le design complexe !)
- **Vosk STT 0.3.70** intégré avec modèle français dans assets/
- **Structure CMake** pour llama.cpp avec stub fonctionnel
- **Plugin Capacitor** natif avec toutes les méthodes
- **Modèles copiés** dans android/app/src/main/assets/models/

### 🔧 À finaliser après llama.cpp
- Compilation native llama.cpp (suivez étape 1 ci-dessus)
- JNI bindings déjà créés (ultrablabla_llama_jni.cpp)
- Test sur appareil réel

## Commandes de test

```bash
# Compile et teste sur appareil
bun run android:build
bun run android:run

# Ou ouvrir dans Android Studio
bun run android:open
```

### Note importante
Le stub JNI fonctionne déjà ! L'app compile et tourne, mais sans llama.cpp les réponses LLM seront des stubs. Une fois llama.cpp cloné, tout s'active automatiquement.