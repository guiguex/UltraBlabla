/**
 * UltraBlabla Live Voice Engine (Gemini Live Style)
 * 1-Click Zero Friction • Fluid Adaptive VAD • Dynamic 60 FPS Morphing Orb
 */

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

    // DOM Elements
    private ambientBg!: HTMLElement;
    private statusDot!: HTMLElement;
    private orbBtn!: HTMLElement;
    private orbIcon!: HTMLElement;
    private orbLabel!: HTMLElement;
    private captionSpeaker!: HTMLElement;
    private captionText!: HTMLElement;
    private mainToggleBtn!: HTMLButtonElement;
    private btnIcon!: HTMLElement;
    private btnText!: HTMLElement;
    private clearBtn!: HTMLButtonElement;
    private canvas!: HTMLCanvasElement;
    private canvasCtx!: CanvasRenderingContext2D | null;

    constructor() {
        if (typeof window !== 'undefined') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    private init() {
        this.bindElements();
        this.setupListeners();
        this.initOrbVisualizer();
        this.updateUI('idle');
    }

    private bindElements() {
        this.ambientBg = document.getElementById('ambientBg') as HTMLElement;
        this.statusDot = document.getElementById('statusDot') as HTMLElement;
        this.orbBtn = document.getElementById('orbBtn') as HTMLElement;
        this.orbIcon = document.getElementById('orbIcon') as HTMLElement;
        this.orbLabel = document.getElementById('orbLabel') as HTMLElement;
        this.captionSpeaker = document.getElementById('captionSpeaker') as HTMLElement;
        this.captionText = document.getElementById('captionText') as HTMLElement;
        this.mainToggleBtn = document.getElementById('mainToggleBtn') as HTMLButtonElement;
        this.btnIcon = document.getElementById('btnIcon') as HTMLElement;
        this.btnText = document.getElementById('btnText') as HTMLElement;
        this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
        this.canvas = document.getElementById('orb-canvas') as HTMLCanvasElement;
        if (this.canvas) {
            this.canvasCtx = this.canvas.getContext('2d');
        }
    }

    private setupListeners() {
        // Toggle on Orb or Main Button
        this.orbBtn?.addEventListener('click', () => this.toggleLiveSession());
        this.mainToggleBtn?.addEventListener('click', () => this.toggleLiveSession());

        // Clear History
        this.clearBtn?.addEventListener('click', () => {
            this.stopSpeaking();
            this.showCaption('SYSTEM', 'Historique nettoyé. Prêt à discuter.', true);
            this.playChime(400, 0.08);
            if (this.state !== 'idle') this.stopLiveSession();
        });

        // Space shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && (e.target === document.body || e.target === this.orbBtn || e.target === this.mainToggleBtn)) {
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
            this.showCaption('SYSTEM', `Microphone inaccessible : ${err?.message || err}`, true);
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
                        this.showCaption('VOUS', 'Écoute en cours...', false);
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

            const isLocal = window.location.hostname === 'localhost';
            const pipelineUrl = isLocal ? '/api/voice/pipeline' : 'https://api.guig.dev/v1/voice/pipeline';

            const response = await fetch(pipelineUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Origin': 'https://guig.dev' },
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
                this.showCaption('VOUS', data.transcript, false);
            }

            if (data.response) {
                this.showCaption('ULTRABLABLA', data.response, false);
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
            this.showCaption('SYSTEM', 'Connexion en cours de rétablissement...', true);
            setTimeout(() => this.startListening(), 1000);
        }
    }

    private async executeFallback(audioBase64: string) {
        const isLocal = window.location.hostname === 'localhost';
        const asrUrl = isLocal ? '/api/voice/transcribe' : 'https://api.guig.dev/v1/voice/transcribe';
        const asrRes = await fetch(asrUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Origin': 'https://guig.dev' },
            body: JSON.stringify({ audio: audioBase64, mime_type: 'audio/webm' })
        });
        const asrData = asrRes.ok ? await asrRes.json() : { text: '' };
        const text = asrData.text || '';

        if (!text.trim()) {
            this.onPlaybackFinished();
            return;
        }

        this.showCaption('VOUS', text, false);

        const chatUrl = isLocal ? '/api/chat' : 'https://api.guig.dev/v1/chat/completions';
        const chatRes = await fetch(chatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Origin': 'https://guig.dev' },
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
        this.showCaption('ULTRABLABLA', reply, false);
        await this.speakText(reply);
    }

    private async speakText(text: string) {
        try {
            this.updateUI('speaking');
            const isLocal = window.location.hostname === 'localhost';
            const speakUrl = isLocal ? '/api/voice/speak' : 'https://api.guig.dev/v1/voice/speak';

            let res = await fetch(speakUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Origin': 'https://guig.dev' },
                body: JSON.stringify({ text, voice: 'fr-female-1', lang: 'fr' })
            });

            if (!res.ok && !isLocal) {
                res = await fetch('https://api.guig.dev/v1/audio/speech', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Origin': 'https://guig.dev' },
                    body: JSON.stringify({ input: text, voice: 'asteria', model: '@cf/deepgram/aura-1' })
                });
            }

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

    private showCaption(speaker: string, text: string, isPlaceholder: boolean) {
        if (!this.captionSpeaker || !this.captionText) return;
        this.captionSpeaker.textContent = speaker;
        this.captionSpeaker.className = `caption-speaker ${speaker.toLowerCase()}`;
        this.captionText.textContent = text;
        this.captionText.className = `caption-text ${isPlaceholder ? 'placeholder' : ''}`;
    }

    private updateUI(newState: LiveState) {
        this.state = newState;
        this.ambientBg?.classList.remove('listening', 'speaking');
        this.statusDot?.classList.remove('speaking', 'processing');

        if (this.mainToggleBtn) {
            this.mainToggleBtn.classList.toggle('active', newState !== 'idle');
        }

        switch (newState) {
            case 'idle':
                if (this.orbIcon) this.orbIcon.textContent = '🎙️';
                if (this.orbLabel) this.orbLabel.textContent = 'TOUCHER POUR PARLER';
                if (this.btnIcon) this.btnIcon.textContent = '⚡';
                if (this.btnText) this.btnText.textContent = 'DÉMARRER LA DISCUSSION';
                break;
            case 'listening':
                this.ambientBg?.classList.add('listening');
                if (this.orbIcon) this.orbIcon.textContent = '🎧';
                if (this.orbLabel) this.orbLabel.textContent = 'À VOUS LA PAROLE';
                if (this.btnIcon) this.btnIcon.textContent = '⏹️';
                if (this.btnText) this.btnText.textContent = 'ARRÊTER';
                break;
            case 'thinking':
                this.statusDot?.classList.add('processing');
                if (this.orbIcon) this.orbIcon.textContent = '✨';
                if (this.orbLabel) this.orbLabel.textContent = 'RÉFLEXION...';
                if (this.btnIcon) this.btnIcon.textContent = '⏹️';
                if (this.btnText) this.btnText.textContent = 'ARRÊTER';
                break;
            case 'speaking':
                this.ambientBg?.classList.add('speaking');
                this.statusDot?.classList.add('speaking');
                if (this.orbIcon) this.orbIcon.textContent = '🔊';
                if (this.orbLabel) this.orbLabel.textContent = 'IA PARLE (INTERROMPRE)';
                if (this.btnIcon) this.btnIcon.textContent = '⏹️';
                if (this.btnText) this.btnText.textContent = 'ARRÊTER';
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

    /**
     * 60 FPS Morphing Quantum Live Orb
     */
    private initOrbVisualizer() {
        if (!this.canvas || !this.canvasCtx) return;

        const resize = () => {
            const rect = this.canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        const freqData = new Uint8Array(128);
        let phase = 0;

        const render = () => {
            if (!this.canvasCtx) return;
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            phase += 0.02;

            if (this.analyser && (this.state === 'listening' || this.state === 'speaking')) {
                this.analyser.getByteFrequencyData(freqData);

                const isListening = this.state === 'listening';
                const baseRadius = 88;
                const colors = isListening
                    ? ['rgba(6, 182, 212, 0.7)', 'rgba(59, 130, 246, 0.5)', 'rgba(139, 92, 246, 0.3)']
                    : ['rgba(236, 72, 153, 0.7)', 'rgba(168, 85, 247, 0.5)', 'rgba(244, 63, 94, 0.3)'];

                this.canvasCtx.save();
                this.canvasCtx.translate(cx, cy);

                colors.forEach((col, idx) => {
                    this.canvasCtx!.beginPath();
                    for (let i = 0; i < freqData.length; i += 2) {
                        const angle = (i / freqData.length) * Math.PI * 2 + phase * (idx % 2 === 0 ? 1 : -1);
                        const v = freqData[i] / 255;
                        const r = baseRadius + (v * 45 * (idx + 1) * 0.5) + (idx * 8);
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;

                        if (i === 0) this.canvasCtx!.moveTo(x, y);
                        else this.canvasCtx!.lineTo(x, y);
                    }
                    this.canvasCtx!.closePath();
                    this.canvasCtx!.strokeStyle = col;
                    this.canvasCtx!.lineWidth = 2.5;
                    this.canvasCtx!.stroke();
                });

                this.canvasCtx.restore();
            } else if (this.state === 'thinking') {
                // Breathing glow orb
                const r = 85 + Math.sin(phase * 3) * 8;
                this.canvasCtx.save();
                this.canvasCtx.translate(cx, cy);
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(0, 0, r, 0, Math.PI * 2);
                this.canvasCtx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
                this.canvasCtx.lineWidth = 3;
                this.canvasCtx.stroke();
                this.canvasCtx.restore();
            }

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }
}

new UltraBlablaLiveApp();
