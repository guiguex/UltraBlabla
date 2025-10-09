# llama.cpp JNI Integration Guide

## Étapes pour intégrer llama.cpp avec Android NDK

### 1. Clone llama.cpp
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
```

### 2. Compile pour Android
```bash
# Configure NDK
export NDK_ROOT=/path/to/android-ndk
export ANDROID_ABI=arm64-v8a
export ANDROID_PLATFORM=android-23

# Build
mkdir build-android && cd build-android
cmake -DCMAKE_TOOLCHAIN_FILE=$NDK_ROOT/build/cmake/android.toolchain.cmake \
      -DANDROID_ABI=$ANDROID_ABI \
      -DANDROID_PLATFORM=$ANDROID_PLATFORM \
      -DLLAMA_BUILD_SHARED=ON \
      ..
make -j4
```

### 3. Copier les librairies
```bash
# Copier les .so vers Android
cp libllama.so /path/to/UltraBlabla/android/app/src/main/jniLibs/arm64-v8a/
cp libggml.so /path/to/UltraBlabla/android/app/src/main/jniLibs/arm64-v8a/
```

### 4. Créer le wrapper JNI
Fichier: `android/app/src/main/cpp/llama_jni.cpp`

```cpp
#include <jni.h>
#include <string>
#include <android/log.h>
#include "llama.h"

#define TAG "LlamaJNI"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)

extern "C" JNIEXPORT jlong JNICALL
Java_com_ultrablabla_app_UltraBlablaAIPlugin_loadLlamaModel(JNIEnv *env, jobject /* this */, jstring modelPath) {
    const char *path = env->GetStringUTFChars(modelPath, 0);
    
    llama_backend_init();
    llama_model_params model_params = llama_model_default_params();
    
    llama_model *model = llama_load_model_from_file(path, model_params);
    env->ReleaseStringUTFChars(modelPath, path);
    
    return reinterpret_cast<jlong>(model);
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_ultrablabla_app_UltraBlablaAIPlugin_generateText(JNIEnv *env, jobject /* this */, 
                                                          jlong modelPtr, jstring prompt, jint maxTokens) {
    llama_model *model = reinterpret_cast<llama_model*>(modelPtr);
    const char *input = env->GetStringUTFChars(prompt, 0);
    
    // Logique de génération ici
    std::string result = "Generated: " + std::string(input);
    
    env->ReleaseStringUTFChars(prompt, input);
    return env->NewStringUTF(result.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_ultrablabla_app_UltraBlablaAIPlugin_freeLlamaModel(JNIEnv *env, jobject /* this */, jlong modelPtr) {
    llama_model *model = reinterpret_cast<llama_model*>(modelPtr);
    llama_free_model(model);
    llama_backend_free();
}
```

### 5. CMakeLists.txt
Fichier: `android/app/src/main/cpp/CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.18.1)
project("llama-android")

set(CMAKE_CXX_STANDARD 17)

# Trouver llama.cpp
find_library(llama-lib llama HINTS ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI})

# Source JNI
add_library(llama-android SHARED llama_jni.cpp)

# Lier les librairies
target_link_libraries(llama-android ${llama-lib} log)
```

### 6. build.gradle additions
```gradle
android {
    ...
    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.18.1"
        }
    }
}
```

### Notes importantes
- Qwen3-0.6B nécessite ~400MB RAM
- Tester sur appareil réel (pas émulateur)
- Optimiser avec quantification Q4_K_M
- Prévoir fallback si modèle trop lourd