package com.ultrablabla.app;

import android.util.Log;

/**
 * Interface JNI pour llama.cpp natif
 * Charge et utilise Qwen3-0.6B en mode natif ARM64
 */
public class LlamaNative {
    private static final String TAG = "LlamaNative";
    
    static {
        try {
            System.loadLibrary("llama-jni");
            Log.d(TAG, "llama-jni native library loaded successfully");
        } catch (UnsatisfiedLinkError e) {
            Log.w(TAG, "llama-jni library not available, using fallback: " + e.getMessage());
        }
    }
    
    /**
     * Charge un modèle GGUF depuis le filesystem
     * @param modelPath Chemin absolu vers le fichier .gguf
     * @return true si chargé avec succès
     */
    public static native boolean load(String modelPath);
    
    /**
     * Génère du texte avec le modèle chargé
     * @param prompt Le prompt d'entrée
     * @param maxTokens Nombre maximum de tokens à générer
     * @return Texte généré par le modèle
     */
    public static native String generate(String prompt, int maxTokens);
    
    /**
     * Libère le modèle de la mémoire
     */
    public static native void free();
    
    /**
     * Obtient des infos sur le modèle chargé
     * @return JSON avec infos modèle
     */
    public static native String getModelInfo();
    
    /**
     * Vérifie si un modèle est chargé
     * @return true si modèle prêt
     */
    public static native boolean isLoaded();
}