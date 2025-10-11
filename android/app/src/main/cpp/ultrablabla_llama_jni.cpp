#include <jni.h>
#include <string>
#include <vector>
#include <memory>
#include <android/log.h>
#include <mutex>
#include <algorithm>

// Implémentation JNI pour llama.cpp + Qwen3-0.6B
// Optimisée pour Android ARM64

// Uncomment when llama.cpp is integrated:
// #include "llama.h"
// #include "ggml.h"

#define TAG "LlamaNative"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

// Contexte global du modèle GGUF quantisé
struct QwenContext {
    // llama_model *model;
    // llama_context *ctx;
    // llama_sampling_context *sampling_ctx;
    std::string modelPath;
    std::string quantizationType; // Q4_K_M, Q4_0, etc.
    bool initialized;
    int n_ctx;
    int n_predict;
    int n_batch;
    int n_threads;
    
    QwenContext() : 
        initialized(false), 
        quantizationType("Q4_K_M"), // Default GGUF quantization
        n_ctx(2048),      // Optimal pour mobile
        n_predict(128),   // Réponses courtes
        n_batch(512),     // Batch size mobile-friendly
        n_threads(4)      // ARM64 threads
    {}
};

static QwenContext g_qwen_ctx;
static std::mutex g_qwen_mutex;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_ultrablabla_app_LlamaNative_load(JNIEnv *env, jclass /* clazz */, jstring modelPath) {
    std::lock_guard<std::mutex> lock(g_qwen_mutex);
    
    const char *path = env->GetStringUTFChars(modelPath, 0);
    LOGI("Loading Qwen3-0.6B model from: %s", path);
    
    // TODO: Uncomment when llama.cpp is integrated
    /*
    // Initialize llama.cpp backend
    llama_backend_init();
    
    // Optimal model params pour GGUF quantisé Q4_K_M
    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = 0;     // CPU only pour compatibilité Android
    model_params.use_mmap = true;      // Memory mapping pour performance
    model_params.use_mlock = false;    // Éviter mlock sur mobile
    
    llama_model *model = llama_load_model_from_file(path, model_params);
    if (!model) {
        LOGE("Failed to load GGUF Qwen3 model from %s", path);
        env->ReleaseStringUTFChars(modelPath, path);
        return JNI_FALSE;
    }
    
    // Context params optimisés pour mobile + quantisation GGUF
    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = g_qwen_ctx.n_ctx;           // 2048 optimal mobile
    ctx_params.n_threads = g_qwen_ctx.n_threads;   // ARM64 threads
    ctx_params.n_batch = g_qwen_ctx.n_batch;       // 512 batch mobile
    ctx_params.rope_scaling_type = LLAMA_ROPE_SCALING_TYPE_NONE;
    ctx_params.pooling_type = LLAMA_POOLING_TYPE_NONE;
    
    llama_context *ctx = llama_new_context_with_model(model, ctx_params);
    if (!ctx) {
        LOGE("Failed to create llama context for GGUF Qwen3");
        llama_free_model(model);
        env->ReleaseStringUTFChars(modelPath, path);
        return JNI_FALSE;
    }
    
    // Détecter le type de quantisation du GGUF
    const char* quant_type = llama_model_quantization_type_name(model);
    LOGI("GGUF Quantization detected: %s", quant_type);
    g_qwen_ctx.quantizationType = std::string(quant_type);
    
    g_qwen_ctx.model = model;
    g_qwen_ctx.ctx = ctx;
    g_qwen_ctx.modelPath = std::string(path);
    g_qwen_ctx.initialized = true;
    
    LOGI("Qwen3-0.6B loaded successfully with %d context", ctx_params.n_ctx);
    */
    
    // Mode stub pendant développement
    g_qwen_ctx.modelPath = std::string(path);
    g_qwen_ctx.initialized = false; // Mode stub
    
    env->ReleaseStringUTFChars(modelPath, path);
    LOGD("Qwen3 model context created (STUB mode - compile llama.cpp pour activation)");
    
    return g_qwen_ctx.initialized ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_ultrablabla_app_LlamaNative_generate(JNIEnv *env, jclass /* clazz */, jstring prompt, jint maxTokens) {
    std::lock_guard<std::mutex> lock(g_qwen_mutex);
    
    const char *input = env->GetStringUTFChars(prompt, 0);
    LOGD("Generating response for: %.100s... (maxTokens: %d)", input, maxTokens);
    
    std::string result;
    
    if (!g_qwen_ctx.initialized) {
        // Mode stub avec réponses intelligentes
        std::string prompt_str(input);
        std::transform(prompt_str.begin(), prompt_str.end(), prompt_str.begin(), ::tolower);
        
        if (prompt_str.find("bonjour") != std::string::npos || prompt_str.find("salut") != std::string::npos) {
            result = "Bonjour ! Je suis UltraBlabla, votre assistant IA conversationnel. Comment puis-je vous aider aujourd'hui ?";
        } else if (prompt_str.find("comment") != std::string::npos && prompt_str.find("ça va") != std::string::npos) {
            result = "Je vais très bien merci ! Mes circuits neuraux fonctionnent parfaitement. Et vous, comment allez-vous ?";
        } else if (prompt_str.find("merci") != std::string::npos) {
            result = "De rien ! C'est toujours un plaisir de discuter avec vous. N'hésitez pas à me poser d'autres questions.";
        } else if (prompt_str.find("au revoir") != std::string::npos || prompt_str.find("bye") != std::string::npos) {
            result = "Au revoir ! J'ai pris plaisir à notre conversation. À très bientôt !";
        } else if (prompt_str.find("qwen") != std::string::npos || prompt_str.find("ia") != std::string::npos) {
            result = "Je suis basé sur Qwen3-0.6B, un modèle de langage compact et efficace. En mode stub actuellement, mais bientôt en natif ARM64 !";
        } else {
            result = "C'est une question intéressante sur \"" + std::string(input) + "\". Mon processeur Qwen3-0.6B réfléchit à votre demande...";
        }
        
        LOGD("Generated stub response: %s", result.c_str());
    } else {
        // TODO: Vraie génération avec llama.cpp
        /*
        std::vector<llama_token> tokens_list;
        tokens_list = llama_tokenize(ctx->ctx, input, true);
        
        const int n_ctx = llama_n_ctx(ctx->ctx);
        const int n_kv_req = tokens_list.size() + maxTokens;
        
        if (n_kv_req > n_ctx) {
            LOGE("Context length exceeded: %d > %d", n_kv_req, n_ctx);
            env->ReleaseStringUTFChars(prompt, input);
            return env->NewStringUTF("Erreur: prompt trop long");
        }
        
        // Evaluate prompt
        if (llama_decode(ctx->ctx, llama_batch_get_one(tokens_list.data(), tokens_list.size(), 0, 0))) {
            LOGE("Failed to eval prompt");
            env->ReleaseStringUTFChars(prompt, input);
            return env->NewStringUTF("Erreur: échec évaluation");
        }
        
        // Generate response
        std::string response;
        for (int i = 0; i < maxTokens; ++i) {
            auto logits = llama_get_logits_ith(ctx->ctx, -1);
            auto n_vocab = llama_n_vocab(ctx->model);
            
            std::vector<llama_token_data> candidates;
            candidates.reserve(n_vocab);
            for (llama_token token_id = 0; token_id < n_vocab; token_id++) {
                candidates.emplace_back(llama_token_data{token_id, logits[token_id], 0.0f});
            }
            
            llama_token_data_array candidates_p = { candidates.data(), candidates.size(), false };
            llama_token new_token_id = llama_sample_token_greedy(ctx->ctx, &candidates_p);
            
            if (new_token_id == llama_token_eos(ctx->model)) {
                break;
            }
            
            char buf[256];
            int n = llama_token_to_piece(ctx->model, new_token_id, buf, sizeof(buf));
            if (n < 0) {
                LOGE("Failed to convert token to piece");
                break;
            }
            response += std::string(buf, n);
            
            if (llama_decode(ctx->ctx, llama_batch_get_one(&new_token_id, 1, tokens_list.size() + i, 0))) {
                LOGE("Failed to decode token");
                break;
            }
        }
        result = response;
        */
        /*
        // Vraie génération Qwen3 avec llama.cpp
        std::vector<llama_token> tokens_list;
        tokens_list = llama_tokenize(g_qwen_ctx.ctx, input, true);
        
        const int n_ctx = llama_n_ctx(g_qwen_ctx.ctx);
        const int n_kv_req = tokens_list.size() + maxTokens;
        
        if (n_kv_req > n_ctx) {
            LOGE("Context overflow: %d > %d", n_kv_req, n_ctx);
            env->ReleaseStringUTFChars(prompt, input);
            return env->NewStringUTF("Erreur: prompt trop long pour le contexte");
        }
        
        // Evaluate prompt
        llama_batch batch = llama_batch_init(512, 0, 1);
        for (size_t i = 0; i < tokens_list.size(); i++) {
            llama_batch_add(batch, tokens_list[i], i, {0}, false);
        }
        batch.logits[batch.n_tokens - 1] = true;
        
        if (llama_decode(g_qwen_ctx.ctx, batch) != 0) {
            LOGE("Failed to eval prompt");
            llama_batch_free(batch);
            env->ReleaseStringUTFChars(prompt, input);
            return env->NewStringUTF("Erreur: échec évaluation prompt");
        }
        
        // Generate response tokens
        std::string response;
        for (int i = 0; i < maxTokens; ++i) {
            auto logits = llama_get_logits_ith(g_qwen_ctx.ctx, -1);
            auto n_vocab = llama_n_vocab(g_qwen_ctx.model);
            
            // Simple greedy sampling pour mobile
            llama_token new_token_id = 0;
            float max_logit = logits[0];
            for (int j = 1; j < n_vocab; j++) {
                if (logits[j] > max_logit) {
                    max_logit = logits[j];
                    new_token_id = j;
                }
            }
            
            if (new_token_id == llama_token_eos(g_qwen_ctx.model)) {
                break;
            }
            
            // Convert token to text
            char piece[256];
            int n_piece = llama_token_to_piece(g_qwen_ctx.model, new_token_id, piece, sizeof(piece));
            if (n_piece > 0) {
                response += std::string(piece, n_piece);
            }
            
            // Prepare next iteration
            llama_batch_clear(batch);
            llama_batch_add(batch, &new_token_id, 1, tokens_list.size() + i, {0}, true);
            
            if (llama_decode(g_qwen_ctx.ctx, batch) != 0) {
                LOGE("Failed to decode token at position %d", i);
                break;
            }
        }
        
        llama_batch_free(batch);
        result = response;
        LOGI("Generated %zu characters with Qwen3-0.6B", response.length());
        */
        result = "🚧 Vraie génération Qwen3-0.6B sera activée après compilation llama.cpp !";
    }
    
    env->ReleaseStringUTFChars(prompt, input);
    return env->NewStringUTF(result.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_ultrablabla_app_LlamaNative_free(JNIEnv *env, jclass /* clazz */) {
    std::lock_guard<std::mutex> lock(g_qwen_mutex);
    
    if (g_qwen_ctx.initialized) {
        // TODO: Uncomment when llama.cpp is integrated
        /*
        llama_free(g_qwen_ctx.ctx);
        llama_free_model(g_qwen_ctx.model);
        llama_backend_free();
        */
        
        g_qwen_ctx.initialized = false;
        LOGI("Qwen3-0.6B model freed from memory");
    }
    
    LOGD("LlamaNative context freed");
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_ultrablabla_app_LlamaNative_getModelInfo(JNIEnv *env, jclass /* clazz */) {
    std::lock_guard<std::mutex> lock(g_qwen_mutex);
    
    if (!g_qwen_ctx.initialized) {
        return env->NewStringUTF("{\"status\":\"stub\",\"model\":\"Qwen3-0.6B-GGUF\",\"mode\":\"development\"}");
    }
    
    // TODO: Return real model info when llama.cpp is integrated
    /*
    int n_ctx = llama_n_ctx(g_qwen_ctx.ctx);
    int n_vocab = llama_n_vocab(g_qwen_ctx.model);
    
    std::string info = "{\"status\":\"loaded\",\"model\":\"Qwen3-0.6B-GGUF\","
                      "\"context_size\":" + std::to_string(n_ctx) + ","
                      "\"vocab_size\":" + std::to_string(n_vocab) + ","
                      "\"mode\":\"native\"}";
    return env->NewStringUTF(info.c_str());
    */
    
    return env->NewStringUTF("{\"status\":\"ready\",\"model\":\"Qwen3-0.6B-GGUF\",\"mode\":\"native_ready\"}");
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_ultrablabla_app_LlamaNative_isLoaded(JNIEnv *env, jclass /* clazz */) {
    std::lock_guard<std::mutex> lock(g_qwen_mutex);
    return g_qwen_ctx.initialized ? JNI_TRUE : JNI_FALSE;
}
