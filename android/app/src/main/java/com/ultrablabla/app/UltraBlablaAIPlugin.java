package com.ultrablabla.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;

import android.Manifest;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

@CapacitorPlugin(
    name = "UltraBlablaAI",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "audio")
    }
)
public class UltraBlablaAIPlugin extends Plugin {
    
    private static final String TAG = "UltraBlablaAI";
    
    private Model model;
    private SpeechService speechService;
    private Recognizer recognizer;
    private boolean isListening = false;
    
    // Native llama.cpp integration (placeholder)
    // Tu ajouteras les JNI calls ici après avoir compilé llama.cpp
    
    @Override
    public void load() {
        super.load();
        Log.d(TAG, "UltraBlablaAI Plugin loaded");
        initializeVoskModel();
    }
    
    private void initializeVoskModel() {
        new Thread(() -> {
            // Décompresse le modèle Vosk si pas déjà fait
            StorageService.unpack(getContext(), "vosk-model-small-fr-0.22",
                "models/vosk-model-small-fr-0.22",
                (model) -> {
                    this.model = model;
                    Log.d(TAG, "Vosk model loaded successfully");
                },
                (exception) -> {
                    Log.e(TAG, "Failed to load Vosk model", exception);
                }
            );
        }).start();
    }
    
    @PluginMethod
    public void checkPermissions(PluginCall call) {
        PermissionState state = getPermissionState("audio");
        if (state == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            requestPermissionForAlias("audio", call, "onAudioPermissionResult");
        }
    }

    @PermissionCallback
    private void onAudioPermissionResult(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("audio") == PermissionState.GRANTED);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void sttStart(PluginCall call) {
        if (model == null) {
            call.reject("Vosk model not loaded yet");
            return;
        }
        
        if (isListening) {
            call.reject("Already listening");
            return;
        }
        
        try {
            recognizer = new Recognizer(model, 16000.0f);
            speechService = new SpeechService(recognizer, 16000.0f);
            
            speechService.startListening(new RecognitionListener() {
                @Override
                public void onPartialResult(String hypothesis) {
                    // Résultat partiel (optionnel)
                    Log.d(TAG, "Partial: " + hypothesis);
                }
                
                @Override
                public void onResult(String hypothesis) {
                    // Résultat final
                    Log.d(TAG, "Final: " + hypothesis);
                    
                    // Parse le JSON pour extraire le texte
                    try {
                        JSObject result = new JSObject();
                        result.put("text", extractTextFromHypothesis(hypothesis));
                        result.put("success", true);
                        
                        // Notifie la WebView
                        notifyListeners("sttResult", result);
                    } catch (Exception e) {
                        Log.e(TAG, "Error parsing STT result", e);
                    }
                }
                
                @Override
                public void onFinalResult(String hypothesis) {
                    onResult(hypothesis);
                    stopListening();
                }
                
                @Override
                public void onError(Exception exception) {
                    Log.e(TAG, "STT Error", exception);
                    JSObject result = new JSObject();
                    result.put("success", false);
                    result.put("error", exception.getMessage());
                    notifyListeners("sttError", result);
                    stopListening();
                }
                
                @Override
                public void onTimeout() {
                    Log.d(TAG, "STT Timeout");
                    stopListening();
                }
            });
            
            isListening = true;
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting STT", e);
            call.reject("Failed to start STT: " + e.getMessage());
        }
    }
    
    @PluginMethod 
    public void sttStop(PluginCall call) {
        stopListening();
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
    
    private void stopListening() {
        if (speechService != null) {
            speechService.stop();
            speechService = null;
        }
        isListening = false;
    }
    
    private String extractTextFromHypothesis(String hypothesis) {
        // Parse le JSON Vosk: {"text": "bonjour comment allez vous"}
        try {
            if (hypothesis.contains("\"text\"")) {
                int start = hypothesis.indexOf("\"text\"") + 8;
                int end = hypothesis.indexOf("\"", start + 1);
                if (end > start) {
                    return hypothesis.substring(start, end);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing hypothesis", e);
        }
        return "";
    }
    
    // ============= LLM Integration (llama.cpp JNI) =============
    
    @PluginMethod
    public void llmGenerate(PluginCall call) {
        String prompt = call.getString("prompt", "");
        
        if (prompt.isEmpty()) {
            call.reject("Empty prompt");
            return;
        }
        
        // TODO: Intégrer llama.cpp JNI ici
        // Pour l'instant, response mockée
        new Thread(() -> {
            try {
                // Simulate processing time
                Thread.sleep(1000);
                
                // Génération via llama.cpp JNI + Qwen3-0.6B
                String response = generateWithLlamaCpp(prompt, 100);
                
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("response", response);
                    ret.put("success", true);
                    call.resolve(ret);
                });
                
            } catch (InterruptedException e) {
                call.reject("LLM generation interrupted");
            }
        }).start();
    }
    
    private String generateWithLlamaCpp(String prompt, int maxTokens) {
        try {
            // Vérifier d'abord dans les assets, puis copier vers files si nécessaire
            File filesModel = new File(getContext().getFilesDir(), "models/qwen3-0.6b-instruct.Q4_K_M.gguf");
            
            // Copier depuis assets vers files/ si pas encore fait (première utilisation)
            if (!filesModel.exists()) {
                copyAssetToFiles("models/qwen3-0.6b-instruct.Q4_K_M.gguf", filesModel);
            }
            
            if (!filesModel.exists()) {
                return "❌ Modèle Qwen3-0.6B non trouvé dans assets/models/\nVérifiez que qwen3-0.6b-instruct.Q4_K_M.gguf est présent.";
            }
            
            // Appel JNI llama.cpp (natif ou stub selon compilation)
            try {
                if (!LlamaNative.isLoaded()) {
                    boolean ok = LlamaNative.load(filesModel.getAbsolutePath());
                    if (!ok) {
                        return "⚠️ Impossible de charger le modèle Qwen3-0.6B. Vérifiez la compilation llama.cpp native.";
                    }
                }
                
                return LlamaNative.generate(prompt, maxTokens);
                
            } catch (UnsatisfiedLinkError e) {
                return "🔧 llama.cpp JNI non compilé.\nSuivez docs/android.md pour compiler la librairie native.\n\nStub response: " + prompt;
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Erreur génération LLM", e);
            return "❌ Erreur LLM: " + e.getMessage();
        }
    }
    
    private void copyAssetToFiles(String assetPath, File destFile) {
        try {
            destFile.getParentFile().mkdirs();
            
            try (InputStream inputStream = getContext().getAssets().open(assetPath);
                 FileOutputStream outputStream = new FileOutputStream(destFile)) {
                
                byte[] buffer = new byte[8192];
                int length;
                while ((length = inputStream.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, length);
                }
                
                Log.d(TAG, "Modèle copié: " + assetPath + " -> " + destFile.getAbsolutePath());
            }
        } catch (IOException e) {
            Log.e(TAG, "Erreur copie modèle depuis assets", e);
        }
    }
    
}
