#include <jni.h>
#include <string>
#include <android/log.h>

// Stub JNI when llama.cpp is not bundled.
// Provides graceful fallbacks that mirror LlamaNative signatures.

#define TAG "LlamaNativeStub"
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, TAG, __VA_ARGS__)

extern "C" JNIEXPORT jboolean JNICALL
Java_com_ultrablabla_app_LlamaNative_load(JNIEnv *env, jclass, jstring modelPath) {
    const char *path = env->GetStringUTFChars(modelPath, nullptr);
    LOGW("llama.cpp non compilé - chargement stub pour %s", path ? path : "(null)");
    env->ReleaseStringUTFChars(modelPath, path);
    return JNI_FALSE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_ultrablabla_app_LlamaNative_generate(JNIEnv *env, jclass, jstring prompt, jint /* maxTokens */) {
    const char *input = env->GetStringUTFChars(prompt, nullptr);
    std::string response = "llama.cpp non compile. Reponse stub pour : ";
    response += input ? input : "";
    env->ReleaseStringUTFChars(prompt, input);
    return env->NewStringUTF(response.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_ultrablabla_app_LlamaNative_free(JNIEnv *, jclass) {
    LOGW("free() called on stub implementation");
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_ultrablabla_app_LlamaNative_getModelInfo(JNIEnv *env, jclass) {
    const char *info = "{\"status\":\"stub\",\"model\":\"Qwen3-0.6B-GGUF\",\"mode\":\"not_compiled\"}";
    return env->NewStringUTF(info);
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_ultrablabla_app_LlamaNative_isLoaded(JNIEnv *, jclass) {
    return JNI_FALSE;
}
