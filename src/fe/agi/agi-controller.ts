/**
 * AGI Arena 2030 - Turing Test Controller & Cyberpunk Audio Engine
 * Empirically testing the threshold of Artificial General Intelligence
 */

export interface AgiTopic {
    id: string;
    title: string;
    category: string;
    promptHint: string;
}

export interface AgiStats {
    totalTests: number;
    targetTests: number;
    deceptionCount: number;
    deceptionRate: number;
    correctCount: number;
    aiTested: number;
    humanTested: number;
    recentVerdicts: Array<{
        id: string;
        location: string;
        vote: 'human' | 'ai';
        actual: 'human' | 'ai';
        wasDeceived: boolean;
        topic: string;
        timeAgo: string;
    }>;
}

export class AgiCyberSoundEngine {
    private ctx: AudioContext | null = null;
    public sfxEnabled: boolean = true;

    constructor() {
        // Lazy initialization upon first user gesture
    }

    private initCtx() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public play(sound: 'click' | 'start' | 'listen' | 'deceived' | 'detected' | 'ping') {
        if (!this.sfxEnabled) return;
        this.initCtx();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        switch (sound) {
            case 'click': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            }
            case 'start': {
                // Cyberpunk futurist chord
                [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.03, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + idx * 0.04 + 0.35);
                });
                break;
            }
            case 'listen': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            }
            case 'detected': {
                // Harmonic triumph chord
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.04, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.4);
                });
                break;
            }
            case 'deceived': {
                // Mystery cyberpunk bass-drop
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(65, now + 0.4);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.45);
                break;
            }
            case 'ping': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }
        }
    }
}

export class AgiArenaController {
    private sound = new AgiCyberSoundEngine();
    private currentSessionId: string | null = null;
    private currentTopic: AgiTopic | null = null;
    private timerInterval: ReturnType<typeof setInterval> | null = null;
    private remainingSeconds: number = 45;
    private isListening: boolean = false;
    private isSpeaking: boolean = false;
    private speechRecognition: any = null;
    private userXP: number = 240;
    private currentMode: 'arena' | 'companion' | 'matrix' = 'arena';
    private mediaStream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private recordedAudioChunks: Blob[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                // DOM is already ready
                this.init();
            }
        }
    }

    public getCurrentMode(): 'arena' | 'companion' | 'matrix' {
        return this.currentMode;
    }

    private init() {
        this.setupNavigation();
        this.setupArenaControls();
        this.setupSpeechRecognition();
        this.setupKeyboardShortcuts();
        this.fetchGlobalStats();
        this.startNewArenaRound();
    }

    private setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

            // Escape closes modal or aborts speech/listening
            if (e.key === 'Escape') {
                const modal = document.getElementById('verdictModal');
                if (modal && modal.classList.contains('active')) {
                    this.closeVerdictModal();
                    return;
                }
                if (this.isListening) {
                    this.stopVoiceCapture();
                    return;
                }
                if (this.isSpeaking) {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                    this.isSpeaking = false;
                    return;
                }
            }

            // If typing in input, don't trigger mode or space shortcuts
            if (isTyping) return;

            // Mode switching: 1, 2, 3
            if (e.key === '1') {
                e.preventDefault();
                this.switchMode('arena');
            } else if (e.key === '2') {
                e.preventDefault();
                this.switchMode('companion');
            } else if (e.key === '3') {
                e.preventDefault();
                this.switchMode('matrix');
            }

            // In Arena mode shortcuts:
            if (this.currentMode === 'arena') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.toggleVoiceCapture();
                } else if (e.key.toLowerCase() === 'v') {
                    e.preventDefault();
                    this.openVerdictModal();
                }
            }

            // Inside modal shortcuts: H = Humain, A = IA
            const modal = document.getElementById('verdictModal');
            if (modal && modal.classList.contains('active')) {
                if (e.key.toLowerCase() === 'h') {
                    e.preventDefault();
                    this.castVote('human');
                } else if (e.key.toLowerCase() === 'a') {
                    e.preventDefault();
                    this.castVote('ai');
                }
            }
        });
    }

    private setupNavigation() {
        const tabs = document.querySelectorAll('.mode-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = (e.currentTarget as HTMLElement).dataset.mode as any;
                if (target) {
                    this.switchMode(target);
                }
            });
        });

        const sfxBtn = document.getElementById('sfxToggleBtn');
        if (sfxBtn) {
            sfxBtn.addEventListener('click', () => {
                this.sound.sfxEnabled = !this.sound.sfxEnabled;
                const icon = document.getElementById('sfxIcon');
                if (icon) icon.textContent = this.sound.sfxEnabled ? '🔊' : '🔇';
                if (this.sound.sfxEnabled) this.sound.play('click');
            });
        }

        const shareBtn = document.getElementById('shareAgiBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareAgiBenchmark();
            });
        }
    }

    public switchMode(mode: 'arena' | 'companion' | 'matrix') {
        this.currentMode = mode;
        this.sound.play('click');

        // Tabs
        document.querySelectorAll('.mode-tab').forEach(t => {
            t.classList.toggle('active', (t as HTMLElement).dataset.mode === mode);
        });

        // Views
        const arenaView = document.getElementById('arenaView');
        const companionView = document.getElementById('companionView');
        const matrixView = document.getElementById('matrixView');

        if (arenaView) arenaView.style.display = mode === 'arena' ? 'flex' : 'none';
        if (companionView) companionView.style.display = mode === 'companion' ? 'flex' : 'none';
        if (matrixView) matrixView.style.display = mode === 'matrix' ? 'flex' : 'none';

        if (mode === 'matrix') {
            this.fetchGlobalStats();
        }
    }

    private setupArenaControls() {
        // Changement de sujet
        const changeTopicBtn = document.getElementById('changeTopicBtn');
        if (changeTopicBtn) {
            changeTopicBtn.addEventListener('click', () => {
                this.sound.play('click');
                this.startNewArenaRound();
            });
        }

        // Déclencheur vocal
        const voiceBtn = document.getElementById('arenaVoiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.toggleVoiceCapture();
            });
        }

        // Déclencheur de vote
        const voteTriggerBtn = document.getElementById('arenaVoteTriggerBtn');
        if (voteTriggerBtn) {
            voteTriggerBtn.addEventListener('click', () => {
                this.sound.play('click');
                this.openVerdictModal();
            });
        }

        // Saisie texte rapide
        const sendBtn = document.getElementById('arenaTextSendBtn');
        const textField = document.getElementById('arenaTextField') as HTMLInputElement | null;

        const handleSend = () => {
            if (!textField) return;
            const text = textField.value.trim();
            if (text) {
                this.sendTurn(text);
                textField.value = '';
            }
        };

        if (sendBtn) sendBtn.addEventListener('click', handleSend);
        if (textField) {
            textField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSend();
            });
        }

        // Boutons de vote dans la modale
        const voteHumanBtn = document.getElementById('voteHumanBtn');
        if (voteHumanBtn) {
            voteHumanBtn.addEventListener('click', () => {
                this.castVote('human');
            });
        }

        const voteAiBtn = document.getElementById('voteAiBtn');
        if (voteAiBtn) {
            voteAiBtn.addEventListener('click', () => {
                this.castVote('ai');
            });
        }

        // Relancer duel
        const nextDuelBtn = document.getElementById('nextDuelBtn');
        if (nextDuelBtn) {
            nextDuelBtn.addEventListener('click', () => {
                this.closeVerdictModal();
                this.startNewArenaRound();
            });
        }

        // Fermer la modale en cliquant sur le backdrop
        const backdrop = document.getElementById('verdictModal');
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeVerdictModal();
                }
            });
        }
    }

    private setupSpeechRecognition() {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
            this.speechRecognition = new SpeechRec();
            this.speechRecognition.lang = 'fr-FR';
            this.speechRecognition.interimResults = false;
            this.speechRecognition.continuous = false;

            this.speechRecognition.onresult = (event: any) => {
                const transcript = event.results?.[0]?.[0]?.transcript;
                if (transcript) {
                    this.stopVoiceCapture();
                    this.sendTurn(transcript);
                }
            };

            this.speechRecognition.onerror = (err: any) => {
                console.warn('[SpeechRec] Erreur :', err);
                this.stopVoiceCapture();
            };

            this.speechRecognition.onend = () => {
                if (this.isListening) {
                    this.stopVoiceCapture();
                }
            };
        }
    }

    private toggleVoiceCapture() {
        if (this.isListening) {
            this.stopVoiceCapture();
        } else {
            this.startVoiceCapture();
        }
    }

    private async startMediaRecorderCapture() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            this.recordedAudioChunks = [];

            let mimeType = '';
            if (typeof MediaRecorder !== 'undefined') {
                if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
                else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
                else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
                else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            }

            const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            this.mediaRecorder = rec;

            rec.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    this.recordedAudioChunks.push(e.data);
                }
            };

            rec.onstop = async () => {
                const blob = new Blob(this.recordedAudioChunks, { type: mimeType || 'audio/webm' });
                this.recordedAudioChunks = [];
                this.cleanupMediaStream();

                if (blob.size > 800) {
                    const voiceLabel = document.getElementById('arenaVoiceLabel');
                    if (voiceLabel) voiceLabel.textContent = '🧠 Transcription ASR maison...';
                    try {
                        const formData = new FormData();
                        formData.append('file', blob, 'audio.webm');
                        formData.append('language', 'fr');
                        const res = await fetch('/v1/audio/transcriptions', {
                            method: 'POST',
                            body: formData
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data.text && data.text.trim()) {
                                this.sendTurn(data.text.trim());
                                return;
                            }
                        }
                    } catch (e) {
                        console.warn('[Arena ASR fallback error]:', e);
                    }
                    if (voiceLabel) voiceLabel.textContent = 'ACTIVER MICROPHONE & PARLER';
                }
            };

            rec.start(250);
        } catch (err) {
            console.error('[Arena Mic Error]:', err);
            const voiceLabel = document.getElementById('arenaVoiceLabel');
            if (voiceLabel) voiceLabel.textContent = '❌ Microphone inaccessible (permissions)';
            this.stopVoiceCapture();
        }
    }

    private cleanupMediaStream() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
    }

    private startVoiceCapture() {
        this.isListening = true;
        this.sound.play('listen');
        (window as any).__setBioAudioLevel?.(0.04, 'listening');

        const voiceBtn = document.getElementById('arenaVoiceBtn');
        const voiceLabel = document.getElementById('arenaVoiceLabel');
        const waveStrip = document.getElementById('arenaWaveStrip');

        if (voiceBtn) voiceBtn.classList.add('listening');
        if (voiceLabel) voiceLabel.textContent = '👂 Écoute en cours... Parlez maintenant !';
        if (waveStrip) waveStrip.classList.add('active');

        if (this.speechRecognition) {
            try {
                this.speechRecognition.start();
                return;
            } catch (e) {
                console.warn('[SpeechRec start error, fallback to MediaRecorder]:', e);
            }
        }

        // Use high-speed MediaRecorder + ASR fallback
        this.startMediaRecorderCapture();
    }

    private stopVoiceCapture() {
        this.isListening = false;
        (window as any).__setBioAudioLevel?.(0, 'idle');

        const voiceBtn = document.getElementById('arenaVoiceBtn');
        const voiceLabel = document.getElementById('arenaVoiceLabel');
        const waveStrip = document.getElementById('arenaWaveStrip');

        if (voiceBtn) voiceBtn.classList.remove('listening');
        if (voiceLabel) voiceLabel.textContent = 'ACTIVER MICROPHONE & PARLER';
        if (waveStrip && !this.isSpeaking) waveStrip.classList.remove('active');

        if (this.speechRecognition) {
            try {
                this.speechRecognition.stop();
            } catch {}
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
            } catch {}
        }
    }

    public async startNewArenaRound(topicId?: string) {
        this.sound.play('start');
        this.stopVoiceCapture();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const dialogueStage = document.getElementById('arenaDialogueStage');
        if (dialogueStage) {
            dialogueStage.innerHTML = `
                <div class="arena-empty-placeholder">
                    <div class="arena-radar"></div>
                    <p style="font-size: 15px; color: #38bdf8; font-weight: 600;">Canal sécurisé établi • Interlocuteur en attente</p>
                    <p style="font-size: 13px; color: #94a3b8; max-width: 400px;">Parlez au micro ou écrivez. Votre but : déterminer s'il s'agit d'un vrai humain ou d'une IA 2030.</p>
                </div>
            `;
        }

        try {
            const resp = await fetch('/api/agi/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId })
            });
            const data = await resp.json();
            this.currentSessionId = data.sessionId;
            this.currentTopic = data.topic;
            this.remainingSeconds = data.roundDuration || 45;

            // Mise à jour de l'UI du sujet
            const topicCategory = document.getElementById('arenaTopicCategory');
            const topicTitle = document.getElementById('arenaTopicTitle');
            if (topicCategory) topicCategory.textContent = data.topic.category;
            if (topicTitle) topicTitle.textContent = data.topic.title;

            this.startTimer();
        } catch (err) {
            console.error('[AgiArena] Erreur démarrage:', err);
        }
    }

    private startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();

            if (this.remainingSeconds <= 5 && this.remainingSeconds > 0) {
                this.sound.play('ping');
            }

            if (this.remainingSeconds <= 0) {
                if (this.timerInterval) clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.openVerdictModal();
            }
        }, 1000);
    }

    private updateTimerDisplay() {
        const timerEl = document.getElementById('arenaTimer');
        if (!timerEl) return;
        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = this.remainingSeconds % 60;
        timerEl.textContent = `⏳ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    public async sendTurn(text: string) {
        if (!this.currentSessionId) return;

        this.addDialogueBubble('user', text);
        this.sound.play('click');
        (window as any).__setBioAudioLevel?.(0.03, 'thinking');

        const voiceLabel = document.getElementById('arenaVoiceLabel');
        if (voiceLabel) voiceLabel.textContent = '🧠 Interlocuteur réfléchit...';

        try {
            const resp = await fetch('/api/agi/turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.currentSessionId,
                    userText: text
                })
            });

            const data = await resp.json();
            if (data.replyText) {
                this.addDialogueBubble('interlocutor', data.replyText);
                this.speakResponse(data.replyText);
            } else {
                (window as any).__setBioAudioLevel?.(0, 'idle');
            }
        } catch (err) {
            console.error('[AgiArena] Erreur échange turn:', err);
            this.addDialogueBubble('interlocutor', "C'est une très bonne remarque. Dis-m'en plus sur ta façon de voir les choses.");
            (window as any).__setBioAudioLevel?.(0, 'idle');
        } finally {
            if (voiceLabel) voiceLabel.textContent = 'ACTIVER MICROPHONE & PARLER';
        }
    }

    private speakResponse(text: string) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 1.05;
            utterance.pitch = 1.0;

            const waveStrip = document.getElementById('arenaWaveStrip');
            utterance.onstart = () => {
                this.isSpeaking = true;
                (window as any).__setBioAudioLevel?.(0.06, 'speaking');
                if (waveStrip) waveStrip.classList.add('active');
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                (window as any).__setBioAudioLevel?.(0, 'idle');
                if (waveStrip && !this.isListening) waveStrip.classList.remove('active');
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('[SpeechSynthesis] Erreur lecture:', e);
        }
    }

    private addDialogueBubble(speaker: 'user' | 'interlocutor', text: string) {
        const stage = document.getElementById('arenaDialogueStage');
        if (!stage) return;

        const placeholder = stage.querySelector('.arena-empty-placeholder');
        if (placeholder) placeholder.remove();

        const bubble = document.createElement('div');
        bubble.className = `arena-bubble ${speaker}`;
        const author = speaker === 'user' ? 'Vous' : 'Interlocuteur Mystère';
        bubble.innerHTML = `<span class="bubble-author">${author}</span>${text}`;

        stage.appendChild(bubble);
        stage.scrollTop = stage.scrollHeight;
    }

    public openVerdictModal() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const modal = document.getElementById('verdictModal');
        const votingPods = document.getElementById('votingPods');
        const revealContainer = document.getElementById('revealContainer');

        if (votingPods) votingPods.style.display = 'grid';
        if (revealContainer) revealContainer.style.display = 'none';
        if (modal) modal.classList.add('open');
    }

    public closeVerdictModal() {
        const modal = document.getElementById('verdictModal');
        if (modal) modal.classList.remove('open');
    }

    public async castVote(vote: 'human' | 'ai') {
        if (!this.currentSessionId) return;

        this.sound.play('click');

        try {
            const resp = await fetch('/api/agi/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.currentSessionId,
                    vote
                })
            });

            const data = await resp.json();
            this.displayVerdictReveal(data);
        } catch (err) {
            console.error('[AgiArena] Erreur enregistrement vote:', err);
        }
    }

    private displayVerdictReveal(data: any) {
        const votingPods = document.getElementById('votingPods');
        const revealContainer = document.getElementById('revealContainer');
        const revealBadge = document.getElementById('revealHeaderBadge');
        const revealVote = document.getElementById('revealUserVote');
        const revealActual = document.getElementById('revealActual');
        const revealImpact = document.getElementById('revealImpact');
        const revealAnalysis = document.getElementById('revealAnalysis');
        const userXPDisplay = document.getElementById('userXPDisplay');

        if (data.wasDeceived) {
            this.sound.play('deceived');
            if (revealBadge) {
                revealBadge.className = 'reveal-header-badge deceived';
                revealBadge.innerHTML = '⚠️ VOUS AVEZ ÉTÉ TROMPÉ(E) ! (+1 POUR L\'AGI)';
            }
        } else {
            this.sound.play('detected');
            if (revealBadge) {
                revealBadge.className = 'reveal-header-badge detected';
                revealBadge.innerHTML = '🎯 CLAIRVOYANCE HUMAINE VALIDÉE !';
            }
        }

        if (revealVote) revealVote.textContent = data.userVote === 'human' ? '👤 Vrai Humain' : '🤖 IA Neuronale';
        if (revealActual) revealActual.textContent = data.actual === 'human' ? '👤 Vrai Humain' : '🤖 IA Neuronale';
        if (revealImpact) revealImpact.textContent = `${data.deceptionRate}% (${data.totalTests.toLocaleString()} tests)`;
        if (revealAnalysis) revealAnalysis.textContent = data.analysis;

        this.userXP += data.xpEarned || 50;
        if (userXPDisplay) userXPDisplay.textContent = `${this.userXP} XP`;

        if (votingPods) votingPods.style.display = 'none';
        if (revealContainer) revealContainer.style.display = 'flex';

        // Mise à jour de la jauge en haut
        const pillVal = document.getElementById('agiPillVal');
        if (pillVal) pillVal.textContent = `${data.deceptionRate}%`;
    }

    public async fetchGlobalStats() {
        try {
            const resp = await fetch('/api/agi/stats');
            const stats: AgiStats = await resp.json();
            this.renderGlobalStats(stats);
        } catch (err) {
            console.error('[AgiArena] Erreur fetch stats:', err);
        }
    }

    private renderGlobalStats(stats: AgiStats) {
        // En-tête pill
        const pillVal = document.getElementById('agiPillVal');
        if (pillVal) pillVal.textContent = `${stats.deceptionRate}%`;

        // Radial gauge in Matrix
        const gaugeFill = document.getElementById('gaugeFillCircle');
        const gaugePercent = document.getElementById('matrixGaugePercent');
        if (gaugePercent) gaugePercent.textContent = `${stats.deceptionRate}%`;

        if (gaugeFill) {
            // Cercle périmètre ~440 (rayon = 70)
            const circumference = 2 * Math.PI * 70;
            // 50% = 100% de la jauge
            const percentOfThreshold = Math.min(100, (stats.deceptionRate / 50) * 100);
            const offset = circumference - (percentOfThreshold / 100) * circumference;
            gaugeFill.style.strokeDashoffset = `${offset}`;
        }

        // Barres métriques
        const testsTotalEl = document.getElementById('matrixTotalTests');
        const testsFill = document.getElementById('matrixTotalFill');
        if (testsTotalEl) {
            testsTotalEl.textContent = `${stats.totalTests.toLocaleString()} / ${stats.targetTests.toLocaleString()}`;
        }
        if (testsFill) {
            const fillPct = (stats.totalTests / stats.targetTests) * 100;
            testsFill.style.width = `${fillPct}%`;
        }

        const deceptionEl = document.getElementById('matrixDeceptions');
        if (deceptionEl) {
            deceptionEl.textContent = `${stats.deceptionCount.toLocaleString()} fois`;
        }

        // Telemetry Feed
        const feed = document.getElementById('matrixTelemetryList');
        if (feed && stats.recentVerdicts) {
            feed.innerHTML = stats.recentVerdicts.map(v => `
                <div class="telemetry-item">
                    <span class="telemetry-loc">${v.location}</span>
                    <span style="color: #cbd5e1; font-size: 12px;">"${v.topic}"</span>
                    <span class="telemetry-badge ${v.wasDeceived ? 'deceived' : 'detected'}">
                        ${v.wasDeceived ? 'TROMPÉ (+1 AGI)' : 'DÉMASQUÉ'}
                    </span>
                    <span style="color: #64748b; font-size: 11px;">${v.timeAgo}</span>
                </div>
            `).join('');
        }
    }

    public shareAgiBenchmark() {
        this.sound.play('click');
        const shareData = {
            title: 'UltraBlabla 2030 • Le Test de Détection de l\'AGI',
            text: `Je viens de tester mon discernement humain face à l'IA 2030 ! L'indice mondial de tromperie AGI est à ${document.getElementById('agiPillVal')?.textContent || '48.7%'}. Serez-vous trompé ?`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${shareData.text} 👉 ${shareData.url}`).then(() => {
                alert('Lien et score copiés dans votre presse-papier !');
            }).catch(() => {});
        }
    }
}

export const agiController = new AgiArenaController();
