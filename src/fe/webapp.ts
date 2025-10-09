// UltraBlabla - Interface Vocale Dynamique Ultra Moderne 2030
// Architecture: Vosk STT + Qwen3 LLM + Google TTS (100% offline)

import { Capacitor, registerPlugin } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Interface pour le plugin Voice natif ultra dynamique
interface VoicePlugin {
    init(): Promise<{ ok: boolean; vosk: boolean; llm: boolean }>;
    startConversation(): Promise<{ started: boolean }>;
    stopConversation(): Promise<{ stopped: boolean }>;
    pauseListening(): Promise<{ paused: boolean }>;
    resumeListening(): Promise<{ resumed: boolean }>;
    addListener(eventName: string, listenerFunc: (data: any) => void): void;
    removeAllListeners(): void;
}

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

// Register plugin
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
        // Initialisation du plugin native
        this.voice = (Capacitor as any).Plugins?.Voice || null;
        
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
                this.voice.pauseListening();
            }
        });
    }
    
    private setupVoiceCallbacks() {
        if (!this.voice) {
            console.warn('Plugin Voice non disponible en mode web');
            return;
        }
        
        // Configuration des événements Capacitor natifs (selon VoicePlugin.java)
        this.voice.addListener('sttResult', (data: { text: string, type: string }) => {
            if (data.type === 'final') {
                this.handleSpeechResult(data.text);
            }
        });
        
        this.voice.addListener('aiResponse', (data: { aiResponse: string }) => {
            this.handleAIResponse(data.aiResponse);
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
        
        this.voice.addListener('voiceError', (data: { error: string }) => {
            this.addMessage(`❌ Erreur native: ${data.error}`, 'system');
            this.isProcessing = false;
            this.updateConversationStatus();
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
    
    private async handleAIResponse(response: string) {
        if (response.trim()) {
            this.addMessage(response, 'ai');
            if (this.conversationHistory.length > 0) {
                this.conversationHistory[this.conversationHistory.length - 1].ai = response;
            }
            
            // Réponse vocale automatique pour conversation ultra-dynamique
            await this.speakResponse(response);
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
            // Vérifier les permissions
            const permissions = await window.UltraBlablaAI.checkPermissions();
            
            if (!permissions.granted) {
                this.updateStatus('Permissions requises', 'error');
                this.addMessage('❌ Permission microphone requise', 'system');
                return;
            }

            // Configurer les listeners pour les résultats STT
            window.UltraBlablaAI.addListener('sttResult', (data) => {
                this.handleSTTResult(data);
            });

            window.UltraBlablaAI.addListener('sttError', (data) => {
                this.handleSTTError(data);
            });

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
            await this.voice.startConversation();
            
            this.isInConversation = true;
            this.recordBtn.classList.add('conversation');
            this.recordBtn.querySelector('.btn-text')!.textContent = 'Conversation Active';
            
            this.addMessage('�️ Conversation ultra dynamique démarrée ! Parlez naturellement...', 'system');
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
            this.recordBtn.classList.remove('recording');
            this.recordBtn.querySelector('.btn-text')!.textContent = 'Parler';
            this.updateStatus('⏳ Traitement...', 'processing');
            
        } catch (error) {
            console.error('Error stopping recording:', error);
            this.addMessage('❌ Erreur lors de l\'arrêt de l\'enregistrement', 'system');
        }
    }

    private handleSTTResult(data: { text: string; success: boolean }) {
        if (!data.success || !data.text?.trim()) {
            this.addMessage('❌ Aucun texte détecté', 'system');
            this.updateStatus('Prêt • 100% Offline', 'online');
            return;
        }

        // Afficher le texte transcrit
        this.addMessage(data.text, 'user');
        
        // Générer la réponse IA
        this.generateAIResponse(data.text);
    }

    private handleSTTError(data: { error: string }) {
        console.error('STT Error:', data.error);
        this.addMessage('❌ Erreur de reconnaissance vocale', 'system');
        this.updateStatus('Prêt • 100% Offline', 'online');
        
        this.isInConversation = false;
        this.recordBtn.classList.remove('conversation');
        this.recordBtn.querySelector('.btn-text')!.textContent = 'Démarrer Conversation';
    }

    private async generateAIResponse(prompt: string) {
        this.isProcessing = true;
        this.updateStatus('🧠 IA réfléchit...', 'processing');
        
        try {
            const result = await window.UltraBlablaAI.llmGenerate({ prompt });
            
            if (result.success && result.response) {
                this.addMessage(result.response, 'ai');
                await this.speakResponse(result.response);
            } else {
                this.addMessage('❌ Impossible de générer une réponse', 'system');
            }
            
        } catch (error) {
            console.error('Error generating AI response:', error);
            this.addMessage('❌ Erreur lors de la génération de la réponse IA', 'system');
        } finally {
            this.isProcessing = false;
            this.updateStatus('Prêt • 100% Offline', 'online');
        }
    }

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

// Pour le développement web (fallback)
if (!Capacitor.isNativePlatform()) {
    // Mock du plugin pour le dev web
    window.UltraBlablaAI = {
        checkPermissions: () => Promise.resolve({ granted: true }),
        sttStart: () => Promise.resolve({ success: true }),
        sttStop: () => Promise.resolve({ success: true }),
        llmGenerate: ({ prompt }) => Promise.resolve({ 
            response: `Réponse mockée pour: "${prompt}"`, 
            success: true 
        }),
        addListener: () => {},
        removeAllListeners: () => {}
    };
}