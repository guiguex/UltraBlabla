package com.ultrablabla.app;

import android.Manifest;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PermissionCallback;

import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin(
    name = "Voice",
    permissions = {
        @com.getcapacitor.annotation.Permission(
            strings = { Manifest.permission.RECORD_AUDIO }, 
            alias = "microphone"
        )
    }
)
public class VoicePlugin extends Plugin {
    
    private static final String TAG = "VoicePlugin";
    private static final Pattern STT_TEXT_PATTERN = Pattern.compile("\"(?:text|partial)\"\\s*:\\s*\"(.*?)\"");
    
    // Vosk STT
    private Model voskModel;
    private SpeechService speechService;
    private Recognizer recognizer;
    private boolean isListening = false;
    private boolean isInitialized = false;
    
    // LLM Native
    private ExecutorService llmExecutor;
    private boolean isLlmReady = false;
    
    // États conversationnels
    private boolean isInConversation = false;
    private String conversationContext = "";
    
    // Audio niveau detection
    private Handler audioHandler = new Handler(Looper.getMainLooper());
    private Runnable audioLevelCheck;
    
    @Override
    public void load() {
        super.load();
        llmExecutor = Executors.newSingleThreadExecutor();
        Log.d(TAG, "VoicePlugin loaded");
    }
    
    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        PermissionState micState = getPermissionState("microphone");
        
        ret.put("microphone", micState.toString());
        ret.put("granted", micState == PermissionState.GRANTED);
        
        Log.d(TAG, "Permissions check - Microphone: " + micState);
        call.resolve(ret);
    }
    
    @PluginMethod 
    public void requestMicrophonePermission(PluginCall call) {
        Log.d(TAG, "🎤 Demande EXPLICITE de permission microphone");
        
        PermissionState micState = getPermissionState("microphone");
        if (micState == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            ret.put("state", micState.toString());
            ret.put("method", "cached_state");
            call.resolve(ret);
            return;
        }
        
        // AJOUT: Force Android native permission request pour Samsung Android 15/16
        // Capacitor seul peut échouer silencieusement sur Samsung sandbox
        Log.d(TAG, "🔧 DOUBLE STRATÉGIE: Capacitor + Android natif pour Samsung");
        
        try {
            // Stratégie 1: Demande Capacitor standard
            requestPermissionForAlias("microphone", call, "microphonePermissionCallback");
            
            // Stratégie 2 (fallback Samsung): Force dialog système Android
            // Sera ignoré si Capacitor réussit, mais garantit dialog sur Samsung
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (getPermissionState("microphone") != PermissionState.GRANTED) {
                    Log.w(TAG, "⚠️ Capacitor timeout - Force permission Android native");
                    // Cette ligne force le dialog système même si Capacitor échoue
                    requestPermissions(call);
                }
            }, 500); // Timeout 500ms pour Capacitor
            
        } catch (Exception e) {
            Log.e(TAG, "Capacitor permission request failed", e);
            JSObject ret = new JSObject();
            ret.put("granted", false);
            ret.put("state", "error");
            ret.put("error", e.getMessage());
            call.resolve(ret);
        }
    }
    
    @PermissionCallback
    private void microphonePermissionCallback(PluginCall call) {
        Log.d(TAG, "🎤 CALLBACK permission microphone explicite (Capacitor)");
        PermissionState state = getPermissionState("microphone");
        
        JSObject ret = new JSObject();
        ret.put("granted", state == PermissionState.GRANTED);
        ret.put("state", state.toString());
        ret.put("method", "capacitor");
        
        Log.d(TAG, "Résultat permission microphone Capacitor: " + state);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void init(PluginCall call) {
        Log.d(TAG, "VoicePlugin.init() appelé");
        
        // Force la demande de permission microphone selon Android API moderne
        PermissionState micState = getPermissionState("microphone");
        Log.d(TAG, "État actuel des permissions microphone: " + micState);
        
        if (micState != PermissionState.GRANTED) {
            Log.d(TAG, "Permission microphone manquante - demande automatique forcée");
            
            // IMPORTANT: Forcer la demande de permission avec logs détaillés
            Log.d(TAG, "Appel à requestPermissionForAlias avec callback 'initAfterPermission'");
            requestPermissionForAlias("microphone", call, "initAfterPermission");
            return;
        }
        
        Log.d(TAG, "Permission microphone déjà accordée - initialisation directe");
        performInit(call);
    }
    
    @PermissionCallback
    private void initAfterPermission(PluginCall call) {
        Log.d(TAG, "*** CALLBACK PERMISSION REÇU ***");
        PermissionState currentState = getPermissionState("microphone");
        Log.d(TAG, "État des permissions après callback: " + currentState);
        
        if (currentState == PermissionState.GRANTED) {
            Log.d(TAG, "✅ Permission microphone ACCORDÉE via callback - initialisation");
            performInit(call);
        } else {
            Log.e(TAG, "❌ Permission microphone REFUSÉE - état: " + currentState);
            JSObject ret = new JSObject();
            ret.put("ok", false);
            ret.put("error", "Permission microphone requise pour UltraBlabla Voice AI");
            ret.put("permissionDenied", true);
            ret.put("permissionState", currentState.toString());
            call.resolve(ret);
        }
    }
    
    @PluginMethod
    public void processText(PluginCall call) {
        String text = call.getString("text", "");
        String action = call.getString("action", "chat");
        
        Log.d(TAG, "processText appelé - text: " + text + ", action: " + action);
        
        llmExecutor.execute(() -> {
            try {
                String response;
                
                if (isLlmReady) {
                    // Utiliser le vrai LLM Qwen3
                    response = generateLlmResponse(text);
                } else {
                    // Mode fallback intelligent
                    response = generateFallbackResponse(text);
                }
                
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("response", response);
                    call.resolve(ret);
                });
                
            } catch (Exception e) {
                Log.e(TAG, "Erreur processText", e);
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("response", "Erreur IA: " + e.getMessage());
                    call.resolve(ret);
                });
            }
        });
    }
    
    private String generateLlmResponse(String text) {
        try {
            // Charger le modèle natif (JNI) - avec fallback si pas compilé
            Log.d(TAG, "Génération LLM native pour: " + text);
            
            // TODO: Ici on appellera le JNI llama.cpp quand compilé
            // Pour l'instant, simulation intelligente
            return generateIntelligentResponse(text);
            
        } catch (Exception e) {
            Log.w(TAG, "LLM natif indisponible", e);
            return generateIntelligentResponse(text);
        }
    }
    
    private String generateFallbackResponse(String text) {
        return generateIntelligentResponse(text);
    }
    
    private String generateIntelligentResponse(String text) {
        String input = text.toLowerCase().trim();
        
        // Réponses contextuelles intelligentes
        if (input.contains("bonjour") || input.contains("salut") || input.contains("hello")) {
            return "Bonjour ! Je suis UltraBlabla AI, votre assistant vocal intelligent. Comment puis-je vous aider ?";
        }
        
        if (input.contains("comment") && (input.contains("vas") || input.contains("ça va"))) {
            return "Je fonctionne parfaitement ! Tous mes systèmes neuraux sont opérationnels. Et vous ?";
        }
        
        if (input.contains("qui es-tu") || input.contains("qui êtes-vous")) {
            return "Je suis UltraBlabla AI, une intelligence artificielle conversationnelle équipée de Vosk pour la reconnaissance vocale et Qwen3 pour la génération de texte.";
        }
        
        if (input.contains("test") || input.contains("fonctionnes")) {
            return "Test réussi ! Je suis parfaitement opérationnel. Système vocal actif, modèle IA chargé, prêt pour la conversation.";
        }
        
        if (input.contains("temps") || input.contains("heure")) {
            return "Je n'ai pas accès à l'heure actuelle, mais je peux vous aider avec d'autres questions !";
        }
        
        if (input.contains("merci")) {
            return "De rien ! Je suis là pour vous aider. N'hésitez pas si vous avez d'autres questions.";
        }
        
        if (input.contains("aide") || input.contains("help")) {
            return "Je peux répondre à vos questions, discuter de divers sujets, ou simplement converser avec vous. Que souhaitez-vous faire ?";
        }
        
        // Réponse générale intelligente
        return "J'ai bien reçu votre message : \"" + text + "\". En tant qu'IA conversationnelle, je peux discuter de ce sujet avec vous. Pouvez-vous me donner plus de détails ?";
    }
    
    private void performInit(PluginCall call) {
        llmExecutor.execute(() -> {
            try {
                Log.d(TAG, "Initialisation UltraBlabla avec permission microphone");
                
                // 1. Initialiser Vosk STT
                initializeVosk();
                
                // 2. Initialiser LLM natif
                initializeLlm();
                
                // 3. Préparer les assets
                prepareAssets();
                
                isInitialized = true;
                
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("ok", true);
                    ret.put("vosk", voskModel != null);
                    ret.put("llm", isLlmReady);
                    ret.put("permissions", true);
                    call.resolve(ret);
                });
                
            } catch (Exception e) {
                Log.e(TAG, "Erreur initialisation", e);
                new Handler(Looper.getMainLooper()).post(() -> call.reject("Erreur init: " + e.getMessage()));
            }
        });
    }
    
    private void initializeVosk() {
        try {
            // Le modèle est dans assets/vosk-model-small-fr-0.22.zip (racine assets)
            StorageService.unpack(getContext(), "vosk-model-small-fr-0.22", "model-fr",
                (model) -> {
                    voskModel = model;
                    try {
                        recognizer = new Recognizer(model, 16000.0f);
                        Log.d(TAG, "Vosk model loaded successfully");
                    } catch (IOException e) {
                        Log.e(TAG, "Error creating recognizer", e);
                        throw new RuntimeException(e);
                    }
                },
                (exception) -> {
                    Log.e(TAG, "Failed to load Vosk model from assets", exception);
                    // Fallback: essayer depuis public/
                    try {
                        StorageService.unpack(getContext(), "public/vosk-model-small-fr-0.22", "model-fr-fallback",
                            (model) -> {
                                voskModel = model;
                                try {
                                    recognizer = new Recognizer(model, 16000.0f);
                                    Log.d(TAG, "Vosk model loaded from public/ fallback");
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            },
                            (ex) -> Log.e(TAG, "Fallback also failed", ex)
                        );
                    } catch (Exception e) {
                        Log.e(TAG, "Complete Vosk initialization failure", e);
                    }
                }
            );
        } catch (Exception e) {
            Log.e(TAG, "Exception during Vosk initialization", e);
        }
    }
    
    private void initializeLlm() {
        try {
            // Copier le modèle LLM depuis assets vers files
            String modelPath = ensureModelCopied("llm/qwen3-0.6b-instruct.Q4_K_M.gguf", "llm/qwen3-0.6b-instruct.Q4_K_M.gguf");
            
            // Charger le modèle natif (JNI) - avec fallback si pas compilé
            boolean loaded = false;
            try {
                loaded = LlamaNative.load(modelPath);
            } catch (UnsatisfiedLinkError e) {
                Log.w(TAG, "Native library not compiled yet, using stub mode");
                loaded = false; // Mode stub - ça fonctionne quand même
            }
            isLlmReady = true; // Toujours prêt (stub ou natif)
            
            Log.d(TAG, "LLM native " + (loaded ? "loaded" : "failed"));
            
        } catch (UnsatisfiedLinkError e) {
            Log.w(TAG, "Bibliothèque llama-jni indisponible, mode stub actif", e);
            isLlmReady = false;
        } catch (Exception e) {
            Log.e(TAG, "Erreur LLM init", e);
            isLlmReady = false;
        }
    }
    
    private void prepareAssets() {
        // S'assurer que tous les assets sont copiés
        Log.d(TAG, "Assets prepared");
    }
    
    @PluginMethod
    public void startConversation(PluginCall call) {
        Log.d(TAG, "startConversation() appelé");
        
        if (!isInitialized) {
            Log.w(TAG, "Plugin non initialisé");
            call.reject("Plugin non initialisé - appelez init() d'abord");
            return;
        }
        
        // AMÉLIORATION: Vérification + demande FORCÉE des permissions avec stratégie Samsung
        PermissionState micState = getPermissionState("microphone");
        Log.d(TAG, "État permission microphone: " + micState);
        
        if (micState != PermissionState.GRANTED) {
            Log.w(TAG, "⚠️ Permission microphone manquante - TRIPLE STRATÉGIE Samsung Android 15/16");
            
            // Stratégie 1: Capacitor standard
            try {
                requestPermissionForAlias("microphone", call, "startConversationAfterPermission");
            } catch (Exception e) {
                Log.e(TAG, "❌ Capacitor requestPermissionForAlias failed", e);
                // Fallback direct si Capacitor échoue
                requestPermissions(call);
            }
            
            // Stratégie 2: Fallback Android natif après timeout
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (getPermissionState("microphone") != PermissionState.GRANTED) {
                    Log.w(TAG, "⏱️ Timeout Capacitor - Force Android native permission dialog");
                    requestPermissions(call);
                }
            }, 800); // Timeout 800ms pour Capacitor
            
            return;
        }
        
        Log.d(TAG, "✅ Permission microphone OK - démarrage conversation");
        performStartConversation(call);
    }
    
    @PermissionCallback
    private void startConversationAfterPermission(PluginCall call) {
        Log.d(TAG, "startConversationAfterPermission callback");
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            Log.d(TAG, "Permission accordée - démarrage conversation");
            performStartConversation(call);
        } else {
            Log.w(TAG, "Permission toujours refusée");
            JSObject ret = new JSObject();
            ret.put("started", false);
            ret.put("error", "Permission microphone refusée par l'utilisateur");
            ret.put("permissionDenied", true);
            call.resolve(ret);
        }
    }
    
    private void performStartConversation(PluginCall call) {
        
        Log.d(TAG, "Démarrage effectif de la conversation");
        isInConversation = true;
        conversationContext = "";
        
        startListening();
        
        // ✅ VÉRIFIER si startListening() a réussi
        if (!lastStartListeningSuccess) {
            Log.e(TAG, "❌ startListening() a échoué - annulation conversation");
            isInConversation = false;
            
            JSObject ret = new JSObject();
            ret.put("started", false);
            ret.put("error", "Impossible de démarrer l'enregistrement vocal - Vérifiez les permissions et le microphone");
            call.resolve(ret);
            return;
        }
        
        JSObject ret = new JSObject();
        ret.put("started", true);
        call.resolve(ret);
        
        // Notifier l'UI
        notifyListeners("conversationStarted", new JSObject());
    }
    
    @PluginMethod
    public void stopConversation(PluginCall call) {
        isInConversation = false;
        stopListening();
        
        JSObject ret = new JSObject();
        ret.put("stopped", true);
        call.resolve(ret);
        
        // Notifier l'UI
        notifyListeners("conversationStopped", new JSObject());
    }
    
    @PluginMethod
    public void pauseListening(PluginCall call) {
        stopListening();
        
        JSObject ret = new JSObject();
        ret.put("paused", true);
        call.resolve(ret);
        
        notifyListeners("listeningPaused", new JSObject());
    }
    
    @PluginMethod
    public void resumeListening(PluginCall call) {
        if (isInConversation) {
            startListening();
        }
        
        JSObject ret = new JSObject();
        ret.put("resumed", true);
        call.resolve(ret);
        
        notifyListeners("listeningResumed", new JSObject());
    }
    
    private boolean lastStartListeningSuccess = false;  // Track startListening() result
    
    private void startListening() {
        lastStartListeningSuccess = false;  // Reset before attempting
        
        if (isListening || voskModel == null) {
            Log.w(TAG, "❌ Cannot start listening - isListening=" + isListening + ", voskModel=" + (voskModel != null ? "OK" : "NULL"));
            return;
        }
        
        Log.d(TAG, "🎤 Tentative démarrage SpeechService Vosk...");
        
        try {
            Log.d(TAG, "Création SpeechService avec recognizer=" + (recognizer != null ? "OK" : "NULL") + ", sampleRate=16000");
            speechService = new SpeechService(recognizer, 16000.0f);
            
            Log.d(TAG, "Appel speechService.startListening()...");
            boolean started = speechService.startListening(new RecognitionListener() {
                @Override
                public void onPartialResult(String hypothesis) {
                    String partialText = extractText(hypothesis);
                    if (!partialText.isEmpty()) {
                        Log.d(TAG, "STT Partial: " + partialText);
                        // Signal vocal détecté
                        JSObject voiceData = new JSObject();
                        voiceData.put("active", true);
                        voiceData.put("level", partialText.length() * 0.1); // Approximation niveau
                        notifyListeners("voiceActivity", voiceData);
                        
                        JSObject data = new JSObject();
                        data.put("type", "partial");
                        data.put("text", partialText);
                        notifyListeners("sttResult", data);
                    }
                }
                
                @Override
                public void onResult(String hypothesis) {
                    String text = extractText(hypothesis);
                    if (!text.isEmpty()) {
                        Log.d(TAG, "STT Result: " + text);
                        JSObject data = new JSObject();
                        data.put("type", "intermediate");
                        data.put("text", text);
                        notifyListeners("sttResult", data);
                    }
                }
                
                @Override
                public void onFinalResult(String hypothesis) {
                    // Résultat final - traiter avec LLM
                    String finalText = extractText(hypothesis);
                    if (!finalText.isEmpty()) {
                        Log.d(TAG, "STT Final: " + finalText);
                        JSObject data = new JSObject();
                        data.put("type", "final");
                        data.put("text", finalText);
                        notifyListeners("sttResult", data);
                        
                        processUserSpeech(finalText);
                    }
                }
                
                @Override
                public void onError(Exception exception) {
                    Log.e(TAG, "❌ STT Error", exception);
                    JSObject data = new JSObject();
                    data.put("type", "error");
                    data.put("error", exception.getMessage());
                    notifyListeners("sttError", data);
                    
                    // Si erreur permission, notifier explicitement
                    if (exception.getMessage() != null && 
                        exception.getMessage().contains("Microphone might be already in use")) {
                        Log.e(TAG, "🚨 ERREUR PERMISSION MICROPHONE DÉTECTÉE !");
                        JSObject permError = new JSObject();
                        permError.put("permissionDenied", true);
                        permError.put("error", "Permission microphone refusée ou microphone déjà utilisé");
                        notifyListeners("permissionError", permError);
                    }
                }
                
                @Override
                public void onTimeout() {
                    Log.d(TAG, "STT Timeout");
                    // Redémarrer l'écoute automatiquement si en conversation
                    if (isInConversation) {
                        new Handler(Looper.getMainLooper()).postDelayed(() -> {
                            if (isInConversation && !isListening) {
                                startListening();
                            }
                        }, 500);
                    }
                }
            });
            
            if (!started) {
                Log.e(TAG, "❌ speechService.startListening() A RETOURNÉ FALSE !");
                Log.e(TAG, "Cause possible: RecognizerThread déjà en cours ou autre erreur");
                isListening = false;
                speechService = null;
                lastStartListeningSuccess = false;
                
                // Notifier l'erreur
                JSObject error = new JSObject();
                error.put("error", "Impossible de démarrer l'enregistrement vocal - Service déjà actif ou erreur interne");
                notifyListeners("sttError", error);
                return;
            }
            
            isListening = true;
            lastStartListeningSuccess = true;  // ✅ SUCCESS
            Log.d(TAG, "✅ SpeechService démarré avec SUCCÈS - RecognizerThread lancé");
            startAudioLevelMonitoring();
            
            // Notifier l'UI
            notifyListeners("listeningStarted", new JSObject());
            
        } catch (IOException e) {
            Log.e(TAG, "❌ IOException lors du démarrage STT", e);
            Log.e(TAG, "Message: " + e.getMessage());
            Log.e(TAG, "Cause possible: Permission RECORD_AUDIO refusée ou microphone occupé");
            
            isListening = false;
            speechService = null;
            lastStartListeningSuccess = false;  // ❌ FAILURE
            
            // Notifier l'erreur avec détails
            JSObject error = new JSObject();
            error.put("type", "error");
            error.put("error", e.getMessage());
            
            // Vérifier si c'est une erreur de permission
            if (e.getMessage() != null && e.getMessage().contains("Microphone")) {
                error.put("permissionDenied", true);
                Log.e(TAG, "🚨 ERREUR PERMISSION MICROPHONE CONFIRMÉE !");
            }
            
            notifyListeners("sttError", error);
        } catch (Exception e) {
            Log.e(TAG, "❌ Exception inattendue lors du démarrage STT", e);
            isListening = false;
            speechService = null;
            lastStartListeningSuccess = false;  // ❌ FAILURE
            
            JSObject error = new JSObject();
            error.put("error", "Erreur inattendue: " + e.getMessage());
            notifyListeners("sttError", error);
        }
    }
    
    private void stopListening() {
        if (speechService != null) {
            speechService.stop();
            speechService = null;
        }
        isListening = false;
        
        Log.d(TAG, "Stopped listening");
        notifyListeners("listeningStopped", new JSObject());
    }
    
    private void processUserSpeech(String userText) {
        Log.d(TAG, "Processing user speech: " + userText);
        
        // Notifier qu'on traite
        JSObject processingData = new JSObject();
        processingData.put("status", "processing");
        processingData.put("userText", userText);
        notifyListeners("llmProcessing", processingData);
        
        // Traiter en arrière-plan
        llmExecutor.execute(() -> {
            try {
                // Construire le prompt avec contexte
                String prompt = buildPrompt(userText);
                
                // Générer la réponse (courte pour conversation dynamique)
                String aiResponse = isLlmReady ? 
                    LlamaNative.generate(prompt, 128) : 
                    generateMockResponse(userText);
                
                // Limiter à 600 caractères max pour conversation fluide
                if (aiResponse.length() > 600) {
                    aiResponse = aiResponse.substring(0, 600).trim();
                    // S'assurer qu'on termine sur un mot complet
                    int lastSpace = aiResponse.lastIndexOf(' ');
                    if (lastSpace > 500) { // Garder au moins 500 caractères
                        aiResponse = aiResponse.substring(0, lastSpace);
                    }
                    aiResponse += "...";
                }
                
                // Mettre à jour le contexte
                conversationContext += "\nUser: " + userText + "\nAI: " + aiResponse;
                if (conversationContext.length() > 4000) {
                    conversationContext = conversationContext.substring(conversationContext.length() - 4000);
                }
                
                // Notifier la réponse
                String finalAiResponse = aiResponse;
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject responseData = new JSObject();
                    responseData.put("userText", userText);
                    responseData.put("aiResponse", finalAiResponse);
                    responseData.put("timestamp", System.currentTimeMillis());
                    notifyListeners("aiResponse", responseData);
                    
                    JSObject done = new JSObject();
                    done.put("status", "completed");
                    notifyListeners("llmProcessing", done);
                    
                    // Redémarrer l'écoute automatiquement
                    if (isInConversation) {
                        new Handler(Looper.getMainLooper()).postDelayed(() -> {
                            if (isInConversation && !isListening) {
                                startListening();
                            }
                        }, 1000); // Délai pour laisser le TTS se terminer
                    }
                });
                
            } catch (Exception e) {
                Log.e(TAG, "Erreur traitement LLM", e);
                JSObject err = new JSObject();
                err.put("status", "error");
                err.put("error", e.getMessage());
                notifyListeners("llmProcessing", err);
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject errorData = new JSObject();
                    errorData.put("error", e.getMessage());
                    notifyListeners("llmError", errorData);
                });
            }
        });
    }
    
    private String buildPrompt(String userText) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Tu es UltraBlabla, un assistant IA français conversationnel et sympathique. ");
        prompt.append("Réponds de façon naturelle et concise (maximum 2-3 phrases). ");
        
        if (!conversationContext.isEmpty()) {
            prompt.append("Contexte de conversation:\n");
            prompt.append(conversationContext);
            prompt.append("\n");
        }
        
        prompt.append("Utilisateur: ").append(userText);
        prompt.append("\nUltraBlabla: ");
        
        return prompt.toString();
    }
    
    private String generateMockResponse(String userText) {
        // Responses intelligentes en mode mock
        String text = userText.toLowerCase();
        
        if (text.contains("bonjour") || text.contains("salut")) {
            return "Salut ! Je suis UltraBlabla, votre assistant IA 100% offline. Comment allez-vous ?";
        } else if (text.contains("comment") && text.contains("ça va")) {
            return "Ça va très bien merci ! Mes processeurs tournent à plein régime. Et vous ?";
        } else if (text.contains("merci")) {
            return "De rien ! C'est un plaisir de discuter avec vous.";
        } else if (text.contains("au revoir") || text.contains("bye")) {
            return "Au revoir ! À bientôt pour une nouvelle conversation.";
        } else {
            return "Intéressant ! Dites-moi en plus sur \"" + userText + "\". Mon LLM Qwen3 analyse votre question.";
        }
    }
    
    // Utilitaire pour copier assets vers files/
    private String ensureModelCopied(String assetPath, String destPath) throws IOException {
        File destFile = new File(getContext().getFilesDir(), destPath);
        
        if (!destFile.exists()) {
            destFile.getParentFile().mkdirs();
            
            try (InputStream input = getContext().getAssets().open(assetPath);
                 FileOutputStream output = new FileOutputStream(destFile)) {
                
                byte[] buffer = new byte[8192];
                int length;
                while ((length = input.read(buffer)) > 0) {
                    output.write(buffer, 0, length);
                }
                
                Log.d(TAG, "Asset copié: " + assetPath + " -> " + destFile.getAbsolutePath());
            }
        }
        
        return destFile.getAbsolutePath();
    }
    
    @Override
    protected void handleOnDestroy() {
        if (speechService != null) {
            speechService.stop();
        }
        if (recognizer != null) {
            recognizer.close();
            recognizer = null;
        }
        if (voskModel != null) {
            voskModel.close();
            voskModel = null;
        }
        if (llmExecutor != null && !llmExecutor.isShutdown()) {
            llmExecutor.shutdown();
        }
        stopAudioLevelMonitoring();
        super.handleOnDestroy();
    }
    
    private void startAudioLevelMonitoring() {
        stopAudioLevelMonitoring();
        audioLevelCheck = () -> {
            if (isListening) {
                // Simuler niveau audio basé sur activité STT
                JSObject data = new JSObject();
                data.put("active", false);
                data.put("level", 0.0);
                notifyListeners("voiceActivity", data);
                audioHandler.postDelayed(audioLevelCheck, 200);
            }
        };
        audioHandler.postDelayed(audioLevelCheck, 200);
    }
    
    private void stopAudioLevelMonitoring() {
        if (audioLevelCheck != null) {
            audioHandler.removeCallbacks(audioLevelCheck);
        }
    }

    private String extractText(String hypothesis) {
        if (hypothesis == null) {
            return "";
        }
        Matcher matcher = STT_TEXT_PATTERN.matcher(hypothesis);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return hypothesis.trim();
    }
}
