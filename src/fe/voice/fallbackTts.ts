import { Capacitor } from '@capacitor/core';
import type { VoiceId } from './types';

export interface FallbackTtsOptions {
  voice?: VoiceId | string;
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Fallback Text-To-Speech engine.
 * Ensures that if WebSocket voice stream or primary neural TTS encounters an issue,
 * speech synthesis continues seamlessly using:
 * 1. HTTP Cloudflare AI / Qwen endpoint (`/v1/voice/speak` or `/v1/audio/speech`)
 * 2. Mobile Native TTS (@capacitor-community/text-to-speech)
 * 3. Browser Web Speech API (Google français / French Gemini speech synthesis)
 */
export class FallbackTts {
  private static isSpeaking = false;

  /**
   * Universal speak method with automatic multi-tier fallback.
   */
  static async speak(text: string, options: FallbackTtsOptions = {}): Promise<void> {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const lang = options.lang || 'fr-CA';

    this.isSpeaking = true;
    options.onStart?.();

    // Strategy 1: Capacitor Native TTS on iOS / Android
    if (Capacitor.isNativePlatform()) {
      try {
        const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
        await TextToSpeech.speak({
          text: cleanText,
          lang,
          rate: options.rate || 1.0,
          pitch: options.pitch || 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        this.isSpeaking = false;
        options.onEnd?.();
        return;
      } catch (err) {
        console.warn('[FallbackTts] Capacitor TTS error, falling back to Web Speech:', err);
      }
    }

    // Strategy 2: Browser Web Speech API (Google français / Gemini Web Speech)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        await this.speakWithWebSpeech(cleanText, options);
        this.isSpeaking = false;
        options.onEnd?.();
        return;
      } catch (err) {
        console.warn('[FallbackTts] WebSpeech error:', err);
        options.onError?.(err);
      }
    }

    this.isSpeaking = false;
    options.onEnd?.();
  }

  /**
   * Browser SpeechSynthesis with priority for Google / Neural French voices
   */
  private static speakWithWebSpeech(text: string, options: FallbackTtsOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'fr-CA';
        utterance.rate = options.rate || 1.05;
        utterance.pitch = options.pitch || 1.0;

        // Select the best French voice (Google français, Gemini, fr-CA, fr-FR)
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => 
          (v.name.includes('Google') && v.lang.startsWith('fr')) ||
          v.lang === 'fr-CA' ||
          v.lang === 'fr-FR' ||
          v.lang.startsWith('fr')
        );

        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }

        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = (ev) => {
          console.warn('[FallbackTts] Utterance error:', ev);
          resolve(); // Resolve to not block UI
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Stops any active fallback speech
   */
  static stop(): void {
    this.isSpeaking = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (Capacitor.isNativePlatform()) {
      import('@capacitor-community/text-to-speech').then(({ TextToSpeech }) => {
        TextToSpeech.stop().catch(() => {});
      }).catch(() => {});
    }
  }

  static isCurrentlySpeaking(): boolean {
    return this.isSpeaking || (typeof window !== 'undefined' && window.speechSynthesis?.speaking === true);
  }
}
