// UltraBlabla - Interface Vocale Dynamique Ultra Moderne 2030
// Architecture: Vosk STT + Qwen3 LLM + Google TTS (100% offline)

import { Capacitor, registerPlugin } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Interface pour le plugin Voice natif ultra dynamique
interface VoicePlugin {
    checkPermissions(): Promise<{ microphone: string; granted: boolean }>;
    init(): Promise<{ ok: boolean; vosk: boolean; llm: boolean; permissions?: boolean; permissionDenied?: boolean }>;
    startConversation(): Promise<{ started: boolean; permissionDenied?: boolean; error?: string }>;
    stopConversation(): Promise<{ stopped: boolean }>;
    pauseListening(): Promise<{ paused: boolean }>;
    resumeListening(): Promise<{ resumed: boolean }>;
    addListener(eventName: string, listenerFunc: (data: any) => void): void;
    removeAllListeners(): void;
}

// UltraBlablaAI plugin removed - VoicePlugin handles everything now

// Events du plugin Voice
interface STTResult {
    type: 'partial' | 'intermediate' | 'final';
    text: string;
}

interface AIResponse {
    userText: string;
    aiResponse: string;
    timestamp: number;
}

interface ProcessingStatus {
    status: 'processing' | 'completed' | 'error';
    userText?: string;
    error?: string;
}

// Register plugins - VoicePlugin handles everything (STT + LLM + Permissions)
const Voice = registerPlugin<VoicePlugin>('Voice');

class UltraBlablaVoiceApp {
    // États conversationnels
    private isInConversation = false;
    private isListening = false;
    private isProcessing = false;
    private isSpeaking = false;
    
    // UI Elements
    private recordBtn!: HTMLButtonElement;
    private messages!: HTMLElement;
    private status!: HTMLElement;
    private clearBtn!: HTMLButtonElement;
    
    // Plugin natif
    private voice: VoicePlugin;
    
    // Conversation
    private conversationHistory: Array<{user: string, ai: string, timestamp: number}> = [];

    constructor() {
        // Initialisation du plugin natif
        this.voice = Voice;
        
        // Attendre que le DOM soit prêt
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
            this.setupEventListeners();
            this.setupVoiceCallbacks();
            this.initializeApp();
        });
    }

    private initializeElements() {
        this.recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
        this.messages = document.getElementById('messages') as HTMLElement;
        this.status = document.getElementById('status') as HTMLElement;
        this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
    }

    private setupEventListeners() {
        // Bouton conversation dynamique
        this.recordBtn?.addEventListener('click', () => this.toggleConversation());
        
        // Clear button
        this.clearBtn?.addEventListener('click', () => this.clearMessages());
        
        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        // Interruption par toucher
        document.addEventListener('touchstart', () => {
            if (this.isSpeaking) {
                if (Capacitor.isNativePlatform()) {
                    this.voice.pauseListening();
                }
            }
        });
    }
    
    private setupVoiceCallbacks() {
        if (!Capacitor.isNativePlatform()) {
            console.warn('Plugin Voice disponible uniquement en mode natif');
            return;
        }
        
        // Configuration des événements Capacitor natifs (selon VoicePlugin.java)
        this.voice.addListener('sttResult', (data: STTResult) => {
            if (data.type === 'final') {
                this.handleSpeechResult(data.text);
            } else if (data.type === 'partial') {
                this.updateStatus(`🎧 ${data.text}`, 'listening');
            }
        });
        
        this.voice.addListener('aiResponse', (data: AIResponse) => {
            this.handleAIResponse(data);
        });
        
        this.voice.addListener('llmProcessing', (data: ProcessingStatus) => {
            this.isProcessing = data.status === 'processing';
            if (data.status === 'processing') {
                this.updateStatus('🧠 IA réfléchit...', 'processing');
            } else if (data.status === 'error') {
                this.updateStatus('❌ Erreur LLM', 'error');
            }
        });
        
        this.voice.addListener('llmError', (data: { error: string }) => {
            this.isProcessing = false;
            this.addMessage(`❌ Erreur LLM: ${data.error}`, 'system');
            this.updateConversationStatus();
        });
        
        this.voice.addListener('listeningStarted', () => {
            this.isListening = true;
            this.updateConversationStatus();
        });
        
        this.voice.addListener('listeningStopped', () => {
            this.isListening = false;
            this.updateConversationStatus();
        });
        
        this.voice.addListener('conversationStarted', () => {
            this.isInConversation = true;
            this.updateConversationStatus();
        });
        
        this.voice.addListener('conversationStopped', () => {
            this.isInConversation = false;
            this.isListening = false;
            this.isSpeaking = false;
            this.updateConversationStatus();
        });
        
        this.voice.addListener('sttError', (data: { error: string }) => {
            console.error('STT Error:', data.error);
            this.addMessage('❌ Erreur de reconnaissance vocale', 'system');
            this.updateStatus('Prêt • 100% Offline', 'online');
            
            this.isInConversation = false;
            this.recordBtn.classList.remove('conversation');
            this.recordBtn.querySelector('.btn-text')!.textContent = 'Parler';
        });
        
        this.voice.addListener('voiceError', (data: { error: string }) => {
            this.addMessage(`❌ Erreur native: ${data.error}`, 'system');
            this.isProcessing = false;
            this.updateConversationStatus();
        });
        
        // Résultats STT depuis VoicePlugin
        this.voice.addListener('sttResult', (data: STTResult) => {
            if (data.type === 'final') {
                this.handleSpeechResult(data.text);
            } else if (data.type === 'partial') {
                this.updateStatus(`🎧 ${data.text}`, 'listening');
            }
        });
        
        // Réponses IA depuis VoicePlugin
        this.voice.addListener('aiResponse', (data: AIResponse) => {
            this.handleAIResponse(data);
        });
        
        // Indicateur vocal réactif
        this.voice.addListener('voiceActivity', (data: { active: boolean; level: number }) => {
            this.updateVoiceIndicator(data.active, data.level);
        });
    }
    
    private handleSpeechResult(text: string) {
        if (text.trim()) {
            this.addMessage(text, 'user');
            this.conversationHistory.push({
                user: text,
                ai: '',
                timestamp: Date.now()
            });
        }
    }
    
    private async handleAIResponse(data: AIResponse) {
        const userText = data.userText?.trim() ?? '';
        const aiResponse = data.aiResponse?.trim() ?? '';
        
        if (userText) {
            const lastEntry = this.conversationHistory[this.conversationHistory.length - 1];
            if (!lastEntry || lastEntry.user !== userText) {
                this.addMessage(userText, 'user');
                this.conversationHistory.push({
                    user: userText,
                    ai: '',
                    timestamp: data.timestamp || Date.now()
                });
            }
        }
        
        if (aiResponse) {
            this.addMessage(aiResponse, 'ai');
            if (this.conversationHistory.length > 0) {
                this.conversationHistory[this.conversationHistory.length - 1].ai = aiResponse;
            }
            
            // Réponse vocale automatique pour conversation ultra-dynamique
            this.isSpeaking = true;
            this.updateConversationStatus();
            try {
                await this.speakResponse(aiResponse);
            } finally {
                this.isSpeaking = false;
                this.updateConversationStatus();
            }
        }
    }
    
    private updateConversationStatus() {
        let statusText = '';
        let statusClass: 'loading' | 'online' | 'error' | 'warning' | 'recording' | 'processing' | 'speaking' | 'listening' | 'active' | 'paused';
        
        if (this.isInConversation) {
            if (this.isSpeaking) {
                statusText = '🎙️ IA parle... (touchez pour interrompre)';
                statusClass = 'speaking';
            } else if (this.isListening) {
                statusText = '👂 À l\'écoute... (parlez naturellement)';
                statusClass = 'listening';
            } else if (this.isProcessing) {
                statusText = '🧠 Traitement...';
                statusClass = 'processing';
            } else {
                statusText = '💬 Conversation active';
                statusClass = 'active';
            }
        } else {
            statusText = '⏸️ Conversation en pause';
            statusClass = 'paused';
        }
        
        this.updateStatus(statusText, statusClass);
    }

    private async initializeApp() {
        this.updateStatus('Initialisation...', 'loading');
        
        if (Capacitor.isNativePlatform()) {
            await this.initializeNativePlugins();
        } else {
            this.updateStatus('Mode Web - Fonctionnalités limitées', 'warning');
            this.addMessage('⚠️ Pour toutes les fonctionnalités, utilisez l\'application Android', 'system');
        }
    }

    private async initializeNativePlugins() {
        try {
            // Vérifier et demander les permissions via VoicePlugin
            const permissionCheck = await this.voice.checkPermissions();
            this.addMessage('🎙️ Vérification permissions microphone...', 'system');
            
            // Initialiser VoicePlugin (avec demande automatique de permissions si nécessaire)
            const voiceStatus = await this.voice.init();
            if (!voiceStatus.ok) {
                if (voiceStatus.permissionDenied) {
                    this.updateStatus('Permission microphone refusée', 'error');
                    this.addMessage('❌ Permission microphone refusée - Autorisez le microphone dans les paramètres Android', 'system');
                } else {
                    this.updateStatus('Erreur initialisation audio', 'error');
                    this.addMessage('❌ Impossible d\'initialiser le moteur vocal natif', 'system');
                }
                return;
            }

            this.addMessage('✅ Moteur vocal initialisé (Vosk STT + Qwen3 LLM)', 'system');

            // Initialiser TTS
            await this.initializeTTS();
            
            this.updateStatus('Prêt • 100% Offline', 'online');
            
        } catch (error) {
            console.error('Error initializing native plugins:', error);
            this.updateStatus('Erreur d\'initialisation', 'error');
            this.addMessage('❌ Erreur lors de l\'initialisation des plugins natifs', 'system');
        }
    }

    private async initializeTTS() {
        try {
            // Vérifier si le TTS est disponible
            const voices = await TextToSpeech.getSupportedVoices();
            const frenchVoices = voices.voices.filter(v => v.lang?.startsWith('fr'));
            
            if (frenchVoices.length === 0) {
                // Ouvrir l'installation des voix Google
                await TextToSpeech.openInstall();
                this.addMessage('📥 Installez les voix françaises pour le TTS', 'system');
            }
        } catch (error) {
            console.warn('TTS initialization warning:', error);
        }
    }

    private async toggleConversation() {
        if (this.isProcessing) {
            return;
        }

        if (this.isInConversation) {
            await this.stopConversation();
        } else {
            await this.startConversation();
        }
    }

    private async startConversation() {
        if (!Capacitor.isNativePlatform() || !this.voice) {
            this.addMessage('❌ Conversation native disponible uniquement sur Android', 'system');
            return;
        }

        try {
            const result = await this.voice.startConversation();
            
            if (result.permissionDenied) {
                this.addMessage('❌ Permission microphone refusée - Activez-la dans les paramètres Android', 'system');
                return;
            }
            
            if (!result.started) {
                this.addMessage('❌ Impossible de démarrer la conversation - ' + (result.error || 'Erreur inconnue'), 'system');
                return;
            }
            
            this.isInConversation = true;
            this.recordBtn.classList.add('conversation');
            this.recordBtn.querySelector('.btn-text')!.textContent = 'Conversation Active';
            
            this.addMessage('▶️ Conversation ultra dynamique démarrée ! Parlez naturellement...', 'system');
            this.updateConversationStatus();
            
        } catch (error) {
            console.error('Erreur démarrage conversation:', error);
            this.addMessage('❌ Erreur lors du démarrage de la conversation', 'system');
        }
    }

    private async stopConversation() {
        if (!this.isInConversation || !this.voice) return;

        try {
            await this.voice.stopConversation();
            
            this.isInConversation = false;
            this.recordBtn.classList.remove('conversation');
            this.recordBtn.classList.remove('recording');
            this.recordBtn.querySelector('.btn-text')!.textContent = 'Parler';
            this.updateStatus('⏳ Traitement...', 'processing');
            
        } catch (error) {
            console.error('Error stopping recording:', error);
            this.addMessage('❌ Erreur lors de l\'arrêt de l\'enregistrement', 'system');
        }
    }

    // Plus besoin de ces méthodes - VoicePlugin gère tout automatiquement !

    private async speakResponse(text: string) {
        try {
            await TextToSpeech.speak({
                text: text,
                lang: 'fr-FR',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient'
            });
        } catch (error) {
            console.warn('TTS Error:', error);
            this.addMessage('⚠️ TTS non disponible - installez les voix françaises', 'system');
        }
    }

    private addMessage(text: string, type: 'user' | 'ai' | 'system') {
        // Supprimer le message de bienvenue s'il existe
        const welcome = this.messages.querySelector('.welcome');
        if (welcome) {
            welcome.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;
        messageEl.textContent = text;
        
        this.messages.appendChild(messageEl);
        this.messages.scrollTop = this.messages.scrollHeight;

        // Sauvegarder dans l'historique
        if (type !== 'system') {
            this.saveToHistory(text, type);
        }
    }

    private clearMessages() {
        this.messages.innerHTML = `
            <div class="welcome">
                <h2>Conversation effacée</h2>
                <p>Appuyez sur le micro pour recommencer</p>
                <div class="features">
                    <div class="feature">
                        <span class="icon">🎤</span>
                        <span>Vosk STT Français</span>
                    </div>
                    <div class="feature">
                        <span class="icon">🧠</span>
                        <span>Qwen3-0.6B Local</span>
                    </div>
                    <div class="feature">
                        <span class="icon">🔊</span>
                        <span>Google TTS Offline</span>
                    </div>
                </div>
            </div>
        `;
    }

    private updateStatus(text: string, type: 'loading' | 'online' | 'error' | 'warning' | 'recording' | 'processing' | 'speaking' | 'listening' | 'active' | 'paused') {
        this.status.textContent = text;
        this.status.className = `status ${type}`;
    }

    private saveToHistory(text: string, type: 'user' | 'ai') {
        const history = JSON.parse(localStorage.getItem('ultrablabla-history') || '[]');
        history.push({
            text,
            type,
            timestamp: Date.now()
        });
        
        // Garder seulement les 100 derniers messages
        if (history.length > 100) {
            history.shift();
        }
        
        localStorage.setItem('ultrablabla-history', JSON.stringify(history));
    }

    private updateVoiceIndicator(active: boolean, level: number) {
        if (active && level > 0.1) {
            this.recordBtn?.classList.add('voice-active');
        } else {
            this.recordBtn?.classList.remove('voice-active');
        }
    }

    private showSettings() {
        // TODO: Implémenter l'écran de paramètres
        this.addMessage('⚙️ Paramètres - À implémenter', 'system');
    }
}

// Initialiser l'app quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new UltraBlablaVoiceApp();
    console.log('🚀 UltraBlabla initialized - Native Android Voice AI');
});

