// UltraBlabla 2027 - Ultra Modern Voice AI with WebGPU & Web Audio API
import { TextToSpeech } from '@capacitor-community/text-to-speech';

interface AudioVisualizerConfig {
    canvas: HTMLCanvasElement;
    fftSize: number;
    smoothingTimeConstant: number;
    minDecibels: number;
    maxDecibels: number;
}

class UltraAudioVisualizer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private animationId: number | null = null;
    private gradient: CanvasGradient;

    constructor(config: AudioVisualizerConfig) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.setupCanvas();
        this.createGradient();
    }

    private setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    private createGradient() {
        this.gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        this.gradient.addColorStop(0, '#00d4ff');
        this.gradient.addColorStop(0.5, '#7c3aed');
        this.gradient.addColorStop(1, '#00d4ff');
    }

    connectAudio(stream: MediaStream) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        
        source.connect(this.analyser);
        
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.startVisualization();
    }

    private startVisualization() {
        if (!this.analyser || !this.dataArray) return;

        const draw = () => {
            if (!this.analyser || !this.dataArray) return;

            this.analyser.getByteFrequencyData(this.dataArray);
            
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;
            
            // Clear canvas with dark background
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, width, height);
            
            const barWidth = width / this.dataArray.length * 2.5;
            let x = 0;
            
            // Draw frequency bars
            for (let i = 0; i < this.dataArray.length; i++) {
                const barHeight = (this.dataArray[i] / 255) * height * 0.8;
                
                // Gradient bars
                this.ctx.fillStyle = this.gradient;
                this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
                
                // Glow effect
                this.ctx.shadowColor = '#00d4ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
                this.ctx.shadowBlur = 0;
                
                x += barWidth;
            }
            
            // Draw wave form overlay
            this.analyser.getByteTimeDomainData(this.dataArray);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#7c3aed';
            this.ctx.beginPath();
            
            const sliceWidth = width / this.dataArray.length;
            x = 0;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                const v = this.dataArray[i] / 128.0;
                const y = (v * height) / 2;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            this.ctx.stroke();
            
            this.animationId = requestAnimationFrame(draw);
        };
        
        draw();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear canvas
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, width, height);
    }
}

class UltraBlabla2027 {
    private isRecording = false;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private visualizer: UltraAudioVisualizer | null = null;
    private currentView = 'chat';
    
    // UI Elements
    private recordButton: HTMLButtonElement;
    private conversationView: HTMLElement;
    private audioVisualizerCanvas: HTMLCanvasElement;
    private connectionDot: HTMLElement;
    private connectionText: HTMLElement;
    private frequencyText: HTMLElement;
    private volumeText: HTMLElement;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeVisualizer();
        this.checkConnections();
    }

    private initializeElements() {
        this.recordButton = document.getElementById('record-button') as HTMLButtonElement;
        this.conversationView = document.getElementById('conversation-view') as HTMLElement;
        this.audioVisualizerCanvas = document.getElementById('audio-visualizer') as HTMLCanvasElement;
        this.connectionDot = document.getElementById('connection-dot') as HTMLElement;
        this.connectionText = document.getElementById('connection-text') as HTMLElement;
        this.frequencyText = document.getElementById('frequency-text') as HTMLElement;
        this.volumeText = document.getElementById('volume-text') as HTMLElement;
    }

    private setupEventListeners() {
        // Record button
        this.recordButton?.addEventListener('click', () => this.toggleRecording());
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const view = target.dataset.view;
                if (view) this.switchView(view);
            });
        });
        
        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        sidebarToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
        
        // Control buttons
        document.getElementById('stop-button')?.addEventListener('click', () => this.stopRecording());
        document.getElementById('clear-button')?.addEventListener('click', () => this.clearConversation());
        document.getElementById('settings-button')?.addEventListener('click', () => this.switchView('settings'));
        
        // Resize handler for visualizer
        window.addEventListener('resize', () => {
            if (this.visualizer) {
                this.visualizer['setupCanvas']();
            }
        });
    }

    private initializeVisualizer() {
        if (this.audioVisualizerCanvas) {
            this.visualizer = new UltraAudioVisualizer({
                canvas: this.audioVisualizerCanvas,
                fftSize: 512,
                smoothingTimeConstant: 0.8,
                minDecibels: -90,
                maxDecibels: -10
            });
        }
    }

    private async checkConnections() {
        try {
            // Check UltraCoder API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'default',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1
                })
            });
            
            if (response.ok) {
                this.setConnectionStatus('online', 'AI Ready');
            } else {
                this.setConnectionStatus('warning', 'AI Limited');
            }
        } catch (error) {
            this.setConnectionStatus('error', 'AI Offline');
        }
    }

    private setConnectionStatus(status: 'online' | 'warning' | 'error', text: string) {
        this.connectionDot?.classList.remove('online', 'warning', 'error');
        this.connectionDot?.classList.add(status);
        if (this.connectionText) {
            this.connectionText.textContent = text;
        }
    }

    private switchView(viewName: string) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        targetView?.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-view="${viewName}"]`);
        activeNavItem?.classList.add('active');
        
        // Update title
        const titleMap: { [key: string]: string } = {
            'chat': 'Chat Vocal',
            'history': 'Historique',
            'visualizer': 'Visualiseur Audio',
            'settings': 'Paramètres',
            'models': 'Modèles AI',
            'performance': 'Performance'
        };
        
        const viewTitle = document.getElementById('view-title');
        if (viewTitle && titleMap[viewName]) {
            viewTitle.textContent = titleMap[viewName];
        }
        
        this.currentView = viewName;
    }

    private async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    private async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                } 
            });
            
            // Setup MediaRecorder for audio capture
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => this.handleAudioStop();
            
            // Start visualizer
            if (this.visualizer) {
                this.visualizer.connectAudio(stream);
            }
            
            this.audioChunks = [];
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            this.recordButton?.classList.add('recording');
            const recordText = this.recordButton?.querySelector('.record-text');
            if (recordText) recordText.textContent = 'Écoute...';
            
            this.addMessage('🎤 Enregistrement...', 'system');
            
        } catch (error) {
            console.error("Erreur d'accès au microphone:", error);
            this.addMessage("❌ Erreur d'accès au microphone", 'system');
        }
    }

    private stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop visualizer
            if (this.visualizer) {
                this.visualizer.stop();
            }
            
            // Update UI
            this.recordButton?.classList.remove('recording');
            const recordText = this.recordButton?.querySelector('.record-text');
            if (recordText) recordText.textContent = 'Parler';
            
            // Stop all tracks
            this.mediaRecorder.stream?.getTracks().forEach(track => track.stop());
        }
    }

    private async handleAudioStop() {
        this.addMessage("🎤 Transcription en cours...", 'system');
        
        try {
            // 1. Speech-to-Text avec Web Speech API (plus fiable que traiter le Blob)
            const transcription = await this.speechToTextWebAPI();
            this.addMessage(transcription, 'user');
            
            // 2. Chat avec UltraCoder 
            this.addMessage("🤖 Réflexion en cours...", 'system');
            const aiResponse = await this.chatWithAI(transcription);
            this.addMessage(aiResponse, 'ai');
            
            // 3. Text-to-Speech avec neuTTS + fallbacks
            await this.textToSpeech(aiResponse);
            
        } catch (error) {
            console.error('Erreur dans le pipeline AI:', error);
            this.addMessage("❌ Erreur: " + error, 'system');
        }
    }

    private async speechToTextWebAPI(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject(new Error('Web Speech API non supportée'));
                return;
            }
            
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'fr-FR';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            
            recognition.onerror = (event: any) => {
                reject(new Error(`STT Error: ${event.error}`));
            };
            
            recognition.onend = () => {
                // Auto-resolve with empty if no result after timeout
                setTimeout(() => resolve("Impossible de transcrire l'audio"), 100);
            };
            
            recognition.start();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                recognition.stop();
                resolve("Timeout de transcription");
            }, 10000);
        });
    }

    private async chatWithAI(userMessage: string): Promise<string> {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'default',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Tu es UltraBlabla, un assistant vocal français ultra-moderne de 2027. Réponds de façon concise, naturelle et avec style. Utilise des emojis occasionnellement.' 
                    },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 200,
                temperature: 0.8,
                presence_penalty: 0.6
            })
        });
        
        if (!response.ok) {
            throw new Error(`LLM Error: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.choices?.[0]?.message?.content || "Je n'ai pas pu générer de réponse.";
    }

    private async textToSpeech(text: string): Promise<void> {
        try {
            // 1. Essayer neuTTS d'abord (meilleure qualité)
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const audioBuffer = await response.arrayBuffer();
                const audioContext = new AudioContext();
                const audioData = await audioContext.decodeAudioData(audioBuffer);
                const source = audioContext.createBufferSource();
                source.buffer = audioData;
                source.connect(audioContext.destination);
                source.start();
                return; // Succès neuTTS !
            }
        } catch (error) {
            console.warn('neuTTS failed, trying Capacitor TTS:', error);
        }
        
        try {
            // 2. Fallback vers TTS natif Capacitor
            await TextToSpeech.speak({
                text: text,
                lang: 'fr-FR',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient'
            });
        } catch (error) {
            console.warn('TTS Capacitor failed, using Web Speech API fallback:', error);
            // 3. Dernier fallback vers Web Speech API
            this.webSpeechTTS(text);
        }
    }

    private webSpeechTTS(text: string) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
    }

    private addMessage(text: string, sender: 'user' | 'ai' | 'system') {
        if (!this.conversationView) return;
        
        // Remove welcome message if it exists
        const welcomeMessage = this.conversationView.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        
        this.conversationView.appendChild(messageElement);
        this.conversationView.scrollTop = this.conversationView.scrollHeight;
        
        // Add to history if not system message
        if (sender !== 'system') {
            this.addToHistory(text, sender);
        }
    }

    private addToHistory(text: string, sender: 'user' | 'ai') {
        // Store in localStorage for persistence
        const history = JSON.parse(localStorage.getItem('ultrablabla-history') || '[]');
        history.push({
            text,
            sender,
            timestamp: Date.now()
        });
        
        // Keep only last 100 messages
        if (history.length > 100) {
            history.shift();
        }
        
        localStorage.setItem('ultrablabla-history', JSON.stringify(history));
    }

    private clearConversation() {
        if (this.conversationView) {
            this.conversationView.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🎙️</div>
                    <h3>Conversation effacée</h3>
                    <p>Appuyez sur le micro pour recommencer</p>
                </div>
            `;
        }
    }

    // Public methods for external access
    public getCurrentView(): string {
        return this.currentView;
    }

    public isCurrentlyRecording(): boolean {
        return this.isRecording;
    }
}

// Initialize UltraBlabla when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UltraBlabla2027();
    console.log('🚀 UltraBlabla 2027 initialized - Ultra Modern Voice AI Ready!');
});

// Export for potential external use
declare global {
    interface Window {
        UltraBlabla2027: typeof UltraBlabla2027;
    }
}

window.UltraBlabla2027 = UltraBlabla2027;