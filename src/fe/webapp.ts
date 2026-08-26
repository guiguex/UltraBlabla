/**
 * UltraBlabla Live Voice Engine (Cloudflare Edge Style)
 * 1-Click Zero Friction • Fluid Adaptive VAD • Adapted for Next Gen Design
 */
import { Capacitor } from '@capacitor/core';
import { WsAsrClient, WsVoiceClient, AudioChunkPlayer, Vad, startPcmCapture, FallbackTts } from './voice/index';
import type { VoiceId } from './voice/types';

const IS_WEB = Capacitor.getPlatform() === 'web';

type LiveState = 'idle' | 'listening' | 'thinking' | 'speaking';

const FAST_VOICE_SYSTEM_PROMPT = `Tu es UltraBlabla, une IA vocale vive, chaleureuse et naturelle.
Réponds de manière concise, directe et vivante (1 à 2 phrases courtes à l'oral, ≤ 20 mots).
Jamais de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;

class UltraBlablaLiveApp {
    private state: LiveState = 'idle';
    private audioCtx: AudioContext | null = null;

    // Ultra-fast WS voice path
    private wsAsr?: WsAsrClient;
    private wsVoice?: WsVoiceClient;
    private player?: AudioChunkPlayer;
    private vad?: Vad;
    private capture?: { stop(): void };
    private vadInterval?: ReturnType<typeof setInterval>;
    private lastRms = 0;
    private asrReady = false;
    private audioEndUnsub?: () => void;
    private isAutoConversation = true;
    private autoRestartTimer: ReturnType<typeof setTimeout> | null = null;

    // DOM Elements (Next Gen Design)
    private recordBtn!: HTMLButtonElement;
    private messages!: HTMLElement;
    private status!: HTMLElement;
    private clearBtn!: HTMLButtonElement;
    private holoSubtitles!: HTMLElement;
    private holoSubtitlesTimeout: number | null = null;

    // Text Chat Box Elements
    private chatToggleBtn: HTMLButtonElement | null = null;
    private chatboxContent: HTMLElement | null = null;
    private neuralInput: HTMLTextAreaElement | null = null;
    private neuralSendBtn: HTMLButtonElement | null = null;
    private chatStatus: HTMLElement | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    private init() {
        this.bindElements();
        this.setupListeners();
        this.setupChatbox();
        this.updateUI('idle');

        if (IS_WEB) {
            this.initNextGenWeb();
            this.initWebAudioApi();
            this.initWebGPU();
        }
    }

    private turnstileToken: string | null = null;

    private async initNextGenWeb() {
        // Enregistrement PWA Service Worker (Next-Gen Offline)
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('[Web Next-Gen] Service Worker actif.');
            } catch (err) {
                console.error('[Web Next-Gen] Erreur SW:', err);
            }
        }

        // Initialiser Turnstile
        if (typeof (window as any).turnstile !== 'undefined') {
            (window as any).turnstile.render('#turnstile-container', {
                sitekey: '0x4AAAAAAEP_Ht6yB0F4_r-k',
                callback: (token: string) => { this.turnstileToken = token; },
                'refresh-expired': 'auto'
            });
        }
    }

    private initWebAudioApi() {
        try {
            const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContextCls();
            console.log('[Web Next-Gen] Web Audio API prête.');
        } catch (err) {
            console.warn('[Web Next-Gen] Web Audio API non disponible:', err);
        }
    }

    private async initWebGPU() {
        if ('gpu' in navigator) {
            try {
                const adapter = await (navigator as any).gpu.requestAdapter();
                await adapter.requestDevice();
                console.log('[Web Next-Gen] WebGPU initialisé avec succès ! Prêt pour le Neural Canvas 2028.');
            } catch (err) {
                console.warn('[Web Next-Gen] Echec WebGPU, fallback WebGL:', err);
            }
        }
    }

    private bindElements() {
        this.recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
        this.messages = document.getElementById('messages') as HTMLElement;
        this.status = document.querySelector('#status .status-text') as HTMLElement;
        this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
        this.holoSubtitles = document.getElementById('holo-subtitles') as HTMLElement;
    }

    private setupListeners() {
        // Toggle on Main Button
        this.recordBtn?.addEventListener('click', () => this.toggleLiveSession());

        // Clear History
        this.clearBtn?.addEventListener('click', () => {
            this.clearMessages();
            this.addMessage('SYSTEM', 'Historique nettoyé. Prêt à discuter.', 'system');
            this.playChime(400, 0.08);
            if (this.state !== 'idle') this.stopListening();
        });

        // Space shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && (e.target === document.body || e.target === this.recordBtn)) {
                e.preventDefault();
                this.toggleLiveSession();
            }
        });
    }

    private setupChatbox() {
        this.chatToggleBtn = document.getElementById('chatToggleBtn') as HTMLButtonElement;
        this.chatboxContent = document.getElementById('chatboxContent') as HTMLElement;
        this.neuralInput = document.getElementById('neuralInput') as HTMLTextAreaElement;
        this.neuralSendBtn = document.getElementById('neuralSendBtn') as HTMLButtonElement;
        this.chatStatus = document.getElementById('chatStatus') as HTMLElement;

        if (this.chatStatus) {
            this.chatStatus.textContent = 'ONLINE • CLOUD AI';
            this.chatStatus.style.color = '#10b981';
        }

        this.chatToggleBtn?.addEventListener('click', () => {
            if (this.chatboxContent) {
                const isCurrentlyHidden = this.chatboxContent.style.display === 'none' || !this.chatboxContent.classList.contains('active');
                if (isCurrentlyHidden) {
                    this.chatboxContent.style.display = 'block';
                    this.chatboxContent.classList.add('active');
                } else {
                    this.chatboxContent.style.display = 'none';
                    this.chatboxContent.classList.remove('active');
                }
            }
        });

        this.neuralInput?.addEventListener('input', () => {
            const hasText = !!this.neuralInput?.value.trim();
            if (this.neuralSendBtn) this.neuralSendBtn.disabled = !hasText;
        });

        this.neuralInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendTextMessage();
            }
        });

        this.neuralSendBtn?.addEventListener('click', () => {
            this.sendTextMessage();
        });
    }

    private scheduleAutoRestart(delayMs = 260) {
        if (this.autoRestartTimer) {
            clearTimeout(this.autoRestartTimer);
            this.autoRestartTimer = null;
        }
        if (!this.isAutoConversation) return;
        this.autoRestartTimer = setTimeout(() => {
            if (this.state === 'idle' && this.isAutoConversation) {
                void this.startListening();
            }
        }, delayMs);
    }

    private async getOrCreateAudioContext(): Promise<AudioContext> {
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
            const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContextCls();
        }
        if (this.audioCtx.state === 'suspended') {
            try { await this.audioCtx.resume(); } catch {}
        }
        if (!this.player) {
            this.player = new AudioChunkPlayer(this.audioCtx);
            this.audioEndUnsub?.();
            this.audioEndUnsub = this.player.onEnd(() => {
                this.updateUI('idle');
                this.scheduleAutoRestart(260);
            });
        }
        return this.audioCtx;
    }

    private async sendTextMessage() {
        const text = this.neuralInput?.value.trim();
        if (!text) return;
        if (this.neuralInput) this.neuralInput.value = '';
        if (this.neuralSendBtn) this.neuralSendBtn.disabled = true;

        this.addMessage('VOUS', text, 'user');
        this.updateUI('thinking');

        await this.getOrCreateAudioContext();

        if (!this.wsVoice) {
            this.wsVoice = new WsVoiceClient();
            this.setupVoiceClientListeners();
        }

        this.wsVoice.chat(text, { voice: this.currentVoice(), system: FAST_VOICE_SYSTEM_PROMPT });
    }

    private setupVoiceClientListeners() {
        if (!this.wsVoice) return;

        let responseReceived = false;
        let responseText = '';

        this.wsVoice.on('ready', () => {
            responseText = '';
            responseReceived = false;
        });

        this.wsVoice.on('token', (msg) => {
            responseText += msg.content;
            this.streamHoloSubtitle(responseText, 3000);
        });

        this.wsVoice.on('audio', (msg) => {
            responseReceived = true;
            this.updateUI('speaking');
            this.player?.scheduleChunk(msg.data).catch(console.error);
        });

        this.wsVoice.on('done', (msg) => {
            console.info('voice_ttfa:', msg.ttfa_ms);
            const finalContent = msg.content || responseText;
            if (finalContent.trim()) {
                this.addMessage('GUILLAUME', finalContent, 'ai');
            }
            if (!responseReceived) {
                if (finalContent.trim()) {
                    this.updateUI('speaking');
                    FallbackTts.speak(finalContent, {
                        voice: this.currentVoice(),
                        onStart: () => this.updateUI('speaking'),
                        onEnd: () => {
                            this.updateUI('idle');
                            this.scheduleAutoRestart(260);
                        },
                        onError: () => {
                            this.updateUI('idle');
                            this.scheduleAutoRestart(400);
                        },
                    }).catch(console.error);
                } else {
                    this.updateUI('idle');
                    this.scheduleAutoRestart(200);
                }
            }
        });

        this.wsVoice.on('error', (msg) => {
            this.showError(`Voix: ${msg.message}`);
            if (responseText.trim() && !responseReceived) {
                this.addMessage('GUILLAUME', responseText, 'ai');
                this.updateUI('speaking');
                FallbackTts.speak(responseText, {
                    voice: this.currentVoice(),
                    onStart: () => this.updateUI('speaking'),
                    onEnd: () => {
                        this.updateUI('idle');
                        this.scheduleAutoRestart(260);
                    },
                    onError: () => {
                        this.updateUI('idle');
                        this.scheduleAutoRestart(400);
                    },
                }).catch(console.error);
            } else {
                this.updateUI('idle');
                this.scheduleAutoRestart(400);
            }
        });
    }

    private async toggleLiveSession() {
        if (this.state === 'speaking') {
            // Barge-in instantané: coupe la voix IA et commence immédiatement à écouter
            this.stopSpeaking();
            this.isAutoConversation = true;
            void this.startListening();
            return;
        }

        if (this.state === 'listening') {
            // Clic pendant l'écoute: met en pause le mode auto et stoppe l'écoute
            this.isAutoConversation = false;
            this.stopListening();
            return;
        }

        if (this.state === 'thinking') {
            return;
        }

        // Démarrer la conversation en mode automatique continu
        this.isAutoConversation = true;
        await this.startListening();
    }

    private async startListening() {
        if (this.autoRestartTimer) {
            clearTimeout(this.autoRestartTimer);
            this.autoRestartTimer = null;
        }

        try {
            const ctx = await this.getOrCreateAudioContext();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: false,
            });
            const source = ctx.createMediaStreamSource(stream);

            this.vad = new Vad({ minSpeechMs: 300, silenceMs: 800, rmsThreshold: 0.01, hardCapMs: 15000 });
            this.wsAsr = new WsAsrClient({ language: 'fr-CA' });
            this.wsVoice = new WsVoiceClient();
            this.asrReady = false;
            this.lastRms = 0;

            this.wsAsr.on('ready',   () => { this.asrReady = true; });
            this.wsAsr.on('partial', (msg) => this.streamHoloSubtitle(msg.text, 2000));
            this.wsAsr.on('error',   (msg) => this.showError(`ASR: ${msg.message}`));

            this.setupVoiceClientListeners();

            this.wsAsr.start();
            this.updateUI('listening');
            this.capture = await startPcmCapture({
                ctx,
                sourceNode: source,
                sampleRate: 16000,
                frameMs: 100,
                onFrame: (pcm) => this.wsAsr?.sendPcm(pcm),
                onRms:  (rms) => { this.lastRms = rms; },
            });

            // VAD-driven end of utterance (poll ~10 Hz to match onRms rate)
            this.vadInterval = setInterval(() => {
                const state = this.vad?.push(this.lastRms, performance.now());
                if (state === 'silence') {
                    this.vad?.reset();
                    if (this.vadInterval) { clearInterval(this.vadInterval); this.vadInterval = undefined; }
                    void this.finishUtterance();
                }
            }, 100);
        } catch (err: any) {
            console.error('[Microphone error]', err);
            this.showError(`Microphone indisponible: ${err?.message || 'Accès refusé'}`);
            this.updateUI('idle');
        }
    }

    private async finishUtterance() {
        this.capture?.stop();
        if (this.vadInterval) {
            clearInterval(this.vadInterval);
            this.vadInterval = undefined;
        }

        let text = '';
        if (this.wsAsr) {
            try {
                text = await this.wsAsr.stop();
            } catch (err) {
                console.error('[ASR stop error]', err);
            }
        }
        try { this.wsAsr?.close(); } catch {}
        this.wsAsr = undefined;

        if (!text || text.trim().length === 0) {
            this.updateUI('idle');
            this.scheduleAutoRestart(150);
            return;
        }

        this.addMessage('VOUS', text, 'user');
        this.updateUI('thinking');
        this.streamHoloSubtitle(text, 2000);
        this.wsVoice?.chat(text, { voice: this.currentVoice(), system: FAST_VOICE_SYSTEM_PROMPT });
    }

    private stopListening() {
        if (this.autoRestartTimer) {
            clearTimeout(this.autoRestartTimer);
            this.autoRestartTimer = null;
        }
        this.capture?.stop();
        if (this.vadInterval) {
            clearInterval(this.vadInterval);
            this.vadInterval = undefined;
        }
        try { this.wsAsr?.close(); } catch {}
        try { this.wsVoice?.abort(); } catch {}
        try { this.player?.stop(); } catch {}
        FallbackTts.stop();
        this.audioEndUnsub?.();
        this.audioEndUnsub = undefined;
        this.updateUI('idle');
        this.playChime(350, 0.06);
    }

    private currentVoice(): VoiceId { return 'guillaume'; }

    private showError(msg: string) {
        console.error('[voice]', msg);
        this.addMessage('SYSTEM', msg, 'system');
    }

    private stopSpeaking() {
        try { this.player?.stop(); } catch {}
        FallbackTts.stop();
        this.audioEndUnsub?.();
        this.audioEndUnsub = undefined;
        this.updateUI('idle');
    }

    private addMessage(speaker: string, text: string, type: 'user' | 'ai' | 'system') {
        if (!this.messages) return;
        const welcome = this.messages.querySelector('.welcome-matrix');
        if (welcome) welcome.remove();

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;

        messageEl.style.padding = '12px 16px';
        messageEl.style.margin = '10px 0';
        messageEl.style.borderRadius = '12px';
        messageEl.style.fontSize = '15px';
        messageEl.style.lineHeight = '1.5';
        messageEl.style.background = type === 'user' ? 'rgba(6, 182, 212, 0.08)' : (type === 'ai' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.05)');
        messageEl.style.border = `1px solid ${type === 'user' ? 'rgba(6, 182, 212, 0.2)' : (type === 'ai' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)')}`;
        messageEl.style.color = type === 'user' ? '#fff' : (type === 'ai' ? '#e9d5ff' : '#a1a1aa');
        messageEl.style.boxShadow = `0 4px 15px ${type === 'user' ? 'rgba(6, 182, 212, 0.05)' : (type === 'ai' ? 'rgba(139, 92, 246, 0.05)' : 'none')}`;

        messageEl.innerHTML = `<strong style="color: ${type === 'user' ? '#06b6d4' : (type === 'ai' ? '#c084fc' : '#a1a1aa')}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">${speaker}</strong> ${text}`;

        this.messages.appendChild(messageEl);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    private clearMessages() {
        if (!this.messages) return;
        this.messages.innerHTML = `<div class="welcome-matrix"><div class="holo-card neural-welcome holo-border neural-scan"><div class="card-glow"></div><div class="quantum-field"></div><div class="quantum-interference"></div><div class="neural-header"><h2 class="matrix-title holo-text">NEURAL VOICE INTERFACE</h2><div class="quantum-line"></div></div><p class="holo-subtitle">Advanced Cloud AI • Quantum Processing</p><div class="tech-specs"><div class="spec-item vosk"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">CLOUDFLARE AI EDGE</span><span class="spec-desc">Global Latency Audio Processing</span></div><div class="spec-status active"></div></div><div class="spec-item qwen"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">Kimi K2.7 / Qwen Neural</span><span class="spec-desc">Quantum Language Matrix</span></div><div class="spec-status active"></div></div><div class="spec-item tts"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">QWEN CLONED TTS + GOOGLE FALLBACK</span><span class="spec-desc">Guillaume Voice Synthesis</span></div><div class="spec-status active"></div></div></div><div class="quantum-prompt"><div class="prompt-glow"></div><span>CLIQUEZ SUR LE BOUTON POUR COMMENCER</span></div></div></div>`;
    }

    private streamHoloSubtitle(text: string, durationEstimateMs = 3000) {
        if (!this.holoSubtitles) return;

        if (this.holoSubtitlesTimeout) {
            window.clearTimeout(this.holoSubtitlesTimeout);
            this.holoSubtitlesTimeout = null;
        }

        this.holoSubtitles.classList.remove('fade-out');
        this.holoSubtitles.textContent = text;

        this.holoSubtitlesTimeout = window.setTimeout(() => {
            this.holoSubtitles.classList.add('fade-out');
            setTimeout(() => {
                if (this.holoSubtitles && this.holoSubtitles.classList.contains('fade-out')) {
                    this.holoSubtitles.innerHTML = '';
                }
            }, 1000);
        }, Math.max(2000, durationEstimateMs));
    }

    private updateUI(newState: LiveState) {
        this.state = newState;

        const btnLabel = this.recordBtn?.querySelector('.btn-label');
        const btnSublabel = this.recordBtn?.querySelector('.btn-sublabel');

        switch (newState) {
            case 'idle':
                if (this.status) this.status.textContent = 'PRÊT • 100% CLOUD AI';
                if (btnLabel) btnLabel.textContent = 'CLOUD VOICE';
                if (btnSublabel) btnSublabel.textContent = 'Tap to Activate';
                this.recordBtn?.classList.remove('voice-active', 'processing', 'speaking');
                break;
            case 'listening':
                if (this.status) this.status.textContent = '👂 À l\'écoute... (parlez naturellement)';
                if (btnLabel) btnLabel.textContent = 'LISTENING';
                if (btnSublabel) btnSublabel.textContent = 'Tap to Stop & Send';
                this.recordBtn?.classList.add('voice-active');
                this.recordBtn?.classList.remove('processing', 'speaking');
                break;
            case 'thinking':
                if (this.status) this.status.textContent = '🧠 Traitement IA...';
                if (btnLabel) btnLabel.textContent = 'THINKING';
                if (btnSublabel) btnSublabel.textContent = 'Processing...';
                this.recordBtn?.classList.add('processing');
                this.recordBtn?.classList.remove('voice-active', 'speaking');
                break;
            case 'speaking':
                if (this.status) this.status.textContent = '🎙️ Guillaume parle... (touchez pour interrompre)';
                if (btnLabel) btnLabel.textContent = 'SPEAKING';
                if (btnSublabel) btnSublabel.textContent = 'Tap to Stop';
                this.recordBtn?.classList.add('speaking');
                this.recordBtn?.classList.remove('voice-active', 'processing');
                break;
        }
    }

    private playChime(freq: number, duration: number) {
        try {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch {}
    }
}

new UltraBlablaLiveApp();