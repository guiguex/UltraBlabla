cmake_minimum_required(VERSION 3.22.1)
project("ultrablabla-llama")

# Configuration C++17 (requis pour llama.cpp)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Configuration Android NDK (selon documentation officielle llama.cpp)
if(ANDROID)
    # Optimisations ARM64 (suivant la doc llama.cpp/android.md)
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -march=armv8.7a")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -march=armv8.7a")
    
    # Désactiver OpenMP (non supporté sur Android)
    set(GGML_OPENMP OFF)
    set(GGML_LLAMAFILE OFF)
    
    # Performance optimizations
    set(CMAKE_ANDROID_ARM_NEON ON)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Répertoire llama.cpp (à cloner depuis GitHub)
set(LLAMA_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp)

# Variables GGML/LLAMA
set(LLAMA_BUILD_SHARED ON)
set(LLAMA_BUILD_STATIC OFF)
set(BUILD_SHARED_LIBS ON)

# Inclusion conditionnelle de llama.cpp (si disponible)
if(EXISTS ${LLAMA_ROOT}/CMakeLists.txt)
    message(STATUS "llama.cpp trouvé, compilation native activée")
    
    # Désactiver les features non-nécessaires
    set(LLAMA_BUILD_TESTS OFF)
    set(LLAMA_BUILD_EXAMPLES OFF)
    set(LLAMA_BUILD_SERVER OFF)
    
    # Inclure llama.cpp
    add_subdirectory(${LLAMA_ROOT} llama-build EXCLUDE_FROM_ALL)
    
    # Notre wrapper JNI
    add_library(llama-jni SHARED
        ultrablabla_llama_jni.cpp
    )
    
    # Headers llama.cpp
    target_include_directories(llama-jni PRIVATE
        ${LLAMA_ROOT}/include
        ${LLAMA_ROOT}/ggml/include
    )
    
    # Link avec llama et ggml
    target_link_libraries(llama-jni
        llama
        ggml
        log
        android
    )
    
    # Export symbols JNI
    set_target_properties(llama-jni PROPERTIES
        LINK_FLAGS "-Wl,--export-dynamic"
    )
    
else()
    message(WARNING "llama.cpp non trouvé dans ${LLAMA_ROOT}")
    message(STATUS "Compilez d'abord: git clone https://github.com/ggerganov/llama.cpp.git android/app/src/main/cpp/llama.cpp")
    
    # Stub library pour éviter les erreurs de build
    add_library(llama-jni SHARED
        ultrablabla_llama_stub.cpp
    )
    
    target_link_libraries(llama-jni log)
endif()
