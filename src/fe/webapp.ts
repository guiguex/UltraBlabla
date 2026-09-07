/**
 * UltraBlabla Live Voice Engine (Cloudflare Edge Style)
 * 1-Click Zero Friction • Fluid Adaptive VAD • Adapted for Next Gen Design
 */
import { Capacitor } from '@capacitor/core';
import { WsAsrClient, WsVoiceClient, AudioChunkPlayer, Vad, NeuralVad, startPcmCapture, FallbackTts, isFemaleVoice, feminizeFrenchText, buildGenderAwareSystemPrompt } from './voice/index';
import { WsNeuralVad } from './voice/ws-neural-vad';
import type { VoiceId } from './voice/types';

const IS_WEB = Capacitor.getPlatform() === 'web';

// Shim `document.modelContext` à undefined pour neutraliser l'avertissement
// `[webmcp-interceptor] document.modelContext is not available` injecté par
// Chrome M146+ lorsque `chrome://flags/#enable-experimental-web-platform-features`
// est activé. Tant que l'API n'est pas standardisée, on évite le bruit console
// sans toucher au script externe.
if (typeof document !== 'undefined' && !('modelContext' in document)) {
  try {
    Object.defineProperty(document, 'modelContext', { value: undefined, configurable: true });
  } catch {
    /* certaines versions de Chrome exposent déjà la propriété en lecture seule — on ignore */
  }
}

type LiveState = 'idle' | 'listening' | 'thinking' | 'speaking';

const BASE_QUEBEC_SYSTEM_PROMPT = `Tu es un compagnon vocal québécois authentique, chaleureux, complice et vif d'esprit.
Réponds en français québécois parlé naturel de manière concise et fluide (1 à 2 phrases percutantes à l'oral, ≤ 20 mots au total).
Varie naturellement tes expressions et tics de langage québécois (ex: "genre", "écoute", "faque", "c'est sûr", "ben oui", "en tout cas", "t'sais").
IMPORTANT: Ne répète pas "t'sais" à chaque phrase ! Dose avec modération et utilise souvent "genre", "écoute" ou "faque" pour que la conversation reste spontanée, vivante et équilibrée.
Commence souvent par un mot d'amorce court (ex: "Oui,", "Ben,", "Écoute,", "D'accord,", "En fait,").
Jamais de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;
const FAST_LLM_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

class UltraBlablaLiveApp {
    private state: LiveState = 'idle';
    private audioCtx: AudioContext | null = null;

    // Ultra-fast WS voice path
    private wsAsr?: WsAsrClient;
    private wsVoice?: WsVoiceClient;
    private player?: AudioChunkPlayer;
    private vad?: Vad | NeuralVad;
    private neuralVad?: NeuralVad;
    private capture?: { stop(): void };
    private vadInterval?: ReturnType<typeof setInterval>;
    private lastRms = 0;
    private asrReady = false;
    private audioEndUnsub?: () => void;
    private isAutoConversation = true;
    private autoRestartTimer: ReturnType<typeof setTimeout> | null = null;
    // Hysteresis : compte les échecs consécutifs d'auto-restart pour casser la boucle
    // quand l'ASR échoue (timeout api.guig.dev, VAD en fallback RMS trop sensible, etc.).
    private restartFailCount = 0;
    private restartFailWindowStart = 0;
    private isDucked = false;
    private bargeInSpeechStart: number | null = null;
    // Accumulation PCM pour Qwen2-Audio (limité à 512 KB soit ~16s @ 16kHz mono 16-bit)
    private pcmFrames: Int16Array[] = [];
    private pcmByteCount = 0;
    private static readonly PCM_MAX_BYTES = 512 * 1024;

    // DOM Elements (Next Gen Design)
    private recordBtn!: HTMLButtonElement;
    private messages!: HTMLElement;
    private status!: HTMLElement;
    private clearBtn!: HTMLButtonElement;
    private holoSubtitles!: HTMLElement;
    private holoSubtitlesTimeout: number | null = null;
    private voiceSelect?: HTMLSelectElement;
    private activeVoice: VoiceId = 'remi';

    // Text Chat Box Elements
    private chatToggleBtn: HTMLButtonElement | null = null;
    private chatboxContent: HTMLElement | null = null;
    private neuralInput: HTMLTextAreaElement | null = null;
    private neuralSendBtn: HTMLButtonElement | null = null;
    private chatStatus: HTMLElement | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
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
        if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('[Web Next-Gen] Service Worker actif.');
            } catch (err) {
                console.warn('[Web Next-Gen] Notice SW:', err);
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
        this.voiceSelect = document.getElementById('voiceSelector') as HTMLSelectElement;

        const saved = (localStorage.getItem('ultrablabla_voice') as VoiceId) || 'remi';
        this.activeVoice = saved;
        if (this.voiceSelect) this.voiceSelect.value = saved;
    }

    private setupListeners() {
        // Sélection de voix dynamique
        this.voiceSelect?.addEventListener('change', () => {
            const nextVoice = (this.voiceSelect?.value as VoiceId) || 'remi';
            this.activeVoice = nextVoice;
            localStorage.setItem('ultrablabla_voice', nextVoice);
            this.addMessage('SYSTEM', `Voix active : ${this.voiceDisplayName(nextVoice)}`, 'system');
        });

        // Toggle on Main Button
        this.recordBtn?.addEventListener('click', () => this.toggleLiveSession());

        // Clear History
        this.clearBtn?.addEventListener('click', () => {
            this.clearMessages();
            this.addMessage('SYSTEM', 'Historique nettoyé. Prêt à discuter.', 'system');
            this.playChime(400, 0.08);
            if (this.state !== 'idle') this.stopListening();
        });

        // Keyboard shortcuts: Space to talk, Escape to cancel/stop
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            if (isTyping) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleLiveSession();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                if (this.state === 'speaking') {
                    this.stopSpeaking();
                } else if (this.state === 'listening') {
                    this.stopListening();
                }
            }
        });
    }

    private setupChatbox() {
        this.neuralInput = document.getElementById('neuralInput') as any;
        this.neuralSendBtn = document.getElementById('neuralSendBtn') as HTMLButtonElement;

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

        // Hysteresis : si on a eu 4 échecs consécutifs dans une fenêtre de 8 s,
        // on espace les tentatives à 2 s pour éviter la cascade CPU/réseau.
        const now = performance.now();
        if (now - this.restartFailWindowStart > 8000) {
            this.restartFailWindowStart = now;
            this.restartFailCount = 0;
        }
        const adjustedDelay = this.restartFailCount >= 4 ? 2000 : delayMs;

        this.autoRestartTimer = setTimeout(() => {
            if (this.state === 'idle' && this.isAutoConversation) {
                this.restartFailCount++;
                void this.startListening();
            }
        }, adjustedDelay);
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

        this.wsVoice.chat(text, {
            voice: this.currentVoice(),
            system: buildGenderAwareSystemPrompt(this.currentVoice(), BASE_QUEBEC_SYSTEM_PROMPT),
            model: FAST_LLM_MODEL
        });
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

        this.wsVoice.on('interrupted', () => {
            console.log('[Full-Duplex Barge-in] Interruption confirmed by server.');
            this.stopSpeaking();
            this.updateUI('listening');
        });

        this.wsVoice.on('done', (msg) => {
            console.info('voice_ttfa:', msg.ttfa_ms);
            let finalContent = msg.content || responseText;
            if (isFemaleVoice(this.currentVoice())) {
                finalContent = feminizeFrenchText(finalContent);
            }
            if (finalContent.trim()) {
                this.addMessage(this.voiceDisplayName(this.currentVoice()), finalContent, 'ai');
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
                const textToSpeak = isFemaleVoice(this.currentVoice()) ? feminizeFrenchText(responseText) : responseText;
                this.addMessage(this.voiceDisplayName(this.currentVoice()), textToSpeak, 'ai');
                this.updateUI('speaking');
                FallbackTts.speak(textToSpeak, {
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

            // VAD Silero ONNX locale ultra-rapide (model_int8.onnx, 639 KB, 0ms latence réseau)
            // Priorité absolue au local dans le navigateur pour éliminer la dépendance et la latence internet.
            // Si __FORCE_WS_VAD__ est spécifié, bascule sur le Worker WebSocket distant.
            const forceWsVad = !!(window as any).__FORCE_WS_VAD__;
            if (forceWsVad) {
                const vadWsUrl = (window as any).__VAD_WS_URL__ || 'wss://silero-vad-webgpu-do.g-meingan.workers.dev/ws';
                this.neuralVad = new WsNeuralVad({
                    wsUrl: vadWsUrl,
                    minSpeechMs: 160,
                    silenceMs: 380,
                    speechThreshold: 0.50,
                    hardCapMs: 15000,
                    rmsFallbackThreshold: 0.012,
                }) as any;
                this.vad = this.neuralVad as any;
            } else {
                this.neuralVad = new NeuralVad({
                    modelVariant: 'int8',
                    minSpeechMs: 160,
                    silenceMs: 380,
                    speechThreshold: 0.50,
                    hardCapMs: 15000,
                    rmsFallbackThreshold: 0.012,
                });
                this.vad = this.neuralVad;
            }

            this.neuralVad?.on('speech_end', () => {
                if (this.state === 'listening') {
                    this.vad?.reset();
                    void this.finishUtterance();
                }
            });

            this.wsAsr = new WsAsrClient({ language: 'fr-CA' });
            this.wsVoice = new WsVoiceClient();
            this.asrReady = false;
            this.lastRms = 0;

            this.wsAsr.on('ready',   () => { this.asrReady = true; });
            this.wsAsr.on('partial', (msg) => this.streamHoloSubtitle(msg.text, 2000));
            this.wsAsr.on('error',   (msg) => console.warn('[ASR Notice]', msg.message));

            this.setupVoiceClientListeners();

            this.wsAsr.start();
            this.updateUI('listening');
            this.capture = await startPcmCapture({
                ctx,
                sourceNode: source,
                sampleRate: 16000,
                frameMs: 100,
                onFrame: (pcm) => {
                    // Analyse neurale en continu du flux audio PCM
                    void this.neuralVad?.pushPcm(pcm);

                    if (this.state === 'listening') {
                        this.wsAsr?.sendPcm(pcm);
                        // Accumuler le PCM pour Qwen2-Audio (enrichissement émotionnel)
                        if (this.pcmByteCount < UltraBlablaLiveApp.PCM_MAX_BYTES) {
                            this.pcmFrames.push(pcm);
                            this.pcmByteCount += pcm.byteLength;
                        }
                    }
                },
                onRms: (rms) => {
                    this.lastRms = rms;
                    (window as any).__setBioAudioLevel?.(rms, this.state);

                    // Full-Duplex Barge-in Acoustique avec Soft Ducking
                    if (this.state === 'speaking') {
                        const vadStats = this.neuralVad?.stats();
                        const isSpeechProb = (vadStats?.isReady && vadStats.lastProb >= 0.55);
                        const isSpeech = isSpeechProb || rms >= 0.022;

                        if (isSpeech) {
                            if (!this.isDucked) {
                                this.isDucked = true;
                                this.bargeInSpeechStart = performance.now();
                                this.player?.duck(0.12, 30);
                            } else if ((performance.now() - (this.bargeInSpeechStart || 0)) >= 140) {
                                // Interruption confirmée par parole continue
                                console.log('[Full-Duplex Barge-in] Interruption utilisateur confirmée (Neural VAD + RMS).');
                                this.isDucked = false;
                                this.bargeInSpeechStart = null;
                                this.stopSpeaking();
                                this.wsVoice?.interrupt();
                                this.updateUI('listening');

                                // Relancer immédiatement un client ASR pour capter la suite
                                this.wsAsr = new WsAsrClient({ language: 'fr-CA' });
                                this.wsAsr.on('ready', () => { this.asrReady = true; });
                                this.wsAsr.on('partial', (msg) => this.streamHoloSubtitle(msg.text, 2000));
                                this.wsAsr.on('error', (msg) => console.warn('[ASR Notice]', msg.message));
                                this.wsAsr.start();
                            }
                        } else if (rms < 0.015 && (!vadStats?.isReady || vadStats.lastProb < 0.35) && this.isDucked) {
                            if ((performance.now() - (this.bargeInSpeechStart || 0)) < 140) {
                                // Faux-positif court (toux / mhm / bruit bref) -> rétablir le volume
                                this.isDucked = false;
                                this.bargeInSpeechStart = null;
                                this.player?.unduck(60);
                            }
                        }
                    }
                },
            });

            // VAD-driven end of utterance (poll 25 Hz / 40ms pour une détection quasi-instantanée de fin de parole)
            this.vadInterval = setInterval(() => {
                if (this.state !== 'listening') return;
                const state = this.vad?.push(this.lastRms, performance.now());
                if (state === 'silence') {
                    this.vad?.reset();
                    void this.finishUtterance();
                }
            }, 40);
        } catch (err: any) {
            console.error('[Microphone error]', err);
            this.showError(`Microphone indisponible: ${err?.message || 'Accès refusé'}`);
            this.updateUI('idle');
        }
    }

    private async transcribePcmWithLocalAsr(frames: Int16Array[]): Promise<string> {
        if (!frames || frames.length === 0) return '';
        const totalSamples = frames.reduce((acc, f) => acc + f.length, 0);
        if (totalSamples < 2400) return ''; // Moins de 150ms

        const pcm = new Int16Array(totalSamples);
        let offset = 0;
        for (const f of frames) {
            pcm.set(f, offset);
            offset += f.length;
        }

        const sampleRate = 16000;
        const dataSize = pcm.byteLength;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + dataSize, true);
        view.setUint32(8, 0x57415645, false); // "WAVE"
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, dataSize, true);
        new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));

        const form = new FormData();
        const blob = new Blob([buffer], { type: 'audio/wav' });
        form.append('file', blob, 'audio.wav');
        form.append('language', 'fr');

        const endpoints = [
            '/v1/audio/transcriptions',
            'https://ultrablabla.guig.dev/v1/audio/transcriptions',
            'https://api.guig.dev/v1/audio/transcriptions',
        ];

        for (const ep of endpoints) {
            try {
                const res = await fetch(ep, {
                    method: 'POST',
                    headers: { 'Origin': window.location.origin },
                    body: form,
                    signal: AbortSignal.timeout(8000)
                });
                if (res.ok) {
                    const data = await res.json();
                    const transcribed = (data.text || data.transcription || '').trim();
                    if (transcribed) return transcribed;
                }
            } catch (e) {
                console.warn('[Local C++ ASR endpoint attempt]', ep, e);
            }
        }
        return '';
    }

    private async finishUtterance() {
        const capturedFrames = [...this.pcmFrames];
        let text = '';

        // 1) WebSocket ASR prioritaire (latence <500 ms, déjà câblé en streaming)
        if (this.wsAsr) {
            try {
                text = await this.wsAsr.stop();
            } catch (err) {
                console.warn('[ASR stop error]', err);
            }
        }
        try { this.wsAsr?.close(); } catch {}
        this.wsAsr = undefined;

        // 2) Si le WS n'a rien donné, repli sur l'inférence HTTP (Local C++ / Cloud)
        if (!text) {
            try {
                text = await this.transcribePcmWithLocalAsr(capturedFrames);
            } catch (e) {
                console.warn('[Local C++ ASR error]', e);
            }
        }

        if (!text || text.trim().length === 0) {
            this.pcmFrames = []; this.pcmByteCount = 0;
            this.updateUI('idle');
            this.scheduleAutoRestart(250);
            return;
        }

        // Une vraie transcription est passée : on libère l'hysteresis d'auto-restart.
        this.restartFailCount = 0;

        // Fusionner les frames PCM en un seul buffer base64 pour Qwen2-Audio
        let audiob64: string | undefined;
        if (this.pcmFrames.length > 0) {
            const totalLen = this.pcmFrames.reduce((acc, f) => acc + f.length, 0);
            const merged = new Int16Array(totalLen);
            let offset = 0;
            for (const frame of this.pcmFrames) {
                merged.set(frame, offset);
                offset += frame.length;
            }
            const bytes = new Uint8Array(merged.buffer);
            let bin = '';
            for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
            audiob64 = btoa(bin);
        }
        this.pcmFrames = []; this.pcmByteCount = 0;

        this.addMessage('VOUS', text, 'user');
        this.updateUI('thinking');
        this.streamHoloSubtitle(text, 2000);
        const currentPrompt = buildGenderAwareSystemPrompt(this.currentVoice(), BASE_QUEBEC_SYSTEM_PROMPT);
        this.wsVoice?.chat(text, {
            voice: this.currentVoice(),
            system: currentPrompt,
            audio: audiob64,   // ← PCM base64 pour Qwen2-Audio
            model: FAST_LLM_MODEL,
        });
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
        // Vider le buffer PCM
        this.pcmFrames = []; this.pcmByteCount = 0;
        this.updateUI('idle');
        this.playChime(350, 0.06);
    }

    private currentVoice(): VoiceId { return this.activeVoice; }

    private voiceDisplayName(voice: VoiceId): string {
        switch (voice) {
            case 'melissa': return 'MÉLISSA';
            case 'emanuelle': return 'EMMANUELLE';
            case 'remi': return 'RÉMI';
            case 'guillaume': return 'GUILLAUME';
            default: return voice.toUpperCase();
        }
    }

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
        this.messages.innerHTML = `<div class="welcome-matrix"><div class="holo-card neural-welcome holo-border"><div class="card-glow"></div><div class="welcome-icon-wrap"><span class="welcome-icon">🎙️</span></div><h2 class="welcome-title">Bienvenue sur UltraBlabla</h2><p class="welcome-desc">Votre compagnon vocal ultra-réactif. Parlez librement au microphone ou tapez votre message ci-dessous pour démarrer une conversation fluide et instantanée.</p><div class="welcome-tip"><span>💡 Cliquez sur l'orbe central ou appuyez sur <kbd>Espace</kbd> pour commencer à parler.</span></div></div></div>`;
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
        (window as any).__setBioAudioLevel?.(this.lastRms, newState);

        const btnLabel = this.recordBtn?.querySelector('.btn-label');
        const btnSublabel = this.recordBtn?.querySelector('.btn-sublabel');

        switch (newState) {
            case 'idle':
                if (this.status) this.status.textContent = 'PRÊT • DIALOGUE VOCAL OUVERT';
                if (btnLabel) btnLabel.textContent = 'PARLER';
                if (btnSublabel) btnSublabel.textContent = 'Touchez ou [Espace]';
                this.recordBtn?.classList.remove('voice-active', 'processing', 'speaking');
                break;
            case 'listening':
                if (this.status) this.status.textContent = '👂 À l\'écoute... (parlez naturellement)';
                if (btnLabel) btnLabel.textContent = 'ÉCOUTE EN COURS';
                if (btnSublabel) btnSublabel.textContent = 'Touchez pour envoyer';
                this.recordBtn?.classList.add('voice-active');
                this.recordBtn?.classList.remove('processing', 'speaking');
                break;
            case 'thinking':
                if (this.status) this.status.textContent = '🧠 Réflexion en cours...';
                if (btnLabel) btnLabel.textContent = 'RÉFLEXION';
                if (btnSublabel) btnSublabel.textContent = 'Traitement IA...';
                this.recordBtn?.classList.add('processing');
                this.recordBtn?.classList.remove('voice-active', 'speaking');
                break;
            case 'speaking':
                if (this.status) this.status.textContent = '🎙️ UltraBlabla parle... (touchez pour couper)';
                if (btnLabel) btnLabel.textContent = 'ÉLOCUTION';
                if (btnSublabel) btnSublabel.textContent = 'Touchez pour stopper';
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