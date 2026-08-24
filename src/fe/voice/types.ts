// ASR client → server
export type AsrStart = { type: 'start'; language?: string; sample_rate?: number };
export type AsrPcm = { type: 'pcm'; seq: number; data: string };
export type AsrStop = { type: 'stop' };
export type AsrClientMsg = AsrStart | AsrPcm | AsrStop;

// ASR server → client
export type AsrReady = { type: 'ready'; model: string; fallback: string };
export type AsrPartial = { type: 'partial'; seq: number; text: string; latency_ms: number; model: string };
export type AsrFinal = { type: 'final'; seq: number; text: string; model: string };
export type AsrError = { type: 'error'; message: string };
export type AsrServerMsg = AsrReady | AsrPartial | AsrFinal | AsrError;

// Voice client → server
export type VoiceChat = { type: 'chat'; text: string; voice?: VoiceId; system?: string };
export type VoiceAbort = { type: 'abort' };
export type VoiceClientMsg = VoiceChat | VoiceAbort;

export type VoiceId =
  | 'guillaume'   | 'remi'        | 'melissa'     | 'emanuelle'
  | 'fr-female-1' | 'fr-female-2' | 'fr-female-3'
  | 'fr-male-1'   | 'fr-male-2'   | 'fr-male-3'
  | 'en-female-1' | 'en-female-2' | 'en-female-3'
  | 'en-male-1'   | 'en-male-2'   | 'en-male-3'
  | 'es-female-1' | 'es-female-2'
  | 'es-male-1'   | 'es-male-2'
  | 'premium-1';

// Voice server → client
export type VoiceReady = { type: 'ready' };
export type VoiceToken = { type: 'token'; content: string };
export type VoiceAudio = { type: 'audio'; data: string; format: 'wav' };
export type VoiceDone = { type: 'done'; content: string; ttfa_ms: number };
export type VoiceError = { type: 'error'; message: string };
export type VoiceServerMsg = VoiceReady | VoiceToken | VoiceAudio | VoiceDone | VoiceError;

// Type guards
export function isAsrServerMsg(v: unknown): v is AsrServerMsg {
  return !!v && typeof v === 'object' && ['ready', 'partial', 'final', 'error'].includes((v as any).type);
}

export function isVoiceServerMsg(v: unknown): v is VoiceServerMsg {
  return !!v && typeof v === 'object' && ['ready', 'token', 'audio', 'done', 'error'].includes((v as any).type);
}