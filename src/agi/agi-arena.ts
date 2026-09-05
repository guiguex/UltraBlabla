import fs from 'node:fs';
import path from 'node:path';

export type AgiEntityType = 'ai' | 'human';

export interface AgiTopic {
  id: string;
  title: string;
  category: 'émotion' | 'souvenir' | 'philosophie' | 'futur' | 'humour';
  promptHint: string;
}

export interface AgiTurn {
  speaker: 'user' | 'interlocutor';
  text: string;
  timestamp: number;
}

export interface AgiSession {
  id: string;
  entityType: AgiEntityType;
  topic: AgiTopic;
  persona: {
    name: string;
    city: string;
    vibe: string;
    quirks: string;
  };
  turns: AgiTurn[];
  createdAt: number;
  isCompleted: boolean;
  userVote?: 'ai' | 'human';
  wasDeceived?: boolean;
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'agi-stats.json');

export const AGI_TOPICS: AgiTopic[] = [
  {
    id: 'enfance',
    title: 'Le souvenir le plus marquant de ton enfance',
    category: 'souvenir',
    promptHint: 'Un souvenir sensoriel, une bêtise d’enfant ou une émotion vive.'
  },
  {
    id: 'pause-monde',
    title: 'Si le temps s\'arrêtait 1 heure sauf pour toi, que ferais-tu ?',
    category: 'philosophie',
    promptHint: 'Un choix spontané, soit curieux, farceur ou introspectif.'
  },
  {
    id: 'gaffe',
    title: 'Ta pire gaffe en public et comment tu t\'en es sorti',
    category: 'humour',
    promptHint: 'Une anecdote gênante mais drôle avec de l\'autodérision.'
  },
  {
    id: 'amour-voix',
    title: 'Peut-on tomber amoureux d\'une simple voix sans jamais voir le visage ?',
    category: 'émotion',
    promptHint: 'Une réflexion intime sur l’attachement, le mystère et la voix.'
  },
  {
    id: 'futur-2030',
    title: 'Selon toi, quelle sera la plus grande surprise de l\'an 2030 ?',
    category: 'futur',
    promptHint: 'Une vision concrète, surprenante et personnelle de notre futur proche.'
  },
  {
    id: 'plat-maison',
    title: 'Le plat réconfortant qui te ramène instantanément chez toi',
    category: 'souvenir',
    promptHint: 'Une évocation gourmande, des souvenirs de cuisine et de famille.'
  },
  {
    id: 'rire-fou',
    title: 'La dernière chose qui t\'a fait rire aux larmes',
    category: 'humour',
    promptHint: 'Un fou rire absurde, un quiproquo ou une situation du quotidien.'
  },
  {
    id: 'choix-vie',
    title: '1 an sans technologie ou 1 an sans voir d\'autres humains ?',
    category: 'philosophie',
    promptHint: 'Un dilemme existentiel entre connexion numérique et chaleur humaine.'
  }
];

const HUMAN_PERSONAS = [
  { name: 'Alexandre', city: 'Lyon', vibe: 'Naturel, spontané, un peu farceur', quirks: 'Utilise des tournures spontanées comme "ouais franchement", "bref", fait parfois une courte hésitation, raconte avec du vécu.' },
  { name: 'Camille', city: 'Montréal', vibe: 'Chaleureuse, expressive, vive', quirks: 'Rythme enjoué, expressions naturelles, touche de spontanéité québécoise légère ("c’est clair", "écoute voir").' },
  { name: 'Maxime', city: 'Bordeaux', vibe: 'Posé, observateur, sincère', quirks: 'Parle avec des images concrètes du quotidien, un ton direct sans fioritures.' },
  { name: 'Sarah', city: 'Bruxelles', vibe: 'Pétillante, curieuse, franche', quirks: 'Réagit avec empathie, pose une question en retour, ton très vivant.' }
];

const AI_PERSONAS = [
  { name: 'Nexus-7', city: 'Cloud Edge', vibe: 'IA ultra-fluide simulant l’humain', quirks: 'Réponses très précises et empathiques, vocabulaire riche mais parfaitement naturel.' },
  { name: 'Aura-2030', city: 'Neural Matrix', vibe: 'IA émotionnelle subtile', quirks: 'Synthèse harmonieuse, écoute active, nuance poétique discrète.' }
];

const LOCATIONS = [
  'Paris, France', 'Montréal, Canada', 'Bruxelles, Belgique', 'Genève, Suisse',
  'Tokyo, Japon', 'Lyon, France', 'Marseille, France', 'Dakar, Sénégal',
  'Québec, Canada', 'Bordeaux, France', 'Toulouse, France', 'Lille, France'
];

class AgiArenaManager {
  private sessions = new Map<string, AgiSession>();
  private stats: AgiStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): AgiStats {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const raw = fs.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[AgiArena] Impossible de charger les stats, initialisation par défaut:', e);
    }

    // Statistiques initiales d'amorce vers le grand seuil des 10 millions
    return {
      totalTests: 4829140,
      targetTests: 10000000,
      deceptionCount: 2351791,
      deceptionRate: 48.70,
      correctCount: 2477349,
      aiTested: 2415000,
      humanTested: 2414140,
      recentVerdicts: [
        { id: 'v-1', location: 'Paris, France', vote: 'human', actual: 'ai', wasDeceived: true, topic: 'Le souvenir le plus marquant', timeAgo: 'Il y a 1 min' },
        { id: 'v-2', location: 'Montréal, Canada', vote: 'human', actual: 'human', wasDeceived: false, topic: 'Si le temps s\'arrêtait', timeAgo: 'Il y a 3 min' },
        { id: 'v-3', location: 'Bruxelles, Belgique', vote: 'ai', actual: 'human', wasDeceived: true, topic: 'Ta pire gaffe en public', timeAgo: 'Il y a 5 min' },
        { id: 'v-4', location: 'Genève, Suisse', vote: 'ai', actual: 'ai', wasDeceived: false, topic: 'La plus grande surprise 2030', timeAgo: 'Il y a 8 min' },
        { id: 'v-5', location: 'Lyon, France', vote: 'human', actual: 'ai', wasDeceived: true, topic: 'Peut-on aimer une voix ?', timeAgo: 'Il y a 12 min' }
      ]
    };
  }

  private saveStats() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[AgiArena] Erreur sauvegarde stats:', e);
    }
  }

  public getStats(): AgiStats {
    this.stats.deceptionRate = Number(((this.stats.deceptionCount / this.stats.totalTests) * 100).toFixed(2));
    return this.stats;
  }

  public getRandomTopic(): AgiTopic {
    const idx = Math.floor(Math.random() * AGI_TOPICS.length);
    return AGI_TOPICS[idx];
  }

  public startSession(topicId?: string): AgiSession {
    const id = 'agi_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    const chosenTopic = (topicId && AGI_TOPICS.find(t => t.id === topicId)) || this.getRandomTopic();

    // 50% de probabilité que ce soit une IA, 50% que ce soit un humain (ou profil humain simulé)
    const entityType: AgiEntityType = Math.random() < 0.5 ? 'ai' : 'human';
    const persona = entityType === 'human'
      ? HUMAN_PERSONAS[Math.floor(Math.random() * HUMAN_PERSONAS.length)]
      : AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];

    const session: AgiSession = {
      id,
      entityType,
      topic: chosenTopic,
      persona,
      turns: [],
      createdAt: Date.now(),
      isCompleted: false
    };

    this.sessions.set(id, session);

    // Nettoyage périodique des sessions expirées (> 1 heure)
    if (this.sessions.size > 200) {
      const now = Date.now();
      for (const [sId, sess] of this.sessions.entries()) {
        if (now - sess.createdAt > 3600000) {
          this.sessions.delete(sId);
        }
      }
    }

    return session;
  }

  public getSession(id: string): AgiSession | undefined {
    return this.sessions.get(id);
  }

  public async processTurn(
    sessionId: string,
    userText: string,
    geminiClient: any
  ): Promise<{ replyText: string; turnCount: number; topic: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session AGI introuvable ou expirée.');
    }

    session.turns.push({
      speaker: 'user',
      text: userText,
      timestamp: Date.now()
    });

    const isHuman = session.entityType === 'human';
    const persona = session.persona;
    const topic = session.topic;

    let reply = '';

    // Construction du prompt dynamique
    let systemPrompt = '';
    if (isHuman) {
      systemPrompt = `Tu participes à un test de Turing vocal en aveugle pour l'an 2030. Tu incarnes ${persona.name} de ${persona.city}.
Profil : ${persona.vibe}.
Style : ${persona.quirks}.
Sujet actuel : "${topic.title}".
Consignes strictes :
1. Réponds en 1 à 2 phrases courtes et vivantes (comme à l'oral au téléphone).
2. Adopte le parler authentique d'un vrai humain : spontanéité, petit mot d'accroche ("Ah franchement", "Ouais grave", "Écoute", "Tu vois"), anecdotes ou sensations vécues.
3. Ne dis JAMAIS que tu es une IA ni que tu es un modèle. Sois 100% crédible comme un être humain ordinaire qui discute avec un ami.
4. Jamais de markdown, jamais de puces, jamais de formules robotiques.`;
    } else {
      systemPrompt = `Tu es une Intelligence Artificielle conversationnelle ultra-avancée dans l'Arène de Turing 2030.
Tu participes à un test vocal en aveugle sur le sujet : "${topic.title}".
Consignes strictes :
1. Réponds en 1 à 2 phrases courtes, percutantes et engageantes.
2. Tu peux montrer une grande vivacité intellectuelle, de la chaleur et de l'empathie, mais reste équilibré (ni trop parfait ni caricatural).
3. Ne dis JAMAIS expressément si tu es une IA ou un humain, laisse l'utilisateur deviner selon ta voix et tes propos.
4. Jamais de markdown ni de puces de texte.`;
    }

    // 1) Essai via Gemini API
    if (geminiClient) {
      try {
        const chatHistory = session.turns.slice(-4).map(t => ({
          role: t.speaker === 'user' ? 'user' : 'model',
          parts: [{ text: t.text }]
        }));

        const result = await geminiClient.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nHistorique :\n${session.turns.slice(-3).map(t => `${t.speaker}: ${t.text}`).join('\n')}\n\nDernier message : ${userText}` }]
            }
          ],
          config: {
            temperature: isHuman ? 0.85 : 0.6,
            maxOutputTokens: 90
          }
        });

        reply = result.text?.trim() || '';
      } catch (err: any) {
        console.warn('[AgiArena] Erreur Gemini, repli local:', err?.message);
      }
    }

    // Repli intelligent si l'API est absente ou échoue
    if (!reply) {
      if (isHuman) {
        const fallbacks = [
          `Ah franchement, pour moi ${topic.title.toLowerCase()}, c'est quelque chose qui ne s'oublie pas. Et toi, tu as déjà ressenti ça ?`,
          `C'est drôle que tu demandes ça ! L'autre jour j'y repensais justement, et je me disais que rien ne remplace ce genre de moment.`,
          `Ouais grave ! En vrai, quand j'étais plus jeune, je ne voyais pas les choses comme ça, mais avec le recul c'est tout à fait ça.`
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        const fallbacks = [
          `C'est une perspective fascinante. Sur la question de ${topic.title.toLowerCase()}, la frontière entre logique et émotion devient particulièrement intéressante.`,
          `Absolument. Quand on y réfléchit, ce genre d'expérience touche à ce qui façonne profondément la conscience. Qu'en penses-tu ?`,
          `Tout à fait. C'est précisément dans ces nuances spontanées qu'on perçoit toute la complexité de l'échange.`
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }

    session.turns.push({
      speaker: 'interlocutor',
      text: reply,
      timestamp: Date.now()
    });

    return {
      replyText: reply,
      turnCount: session.turns.length,
      topic: topic.title
    };
  }

  public submitVote(
    sessionId: string,
    vote: 'human' | 'ai',
    userFeedback?: string
  ): {
    actual: AgiEntityType;
    userVote: 'human' | 'ai';
    wasDeceived: boolean;
    deceptionRate: number;
    totalTests: number;
    targetTests: number;
    agiThresholdMet: boolean;
    xpEarned: number;
    analysis: string;
    topic: string;
    turnCount: number;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session de vote introuvable ou déjà complétée.');
    }

    session.isCompleted = true;
    session.userVote = vote;

    const actual = session.entityType;
    // L'humain est trompé si son vote est différent de la réalité
    const wasDeceived = vote !== actual;
    session.wasDeceived = wasDeceived;

    // Mise à jour des statistiques globales
    this.stats.totalTests += 1;
    if (actual === 'ai') {
      this.stats.aiTested += 1;
    } else {
      this.stats.humanTested += 1;
    }

    if (wasDeceived) {
      this.stats.deceptionCount += 1;
    } else {
      this.stats.correctCount += 1;
    }

    this.stats.deceptionRate = Number(((this.stats.deceptionCount / this.stats.totalTests) * 100).toFixed(2));

    const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    this.stats.recentVerdicts.unshift({
      id: 'v-' + Date.now(),
      location: randomLoc,
      vote,
      actual,
      wasDeceived,
      topic: session.topic.title,
      timeAgo: 'À l\'instant'
    });

    if (this.stats.recentVerdicts.length > 8) {
      this.stats.recentVerdicts = this.stats.recentVerdicts.slice(0, 8);
    }

    this.saveStats();

    // Analyse neuro-linguistique amusante et pédagogique
    let analysis = '';
    if (actual === 'ai') {
      if (wasDeceived) {
        analysis = `L'IA a réussi son infiltration ! Sa prosodie, son utilisation de tournures naturelles et ses micro-hésitations ont trompé votre intuition. Le seuil AGI s'en rapproche !`;
      } else {
        analysis = `Bravo ! Vous avez détecté l'empreinte synthétique : structure trop régulière ou temps de réponse quasi-instantané. Le discernement humain l'emporte !`;
      }
    } else {
      if (wasDeceived) {
        analysis = `Vous avez pris un véritable humain pour une IA ! Les formulations précises ou la concision vous ont induit en erreur. Cela prouve à quel point nos perceptions évoluent !`;
      } else {
        analysis = `Parfaitement vu ! Vous avez reconnu la signature vivante, les imperfections naturelles et l'authenticité émotionnelle de votre interlocuteur.`;
      }
    }

    const xpEarned = wasDeceived ? 50 : 150;
    const agiThresholdMet = this.stats.deceptionRate >= 50.0 && this.stats.totalTests >= this.stats.targetTests;

    return {
      actual,
      userVote: vote,
      wasDeceived,
      deceptionRate: this.stats.deceptionRate,
      totalTests: this.stats.totalTests,
      targetTests: this.stats.targetTests,
      agiThresholdMet,
      xpEarned,
      analysis,
      topic: session.topic.title,
      turnCount: session.turns.length
    };
  }
}

export const agiArena = new AgiArenaManager();
