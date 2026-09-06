/**
 * Découpeur Phonétique et Chunker Prosodique Québécois
 *
 * Optimisé pour le streaming audio ultra-basse latence :
 * - Masque les abréviations (M., Mme., Dr., Ste., QC., CAD., décimales) pour éviter les coupures prématurées
 * - Insère les micro-pauses prosodiques du québécois ("T'sais" -> "T'sais, ")
 * - Vocalise les tags d'émotion ([rire] -> " haha ! ", [soupir] -> " ah... ")
 * - Supprime les symboles markdown et emojis inaudibles
 * - Découpe sur les frontières de souffle naturelles (. ! ? : \n)
 */

export interface SpeechChunkResult {
  chunk: string;
  remaining: string;
}

/**
 * Nettoie et formate la prosodie du texte pour le moteur TTS.
 */
export function formatQuebecProsody(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // 1. Conversion des intentions émotionnelles en onomatopées vocales naturelles
    .replace(/\[(?:rire|haha|hihi|laugh)\]/gi, ' haha ! ')
    .replace(/\[(?:soupir|sigh)\]/gi, ' ah... ')
    .replace(/\[(?:pause|silence)\]/gi, ' ... ')
    .replace(/\[(?:chuchotement|whisper)\]/gi, ' ')
    // 2. Nettoyage des balises de pensée LLM éventuelles
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\|[^|]+\|>/g, '')
    // 3. Suppression syntaxe markdown (*, #, `, _, ~) et emojis
    .replace(/[*#`_~]/g, '')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    // 4. Réparation des apostrophes et contractions cassées par les tokenizers
    .replace(/(\w)\s+['’]\s*(\w)/g, "$1'$2")
    .replace(/\bj\s+['’]\s*suis\b/gi, "j'suis")
    .replace(/\bc\s+['’]\s*est\b/gi, "c'est")
    // 5. Règle prosodique québécoise : pause respiratoire après "T'sais"
    .replace(/\b([Tt]['’]sais)\s+(c['’]est|[a-zA-ZÀ-ÿ])/g, "$1, $2")
    // 6. Normalisation des espaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait la prochaine clause vocale complète d'un buffer de streaming.
 */
export function extractNextSpeechChunk(buffer: string): SpeechChunkResult | null {
  if (!buffer || buffer.length === 0) return null;

  // 1. Masquage des points d'abréviations et décimales pour éviter les fausses coupures
  const masked = buffer
    .replace(/\b(M|Mme|Mlle|Dr|Prof|St|Ste|vs|ex|etc|N\.B|QC|CAD)\./gi, '$1__DOT__')
    .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2');

  // 2. Détection de frontière de phrase ou de clause forte (. ! ? : ; \n)
  const sentenceEndPattern = /([^.!?:;\n]+[.!?:\n]+)/;
  const match = masked.match(sentenceEndPattern);

  if (!match || match.index === undefined) {
    return null;
  }

  const rawChunk = match[1];
  const splitIndex = match.index + rawChunk.length;

  // 3. Démasquage et enrichissement prosodique
  const unmaskedChunk = rawChunk.replace(/__DOT__/g, '.');
  const cleanChunk = formatQuebecProsody(unmaskedChunk);
  const remaining = buffer.slice(splitIndex);

  // Éviter les micro-bribes isolées si d'autres mots arrivent
  if (cleanChunk.length < 3 && remaining.trim().length > 0) {
    return null;
  }

  return {
    chunk: cleanChunk,
    remaining
  };
}
