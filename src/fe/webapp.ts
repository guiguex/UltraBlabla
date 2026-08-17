/**
 * UltraBlabla Live Voice Engine (Cloudflare Edge Style)
 * 1-Click Zero Friction • Fluid Adaptive VAD • Adapted for Next Gen Design
 */
import { Capacitor } from '@capacitor/core';

const IS_WEB = Capacitor.getPlatform() === 'web';

type LiveState = 'idle' | 'listening' | 'thinking' | 'speaking';

class UltraBlablaLiveApp {
    private state: LiveState = 'idle';
    private audioCtx: AudioContext | null = null;
    private micStream: MediaStream | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private currentAudioSource: AudioBufferSourceNode | null = null;
    private gainNode: GainNode | null = null;

    // VAD & Turn-Taking
    private isSpeakingVoice: boolean = false;
    private silenceTimer: number | null = null;
    private noiseFloor: number = 12;
    private speechOnsetFrames: number = 0;
    private speechStartTime: number = 0;
    private isVADActive: boolean = false;

    // DOM Elements (Next Gen Design)
    private recordBtn!: HTMLButtonElement;
    private messages!: HTMLElement;
    private status!: HTMLElement;
    private clearBtn!: HTMLButtonElement;

    constructor() {
        if (typeof window !== 'undefined') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    private init() {
        this.bindElements();
        this.setupListeners();
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
        // Advanced Web Audio API for Neural Visualization
        try {
            const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContextCls();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.connect(this.audioCtx.destination);
            console.log('[Web Next-Gen] Web Audio API prête.');
        } catch (err) {
            console.warn('[Web Next-Gen] Web Audio API non disponible:', err);
        }
    }

    private async initWebGPU() {
        // "Tech Next Genre Dernier Cri Ready 2028"
        // WebGPU / Quantum Canvas Preparation
        if ('gpu' in navigator) {
            try {
                const adapter = await (navigator as any).gpu.requestAdapter();
                const device = await adapter.requestDevice();
                console.log('[Web Next-Gen] WebGPU initialisé avec succès ! Prêt pour le Neural Canvas 2028.');
                // Here we would bind device to a GPUMap or CanvasContext
            } catch (err) {
                console.warn('[Web Next-Gen] Echec WebGPU, fallback WebGL:', err);
            }
        } else {
            console.log('[Web Next-Gen] WebGPU non supporté par ce navigateur.');
        }
    }

    private bindElements() {
        this.recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
        this.messages = document.getElementById('messages') as HTMLElement;
        this.status = document.querySelector('#status .status-text') as HTMLElement;
        this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
    }

    private setupListeners() {
        // Toggle on Main Button
        this.recordBtn?.addEventListener('click', () => this.toggleLiveSession());

        // Clear History
        this.clearBtn?.addEventListener('click', () => {
            this.stopSpeaking();
            this.clearMessages();
            this.addMessage('SYSTEM', 'Historique nettoyé. Prêt à discuter.', 'system');
            this.playChime(400, 0.08);
            if (this.state !== 'idle') this.stopLiveSession();
        });

        // Space shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && (e.target === document.body || e.target === this.recordBtn)) {
                e.preventDefault();
                this.toggleLiveSession();
            }
        });
    }

    private async toggleLiveSession() {
        if (this.state === 'speaking') {
            // Barge-in instantané
            this.stopSpeaking();
            this.startListening();
            return;
        }

        if (this.state === 'listening') {
            this.stopLiveSession();
            return;
        }

        if (this.state === 'thinking') {
            return;
        }

        // Start Live Session
        await this.startListening();
    }

    private async ensureAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.connect(this.audioCtx.destination);
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    private async startListening() {
        try {
            await this.ensureAudioContext();
            this.stopSpeaking();

            if (!this.micStream) {
                this.micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });
            }

            if (!this.analyser && this.audioCtx && this.micStream) {
                const source = this.audioCtx.createMediaStreamSource(this.micStream);
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.3;
                source.connect(this.analyser);
            }

            this.recordedChunks = [];
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            this.mediaRecorder = new MediaRecorder(this.micStream, { mimeType });
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
            };
            this.mediaRecorder.onstop = () => this.processAudio();

            this.mediaRecorder.start(100);
            this.updateUI('listening');
            this.playChime(880, 0.05);

            this.isSpeakingVoice = false;
            this.speechOnsetFrames = 0;
            this.speechStartTime = 0;
            this.startVAD();

        } catch (err: any) {
            console.error('Mic Error:', err);
            this.updateUI('idle');
            this.addMessage('SYSTEM', `Microphone inaccessible : ${err?.message || err}`, 'system');
        }
    }

    private startVAD() {
        if (this.isVADActive) return;
        this.isVADActive = true;

        const bufferLength = this.analyser?.frequencyBinCount || 256;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudioFrame = () => {
            if (!this.isVADActive || this.state !== 'listening' || !this.analyser) return;

            this.analyser.getByteFrequencyData(dataArray);

            // Énergie vocale humaine (300Hz - 3400Hz)
            let voiceSum = 0;
            const low = 3;
            const high = Math.min(42, bufferLength);

            for (let i = low; i < high; i++) {
                voiceSum += dataArray[i];
            }
            const currentVoiceEnergy = voiceSum / (high - low);

            if (!this.isSpeakingVoice) {
                // Ajustement dynamique du bruit de fond
                this.noiseFloor = (this.noiseFloor * 0.95) + (currentVoiceEnergy * 0.05);
            }

            const threshold = Math.max(14, this.noiseFloor * 1.5 + 8);
            const hasVoice = currentVoiceEnergy > threshold;

            if (hasVoice) {
                this.speechOnsetFrames++;
                if (this.speechOnsetFrames >= 3) {
                    if (!this.isSpeakingVoice) {
                        this.isSpeakingVoice = true;
                        this.speechStartTime = Date.now();
                        if (this.status) this.status.textContent = '👂 Écoute en cours...';
                    }
                    if (this.silenceTimer) {
                        window.clearTimeout(this.silenceTimer);
                        this.silenceTimer = null;
                    }
                }
            } else {
                this.speechOnsetFrames = Math.max(0, this.speechOnsetFrames - 1);
                if (this.isSpeakingVoice) {
                    const speechDuration = Date.now() - this.speechStartTime;
                    if (speechDuration >= 400 && !this.silenceTimer) {
                        // Silence détecté -> Envoi automatique de la parole
                        this.silenceTimer = window.setTimeout(() => {
                            if (this.state === 'listening') {
                                this.finalizeListening();
                            }
                        }, 750);
                    }
                }
            }

            requestAnimationFrame(checkAudioFrame);
        };

        requestAnimationFrame(checkAudioFrame);
    }

    private stopVAD() {
        this.isVADActive = false;
        if (this.silenceTimer) {
            window.clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    private finalizeListening() {
        this.stopVAD();
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.updateUI('thinking');
            this.playChime(520, 0.05);
        }
    }

    private stopLiveSession() {
        this.stopVAD();
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.stopSpeaking();
        this.updateUI('idle');
        this.playChime(350, 0.06);
    }

    private async processAudio() {
        if (this.recordedChunks.length === 0) {
            this.updateUI('idle');
            return;
        }

        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        if (audioBlob.size < 1200) {
            // Trop court, relance
            setTimeout(() => this.startListening(), 200);
            return;
        }

        try {
            const reader = new FileReader();
            const b64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve((reader.result as string).split(',')[1] || '');
            });
            reader.readAsDataURL(audioBlob);
            const audioBase64 = await b64Promise;

            const pipelineUrl = '/api/voice/pipeline';

            const response = await fetch(pipelineUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Origin': 'https://guig.dev',
                    'X-Turnstile-Token': this.turnstileToken || ''
                },
                body: JSON.stringify({
                    audio: audioBase64,
                    context: 'Tu es UltraBlabla, un assistant vocal ultra-rapide, chaleureux, concis et dynamique. Réponds en français en moins de 35 mots.',
                    voice: 'fr-female-1',
                })
            });

            if (!response.ok) {
                // Fallback direct
                await this.executeFallback(audioBase64);
                return;
            }

            const data = await response.json();

            if (data.transcript) {
                this.addMessage('VOUS', data.transcript, 'user');
            }

            if (data.response) {
                this.addMessage('ULTRABLABLA', data.response, 'ai');
            }

            if (data.audio_b64) {
                const binaryStr = atob(data.audio_b64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
                await this.playAudioBuffer(bytes.buffer);
            } else if (data.response) {
                await this.speakText(data.response);
            } else {
                this.onPlaybackFinished();
            }

        } catch (err: any) {
            console.error('Pipeline error:', err);
            this.addMessage('SYSTEM', 'Connexion en cours de rétablissement...', 'system');
            setTimeout(() => this.startListening(), 1000);
        }
    }

    private async executeFallback(audioBase64: string) {
        const asrUrl = '/api/voice/transcribe';
        const asrRes = await fetch(asrUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Origin': 'https://guig.dev',
                'X-Turnstile-Token': this.turnstileToken || ''
            },
            body: JSON.stringify({ audio: audioBase64, mime_type: 'audio/webm' })
        });
        const asrData = asrRes.ok ? await asrRes.json() : { text: '' };
        const text = asrData.text || '';

        if (!text.trim()) {
            this.onPlaybackFinished();
            return;
        }

        this.addMessage('VOUS', text, 'user');

        const chatUrl = '/api/chat';
        const chatRes = await fetch(chatUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Origin': 'https://guig.dev',
                'X-Turnstile-Token': this.turnstileToken || ''
            },
            body: JSON.stringify({
                model: '@cf/meta/llama-3.1-8b-instruct-fast',
                messages: [
                    { role: 'system', content: 'Tu es UltraBlabla. Réponds en français de façon vivante et concise en moins de 30 mots.' },
                    { role: 'user', content: text }
                ],
                max_tokens: 120,
                temperature: 0.6
            })
        });

        const chatData = await chatRes.json();
        const reply = chatData.choices?.[0]?.message?.content || chatData.response || '';
        this.addMessage('ULTRABLABLA', reply, 'ai');
        await this.speakText(reply);
    }

    private async speakText(text: string) {
        try {
            this.updateUI('speaking');
            const speakUrl = '/api/voice/speak';

            let res = await fetch(speakUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Origin': 'https://guig.dev',
                    'X-Turnstile-Token': this.turnstileToken || ''
                },
                body: JSON.stringify({ text, voice: 'fr-female-1', lang: 'fr' })
            });

            const arrayBuffer = await res.arrayBuffer();
            await this.playAudioBuffer(arrayBuffer);
        } catch (err) {
            console.error('TTS error:', err);
            this.onPlaybackFinished();
        }
    }

    private async playAudioBuffer(arrayBuffer: ArrayBuffer) {
        await this.ensureAudioContext();
        if (!this.audioCtx || !this.gainNode) return;

        try {
            this.stopSpeaking();
            this.updateUI('speaking');

            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            const source = this.audioCtx.createBufferSource();
            source.buffer = audioBuffer;

            if (this.analyser) {
                source.connect(this.analyser);
                this.analyser.connect(this.gainNode);
            } else {
                source.connect(this.gainNode);
            }

            source.onended = () => {
                this.currentAudioSource = null;
                this.onPlaybackFinished();
            };

            this.currentAudioSource = source;
            source.start(0);

        } catch (err) {
            console.error('Audio decode error:', err);
            this.onPlaybackFinished();
        }
    }

    private stopSpeaking() {
        if (this.currentAudioSource && this.audioCtx && this.gainNode) {
            try {
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
                this.gainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);
                setTimeout(() => {
                    if (this.currentAudioSource) {
                        try {
                            this.currentAudioSource.stop();
                            this.currentAudioSource.disconnect();
                        } catch { /* ignore */ }
                        this.currentAudioSource = null;
                    }
                    if (this.gainNode && this.audioCtx) {
                        this.gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
                    }
                }, 40);
            } catch {
                this.currentAudioSource = null;
            }
        }
    }

    private onPlaybackFinished() {
        // Enchaîne directement l'écoute pour conversation continue
        setTimeout(() => this.startListening(), 200);
    }

    private addMessage(speaker: string, text: string, type: 'user' | 'ai' | 'system') {
        if (!this.messages) return;
        const welcome = this.messages.querySelector('.welcome-matrix');
        if (welcome) welcome.remove();

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;
        
        // Inline styling to match Next Gen aesthetics for dynamic messages
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
        this.messages.innerHTML = `<div class="welcome-matrix"><div class="holo-card neural-welcome holo-border neural-scan"><div class="card-glow"></div><div class="quantum-field"></div><div class="quantum-interference"></div><div class="neural-header"><h2 class="matrix-title holo-text">NEURAL VOICE INTERFACE</h2><div class="quantum-line"></div></div><p class="holo-subtitle">Advanced Cloud AI • Quantum Processing</p><div class="tech-specs"><div class="spec-item vosk"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">CLOUDFLARE AI EDGE</span><span class="spec-desc">Global Latency Audio Processing</span></div><div class="spec-status active"></div></div><div class="spec-item qwen"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">Llama-3.1-8b-Instruct</span><span class="spec-desc">Quantum Language Matrix</span></div><div class="spec-status active"></div></div><div class="spec-item tts"><div class="spec-icon"><div class="icon-core"></div><div class="icon-rings"></div></div><div class="spec-details"><span class="spec-name">DEEPGRAM AURA TTS</span><span class="spec-desc">Holographic Voice Synthesis</span></div><div class="spec-status active"></div></div></div><div class="quantum-prompt"><div class="prompt-glow"></div><span>ACTIVATE NEURAL INTERFACE TO BEGIN</span></div></div></div>`;
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
                if (btnSublabel) btnSublabel.textContent = 'Tap to Stop';
                this.recordBtn?.classList.add('voice-active');
                this.recordBtn?.classList.remove('processing', 'speaking');
                break;
            case 'thinking':
                if (this.status) this.status.textContent = '🧠 Traitement...';
                if (btnLabel) btnLabel.textContent = 'THINKING';
                if (btnSublabel) btnSublabel.textContent = 'Processing...';
                this.recordBtn?.classList.add('processing');
                this.recordBtn?.classList.remove('voice-active', 'speaking');
                break;
            case 'speaking':
                if (this.status) this.status.textContent = '🎙️ IA parle... (touchez pour interrompre)';
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
        } catch { /* ignore */ }
    }
}

new UltraBlablaLiveApp();
