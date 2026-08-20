/**
 * UltraBlabla Live Voice Engine (Cloudflare Edge Style)
 * 1-Click Zero Friction • Fluid Adaptive VAD • Adapted for Next Gen Design
 */
import { Capacitor } from '@capacitor/core';
import { WsAsrClient, WsVoiceClient, AudioChunkPlayer, Vad, startPcmCapture } from './voice/index';

const IS_WEB = Capacitor.getPlatform() === 'web';

type LiveState = 'idle' | 'listening' | 'thinking' | 'speaking';

class UltraBlablaLiveApp {
    private state: LiveState = 'idle';
    private audioCtx: AudioContext | null = null;

    // Ultra-fast WS voice path (Task 9, gated by __ULTRA_FAST_VOICE__ — always true as of v1.1.0)
    private wsAsr?: WsAsrClient;
    private wsVoice?: WsVoiceClient;
    private player?: AudioChunkPlayer;
    private vad?: Vad;
    private capture?: { stop(): void };
    private vadInterval?: ReturnType<typeof setInterval>;
    private lastRms = 0;
    private asrReady = false;
    private audioEndUnsub?: () => void;

    // DOM Elements (Next Gen Design)
    private recordBtn!: HTMLButtonElement;
    private messages!: HTMLElement;
    private status!: HTMLElement;
    private clearBtn!: HTMLButtonElement;
    private holoSubtitles!: HTMLElement;
    private holoSubtitlesTimeout: number | null = null;

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
        // audioCtx is used by playChime() to give audible feedback on listen/stop.
        // The ultra-fast path uses its own AudioContext (created in startListening()).
        try {
            const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContextCls();
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

    private async toggleLiveSession() {
        if (this.state === 'speaking') {
            // Barge-in instantané
            this.stopSpeaking();
            void this.startListening();
            return;
        }

        if (this.state === 'listening') {
            this.stopListening();
            return;
        }

        if (this.state === 'thinking') {
            return;
        }

        // Start Live Session
        await this.startListening();
    }

    // ----------------------------------------------------------------
    // Ultra-fast WS voice path (Task 9). The only voice path in v1.1.0.
    // ----------------------------------------------------------------

    private async startListening() {
        // Task 5 carry-forward: 48 kHz context avoids 44.1 kHz pitch shift
        // (Math.round(2.75)=3 ⇒ ~14.7 kHz effective at 48 k → wrong rate).
        const AudioContextCls = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextCls({ sampleRate: 48000 });
        if (ctx.state === 'suspended') await ctx.resume();

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
            video: false,
        });
        const source = ctx.createMediaStreamSource(stream);

        this.vad = new Vad();
        this.player = new AudioChunkPlayer(ctx);
        this.wsAsr = new WsAsrClient({ language: 'fr-CA' });
        this.wsVoice = new WsVoiceClient();
        this.asrReady = false;
        this.lastRms = 0;

        this.wsAsr.on('ready',   () => { this.asrReady = true; });
        this.wsAsr.on('partial', (msg) => this.streamHoloSubtitle(msg.text, 2000));
        this.wsAsr.on('error',   (msg) => this.showError(`ASR: ${msg.message}`));
        this.wsVoice.on('audio', (msg) => {
            this.updateUI('speaking');
            this.player?.scheduleChunk(msg.data).catch(console.error);
        });
        this.wsVoice.on('done',  (msg) => console.info('voice_ttfa:', msg.ttfa_ms));
        this.wsVoice.on('error', (msg) => this.showError(`TTS: ${msg.message}`));

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
    }

    private async finishUtterance() {
        this.capture?.stop();
        // Task 6 carry-forward: only call stop() once 'ready' has fired,
        // otherwise ws.send('stop') throws InvalidStateError (CONNECTING).
        if (!this.asrReady || !this.wsAsr) {
            this.wsAsr?.close();
            return;
        }
        const text = await this.wsAsr.stop();
        // Task 6 carry-forward: pair every wsAsr.start() with wsAsr.close().
        this.wsAsr.close();
        if (text.trim().length === 0) {
            this.restartListening();
            return;
        }
        this.streamHoloSubtitle(text, 2000);
        this.wsVoice?.chat(text, { voice: this.currentVoice() });
        // Review fix: reset state to 'idle' when TTS audio playback ends.
        this.audioEndUnsub?.();
        this.audioEndUnsub = this.player?.onEnd(() => {
            this.updateUI('idle');
        });
    }

    private stopListening() {
        // Stop PCM capture worklet
        this.capture?.stop();
        // Clear the VAD polling interval
        if (this.vadInterval) {
            clearInterval(this.vadInterval);
            this.vadInterval = undefined;
        }
        // Close both WS sockets (wsVoice uses abort() per the WsVoiceClient API)
        try { this.wsAsr?.close(); } catch { /* ignore */ }
        try { this.wsVoice?.abort(); } catch { /* ignore */ }
        // Stop audio player if mid-playback
        try { this.player?.stop(); } catch { /* ignore */ }
        // Drop the onEnd subscription so it can't fire after a manual stop
        this.audioEndUnsub?.();
        this.audioEndUnsub = undefined;
        this.updateUI('idle');
        this.playChime(350, 0.06);
    }

    private restartListening() {
        // Re-start the ultra-fast listening session. Used by finishUtterance() when
        // the ASR returned an empty transcript (noise / cough) — re-arm the mic so
        // the next utterance is captured without requiring a second button press.
        void this.startListening();
    }

    private currentVoice(): 'fr-female-1' { return 'fr-female-1'; }

    private showError(msg: string) {
        console.error('[voice]', msg);
        this.addMessage('SYSTEM', msg, 'system');
    }

    private stopSpeaking() {
        // Stop the ultra-fast audio player if it's mid-playback (used for barge-in).
        try { this.player?.stop(); } catch { /* ignore */ }
        this.audioEndUnsub?.();
        this.audioEndUnsub = undefined;
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

    private streamHoloSubtitle(text: string, durationEstimateMs: number) {
        if (!this.holoSubtitles) return;

        if (this.holoSubtitlesTimeout) {
            window.clearTimeout(this.holoSubtitlesTimeout);
            this.holoSubtitlesTimeout = null;
        }

        this.holoSubtitles.classList.remove('fade-out');
        this.holoSubtitles.innerHTML = '';

        const chars = text.split('');
        let i = 0;

        // Environ 15 à 30ms par caractère pour un effet fluide "Next Gen"
        const charDelay = Math.min(30, Math.max(10, durationEstimateMs / (chars.length || 1)));

        const streamInterval = setInterval(() => {
            if (i >= chars.length) {
                clearInterval(streamInterval);

                // Garde le texte affiché un court instant après avoir fini de l'écrire, puis disparaît
                this.holoSubtitlesTimeout = window.setTimeout(() => {
                    this.holoSubtitles.classList.add('fade-out');
                    setTimeout(() => {
                        if (this.holoSubtitles.classList.contains('fade-out')) {
                            this.holoSubtitles.innerHTML = '';
                        }
                    }, 2000); // Attendre la fin de la transition CSS (2s)
                }, Math.max(1500, durationEstimateMs - (chars.length * charDelay) + 500));

                return;
            }

            const span = document.createElement('span');
            span.className = 'holo-char';
            span.textContent = chars[i];
            if (chars[i] === ' ') span.innerHTML = '&nbsp;';

            this.holoSubtitles.appendChild(span);
            i++;
        }, charDelay);
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