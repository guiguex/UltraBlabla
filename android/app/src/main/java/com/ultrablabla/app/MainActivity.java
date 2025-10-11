package com.ultrablabla.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "UltraBlabla.MainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enregistre les plugins natifs
        registerPlugin(VoicePlugin.class);
        registerPlugin(UltraBlablaAIPlugin.class);
        
        Log.d(TAG, "✅ MainActivity initialisée - Plugins natifs enregistrés");
        Log.d(TAG, "   - VoicePlugin : STT (Vosk AudioRecord natif) + LLM (Qwen3 JNI) + TTS (Google)");
        Log.d(TAG, "   - UltraBlablaAIPlugin : Fallback LLM");
        Log.d(TAG, "   - WebView : Interface UI uniquement (pas de getUserMedia)");
    }
}

