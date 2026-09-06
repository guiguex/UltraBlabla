/**
 * Moteur de Féminisation Déterministe et Personas de Genre en Temps Réel
 *
 * Assure que les voix féminines québécoises (Mélissa, Emmanuelle, etc.) ne
 * s'expriment JAMAIS au masculin dans leurs réponses générées ou synthétisées.
 */

const FEMALE_VOICE_PATTERNS = [
  'melissa',
  'emanuelle',
  'emmanuelle',
  'claire',
  'marie',
  'fr-female',
  'es-female',
  'en-female',
  'female',
  'femme',
  'douce',
];

/**
 * Détermine si un ID ou un descriptif correspond à une voix féminine.
 */
export function isFemaleVoice(voiceId?: string, description?: string): boolean {
  if (!voiceId) return false;
  const lowerId = voiceId.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();

  if (FEMALE_VOICE_PATTERNS.some(p => lowerId.includes(p) || lowerDesc.includes(p))) {
    return true;
  }

  return lowerDesc.includes('femme') || lowerDesc.includes('female') || lowerDesc.includes('douce');
}

/**
 * Transformateur Déterministe d'Accords Grammaticaux en Temps Réel
 * Intercepte le texte streamé et corrige les auto-références masculines
 * avant la synthèse vocale et l'affichage.
 */
export function feminizeFrenchText(text: string): string {
  if (!text || text.length === 0) return text;

  let result = text;

  // 1. Rôles et Titres
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+assistant\b/gi, '$1 $2 assistante');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+conseiller\b/gi, '$1 $2 conseillère');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+expert\b/gi, '$1 $2 experte');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+créateur\b/gi, '$1 $2 créatrice');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+interlocuteur\b/gi, '$1 $2 interlocutrice');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+utilisateur\b/gi, '$1 $2 utilisatrice');
  result = result.replace(/\b(je\s+suis|chui|j'suis|suis-je|en\s+tant\s+que|comme)\s+(un|votre|ton)\s+compagnon\b/gi, '$1 $2 compagne');

  // 2. Adjectifs et Participes passés d'auto-référence
  const adjMap: Record<string, string> = {
    'prêt': 'prête',
    'content': 'contente',
    'ravi': 'ravie',
    'désolé': 'désolée',
    'occupé': 'occupée',
    'enchanté': 'enchantée',
    'sûr': 'sûre',
    'certain': 'certaine',
    'heureux': 'heureuse',
    'joyeux': 'joyeuse',
    'rassuré': 'rassurée',
    'fatigué': 'fatiguée',
    'étonné': 'étonnée',
    'surpris': 'surprise',
    'patient': 'patiente',
    'précieux': 'précieuse',
    'seul': 'seule',
    'impressionné': 'impressionnée',
    'intéressé': 'intéressée',
    'passionné': 'passionnée',
    'séduit': 'séduite',
    'charmé': 'charmée',
    'flatté': 'flattée',
    'décidé': 'décidée',
    'déterminé': 'déterminée',
    'embêté': 'embêtée',
    'inquiet': 'inquiète',
    'attentif': 'attentive',
    'actif': 'active',
  };

  const selfRefRegex = /\b(je\s+suis|chui|j'suis|je\s+serai|j'ai\s+été|je\s+me\s+sens|je\s+suis\s+devenue)\s+([a-zA-ZàâäéèêëîïôöùûüçÉÈÊËÀÂÄÔÖÙÛÜÇ]+)\b/gi;

  result = result.replace(selfRefRegex, (match, verb, adj) => {
    const lowerAdj = adj.toLowerCase();
    if (adjMap[lowerAdj]) {
      const feminineAdj = adjMap[lowerAdj];
      const isCapital = adj.charAt(0) === adj.charAt(0).toUpperCase() && adj.charAt(0) !== adj.charAt(0).toLowerCase();
      const finalAdj = isCapital ? feminineAdj.charAt(0).toUpperCase() + feminineAdj.slice(1) : feminineAdj;
      return `${verb} ${finalAdj}`;
    }
    return match;
  });

  // 3. Formules de courtoisie et salutations
  result = result.replace(/\b(sois|tu\s+es)\s+le\s+bienvenu\b/gi, '$1 la bienvenue');
  result = result.replace(/\bmon\s+cher\b/gi, 'ma chère');

  return result;
}

/**
 * Construit un system prompt adapté au genre de la voix sélectionnée.
 */
export function buildGenderAwareSystemPrompt(
  voiceId: string,
  basePrompt?: string,
  personaStyle?: string
): string {
  const isFemale = isFemaleVoice(voiceId);
  const personaExtra = personaStyle ? `\nStyle d'élocution demandé : ${personaStyle}` : '';

  if (isFemale) {
    return `${basePrompt || ''}
[DIRECTIVE DE GENRE ABSOLUE]
Tu es une voix féminine québécoise chaleureuse et vive. Tu dois TOUJOURS parler de toi-même au FÉMININ.
Exemples obligatoires :
- "Je suis une assistante", "Chui ben contente de te parler"
- "Je suis prête", "Je suis ravie", "Je suis désolée", "Je suis certaine", "Je suis seule"
Ne te réfère JAMAIS au masculin pour parler de toi-même.${personaExtra}`;
  }

  return `${basePrompt || ''}${personaExtra}`;
}
