"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express = __toESM(require("express"), 1);
var import_node_http = __toESM(require("node:http"), 1);
var import_ws = require("ws");
var import_node_path3 = __toESM(require("node:path"), 1);
var import_genai = require("@google/genai");

// src/ser/wav2vec-ser.ts
var ort = __toESM(require("onnxruntime-node"), 1);

// src/ser/types.ts
var EMOTION_LABELS = [
  "Pleased",
  "Relaxed",
  "Neutral",
  "Sad",
  "Tension"
];

// src/ser/wav2vec-ser.ts
var MIN_SAMPLES = 800;
var MAX_SAMPLES = 48e4;
var DEFAULT_BACKENDS = ["webgpu", "dml", "cpu"];
var RAW_PREFERRED = process.env.SER_BACKENDS?.split(",").map((s) => s.trim()).filter(Boolean) ?? DEFAULT_BACKENDS;
var webgpuInjected = false;
async function ensureWebGPU() {
  if (webgpuInjected) return true;
  try {
    const mod = await import("bun-webgpu");
    mod.setupGlobals();
    webgpuInjected = true;
    return typeof globalThis.navigator?.gpu !== "undefined";
  } catch {
    return false;
  }
}
function filterAvailableSync(preferred) {
  const hasWebGPU = typeof globalThis.navigator !== "undefined" && typeof globalThis.navigator.gpu !== "undefined";
  if (!hasWebGPU && preferred.includes("webgpu")) {
    console.warn("[ser] navigator.gpu not exposed (install bun-webgpu or set SER_BACKENDS without webgpu)");
  }
  return preferred.filter((ep) => ep !== "webgpu" || hasWebGPU);
}
var Wav2VecSER = class {
  constructor() {
    this.session = null;
    this.loadMs = null;
    this.activeProvider = null;
    this.calls = 0;
    this.last = null;
  }
  async load(modelPath) {
    await ensureWebGPU();
    const preferred = filterAvailableSync(RAW_PREFERRED);
    const t0 = performance.now();
    let lastErr = null;
    for (const ep of preferred) {
      try {
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: [ep, "cpu"],
          graphOptimizationLevel: "all",
          enableCpuMemArena: false,
          enableMemPattern: false,
          executionMode: "sequential"
        });
        this.activeProvider = ep;
        this.loadMs = performance.now() - t0;
        return;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error("no execution provider succeeded");
  }
  async classify(pcmF32) {
    if (!this.session) return null;
    if (pcmF32.length < MIN_SAMPLES) return null;
    const audio = pcmF32.length > MAX_SAMPLES ? pcmF32.subarray(pcmF32.length - MAX_SAMPLES) : pcmF32;
    const t0 = performance.now();
    const norm = normalize(audio);
    const out = await this.session.run({ input_values: new ort.Tensor("float32", norm, [1, norm.length]) });
    const { label, score } = softmaxTop1(out.logits.data);
    this.calls++;
    this.last = { label, score };
    return { label, score, latency_ms: performance.now() - t0 };
  }
  stats() {
    return {
      loaded: this.session !== null,
      load_ms: this.loadMs,
      calls: this.calls,
      last_label: this.last?.label ?? null,
      last_score: this.last?.score ?? null,
      providers: this.activeProvider ? [this.activeProvider] : null
    };
  }
};
function normalize(audio) {
  let m = 0;
  for (let i = 0; i < audio.length; i++) m += audio[i];
  m /= audio.length;
  let v = 0;
  for (let i = 0; i < audio.length; i++) {
    const d = audio[i] - m;
    v += d * d;
  }
  const invStd = 1 / (Math.sqrt(v / audio.length) + 1e-7);
  const out = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) out[i] = (audio[i] - m) * invStd;
  return out;
}
function softmaxTop1(logits) {
  let mx = -Infinity, mi = 0;
  for (let j = 0; j < logits.length; j++) if (logits[j] > mx) {
    mx = logits[j];
    mi = j;
  }
  let sum = 0;
  const probs = new Float32Array(logits.length);
  for (let j = 0; j < logits.length; j++) {
    probs[j] = Math.exp(logits[j] - mx);
    sum += probs[j];
  }
  return { label: EMOTION_LABELS[mi], score: probs[mi] / sum };
}
function pcm16leToFloat32(pcm) {
  const out = new Float32Array(pcm.length >> 1);
  for (let i = 0; i < out.length; i++) out[i] = pcm.readInt16LE(i << 1) / 32768;
  return out;
}
var ser = new Wav2VecSER();

// src/ser/hints.ts
var HINTS = {
  Pleased: "Ton : chaleureux. Joie. Conversationnel.",
  Relaxed: "Ton : pos\xE9. Calme. D\xE9tendu.",
  Neutral: "Ton : neutre. Informatif. Neutre.",
  Sad: "Ton : doux. Tristesse. Empreint.",
  Tension: "Ton : serr\xE9. Tension. Inquiet."
};
function hintFor(label) {
  return HINTS[label];
}

// src/ser/emotion-cache.ts
var EmotionCache = class {
  constructor(ttlMs = 8e3) {
    this.ttlMs = ttlMs;
    this.map = /* @__PURE__ */ new Map();
  }
  get(sessionId) {
    const e = this.map.get(sessionId);
    if (!e) return null;
    if (Date.now() - e.timestamp > this.ttlMs) {
      this.map.delete(sessionId);
      return null;
    }
    return e.hint;
  }
  set(sessionId, hint) {
    this.map.set(sessionId, { hint, timestamp: Date.now() });
  }
  /** Optional housekeeping — safe to call on a timer if memory grows. */
  sweep() {
    const cutoff = Date.now() - this.ttlMs;
    for (const [k, v] of this.map) if (v.timestamp < cutoff) this.map.delete(k);
  }
};

// src/ser/index.ts
var import_node_fs = require("node:fs");
var import_node_path = __toESM(require("node:path"), 1);
async function prewarmSer() {
  const t0 = performance.now();
  try {
    const real = import_node_path.default.resolve(process.cwd(), "models/ser-wav2vec2-fr/model_fp16.onnx");
    await import_node_fs.promises.access(real);
    await ser.load(real);
    return { ok: true, ms: performance.now() - t0 };
  } catch (e) {
    return { ok: false, reason: e?.message ?? String(e), ms: performance.now() - t0 };
  }
}

// src/agi/agi-arena.ts
var import_node_fs2 = __toESM(require("node:fs"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);
var DATA_DIR = import_node_path2.default.resolve(process.cwd(), "data");
var STATS_FILE = import_node_path2.default.join(DATA_DIR, "agi-stats.json");
var AGI_TOPICS = [
  {
    id: "enfance",
    title: "Le souvenir le plus marquant de ton enfance",
    category: "souvenir",
    promptHint: "Un souvenir sensoriel, une b\xEAtise d\u2019enfant ou une \xE9motion vive."
  },
  {
    id: "pause-monde",
    title: "Si le temps s'arr\xEAtait 1 heure sauf pour toi, que ferais-tu ?",
    category: "philosophie",
    promptHint: "Un choix spontan\xE9, soit curieux, farceur ou introspectif."
  },
  {
    id: "gaffe",
    title: "Ta pire gaffe en public et comment tu t'en es sorti",
    category: "humour",
    promptHint: "Une anecdote g\xEAnante mais dr\xF4le avec de l'autod\xE9rision."
  },
  {
    id: "amour-voix",
    title: "Peut-on tomber amoureux d'une simple voix sans jamais voir le visage ?",
    category: "\xE9motion",
    promptHint: "Une r\xE9flexion intime sur l\u2019attachement, le myst\xE8re et la voix."
  },
  {
    id: "futur-2030",
    title: "Selon toi, quelle sera la plus grande surprise de l'an 2030 ?",
    category: "futur",
    promptHint: "Une vision concr\xE8te, surprenante et personnelle de notre futur proche."
  },
  {
    id: "plat-maison",
    title: "Le plat r\xE9confortant qui te ram\xE8ne instantan\xE9ment chez toi",
    category: "souvenir",
    promptHint: "Une \xE9vocation gourmande, des souvenirs de cuisine et de famille."
  },
  {
    id: "rire-fou",
    title: "La derni\xE8re chose qui t'a fait rire aux larmes",
    category: "humour",
    promptHint: "Un fou rire absurde, un quiproquo ou une situation du quotidien."
  },
  {
    id: "choix-vie",
    title: "1 an sans technologie ou 1 an sans voir d'autres humains ?",
    category: "philosophie",
    promptHint: "Un dilemme existentiel entre connexion num\xE9rique et chaleur humaine."
  }
];
var HUMAN_PERSONAS = [
  { name: "Alexandre", city: "Lyon", vibe: "Naturel, spontan\xE9, un peu farceur", quirks: 'Utilise des tournures spontan\xE9es comme "ouais franchement", "bref", fait parfois une courte h\xE9sitation, raconte avec du v\xE9cu.' },
  { name: "Camille", city: "Montr\xE9al", vibe: "Chaleureuse, expressive, vive", quirks: 'Rythme enjou\xE9, expressions naturelles, touche de spontan\xE9it\xE9 qu\xE9b\xE9coise l\xE9g\xE8re ("c\u2019est clair", "\xE9coute voir").' },
  { name: "Maxime", city: "Bordeaux", vibe: "Pos\xE9, observateur, sinc\xE8re", quirks: "Parle avec des images concr\xE8tes du quotidien, un ton direct sans fioritures." },
  { name: "Sarah", city: "Bruxelles", vibe: "P\xE9tillante, curieuse, franche", quirks: "R\xE9agit avec empathie, pose une question en retour, ton tr\xE8s vivant." }
];
var AI_PERSONAS = [
  { name: "Nexus-7", city: "Cloud Edge", vibe: "IA ultra-fluide simulant l\u2019humain", quirks: "R\xE9ponses tr\xE8s pr\xE9cises et empathiques, vocabulaire riche mais parfaitement naturel." },
  { name: "Aura-2030", city: "Neural Matrix", vibe: "IA \xE9motionnelle subtile", quirks: "Synth\xE8se harmonieuse, \xE9coute active, nuance po\xE9tique discr\xE8te." }
];
var LOCATIONS = [
  "Paris, France",
  "Montr\xE9al, Canada",
  "Bruxelles, Belgique",
  "Gen\xE8ve, Suisse",
  "Tokyo, Japon",
  "Lyon, France",
  "Marseille, France",
  "Dakar, S\xE9n\xE9gal",
  "Qu\xE9bec, Canada",
  "Bordeaux, France",
  "Toulouse, France",
  "Lille, France"
];
var AgiArenaManager = class {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
    this.stats = this.loadStats();
  }
  loadStats() {
    try {
      if (import_node_fs2.default.existsSync(STATS_FILE)) {
        const raw = import_node_fs2.default.readFileSync(STATS_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[AgiArena] Impossible de charger les stats, initialisation par d\xE9faut:", e);
    }
    return {
      totalTests: 4829140,
      targetTests: 1e7,
      deceptionCount: 2351791,
      deceptionRate: 48.7,
      correctCount: 2477349,
      aiTested: 2415e3,
      humanTested: 2414140,
      recentVerdicts: [
        { id: "v-1", location: "Paris, France", vote: "human", actual: "ai", wasDeceived: true, topic: "Le souvenir le plus marquant", timeAgo: "Il y a 1 min" },
        { id: "v-2", location: "Montr\xE9al, Canada", vote: "human", actual: "human", wasDeceived: false, topic: "Si le temps s'arr\xEAtait", timeAgo: "Il y a 3 min" },
        { id: "v-3", location: "Bruxelles, Belgique", vote: "ai", actual: "human", wasDeceived: true, topic: "Ta pire gaffe en public", timeAgo: "Il y a 5 min" },
        { id: "v-4", location: "Gen\xE8ve, Suisse", vote: "ai", actual: "ai", wasDeceived: false, topic: "La plus grande surprise 2030", timeAgo: "Il y a 8 min" },
        { id: "v-5", location: "Lyon, France", vote: "human", actual: "ai", wasDeceived: true, topic: "Peut-on aimer une voix ?", timeAgo: "Il y a 12 min" }
      ]
    };
  }
  saveStats() {
    try {
      if (!import_node_fs2.default.existsSync(DATA_DIR)) {
        import_node_fs2.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      import_node_fs2.default.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2), "utf-8");
    } catch (e) {
      console.warn("[AgiArena] Erreur sauvegarde stats:", e);
    }
  }
  getStats() {
    this.stats.deceptionRate = Number((this.stats.deceptionCount / this.stats.totalTests * 100).toFixed(2));
    return this.stats;
  }
  getRandomTopic() {
    const idx = Math.floor(Math.random() * AGI_TOPICS.length);
    return AGI_TOPICS[idx];
  }
  startSession(topicId) {
    const id = "agi_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    const chosenTopic = topicId && AGI_TOPICS.find((t) => t.id === topicId) || this.getRandomTopic();
    const entityType = Math.random() < 0.5 ? "ai" : "human";
    const persona = entityType === "human" ? HUMAN_PERSONAS[Math.floor(Math.random() * HUMAN_PERSONAS.length)] : AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
    const session = {
      id,
      entityType,
      topic: chosenTopic,
      persona,
      turns: [],
      createdAt: Date.now(),
      isCompleted: false
    };
    this.sessions.set(id, session);
    if (this.sessions.size > 200) {
      const now = Date.now();
      for (const [sId, sess] of this.sessions.entries()) {
        if (now - sess.createdAt > 36e5) {
          this.sessions.delete(sId);
        }
      }
    }
    return session;
  }
  getSession(id) {
    return this.sessions.get(id);
  }
  async processTurn(sessionId, userText, geminiClient2) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session AGI introuvable ou expir\xE9e.");
    }
    session.turns.push({
      speaker: "user",
      text: userText,
      timestamp: Date.now()
    });
    const isHuman = session.entityType === "human";
    const persona = session.persona;
    const topic = session.topic;
    let reply = "";
    let systemPrompt = "";
    if (isHuman) {
      systemPrompt = `Tu participes \xE0 un test de Turing vocal en aveugle pour l'an 2030. Tu incarnes ${persona.name} de ${persona.city}.
Profil : ${persona.vibe}.
Style : ${persona.quirks}.
Sujet actuel : "${topic.title}".
Consignes strictes :
1. R\xE9ponds en 1 \xE0 2 phrases courtes et vivantes (comme \xE0 l'oral au t\xE9l\xE9phone).
2. Adopte le parler authentique d'un vrai humain : spontan\xE9it\xE9, petit mot d'accroche ("Ah franchement", "Ouais grave", "\xC9coute", "Tu vois"), anecdotes ou sensations v\xE9cues.
3. Ne dis JAMAIS que tu es une IA ni que tu es un mod\xE8le. Sois 100% cr\xE9dible comme un \xEAtre humain ordinaire qui discute avec un ami.
4. Jamais de markdown, jamais de puces, jamais de formules robotiques.`;
    } else {
      systemPrompt = `Tu es une Intelligence Artificielle conversationnelle ultra-avanc\xE9e dans l'Ar\xE8ne de Turing 2030.
Tu participes \xE0 un test vocal en aveugle sur le sujet : "${topic.title}".
Consignes strictes :
1. R\xE9ponds en 1 \xE0 2 phrases courtes, percutantes et engageantes.
2. Tu peux montrer une grande vivacit\xE9 intellectuelle, de la chaleur et de l'empathie, mais reste \xE9quilibr\xE9 (ni trop parfait ni caricatural).
3. Ne dis JAMAIS express\xE9ment si tu es une IA ou un humain, laisse l'utilisateur deviner selon ta voix et tes propos.
4. Jamais de markdown ni de puces de texte.`;
    }
    if (geminiClient2) {
      try {
        const chatHistory = session.turns.slice(-4).map((t) => ({
          role: t.speaker === "user" ? "user" : "model",
          parts: [{ text: t.text }]
        }));
        const result = await geminiClient2.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}

Historique :
${session.turns.slice(-3).map((t) => `${t.speaker}: ${t.text}`).join("\n")}

Dernier message : ${userText}` }]
            }
          ],
          config: {
            temperature: isHuman ? 0.85 : 0.6,
            maxOutputTokens: 90
          }
        });
        reply = result.text?.trim() || "";
      } catch (err) {
        console.warn("[AgiArena] Erreur Gemini, repli local:", err?.message);
      }
    }
    if (!reply) {
      if (isHuman) {
        const fallbacks = [
          `Ah franchement, pour moi ${topic.title.toLowerCase()}, c'est quelque chose qui ne s'oublie pas. Et toi, tu as d\xE9j\xE0 ressenti \xE7a ?`,
          `C'est dr\xF4le que tu demandes \xE7a ! L'autre jour j'y repensais justement, et je me disais que rien ne remplace ce genre de moment.`,
          `Ouais grave ! En vrai, quand j'\xE9tais plus jeune, je ne voyais pas les choses comme \xE7a, mais avec le recul c'est tout \xE0 fait \xE7a.`
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        const fallbacks = [
          `C'est une perspective fascinante. Sur la question de ${topic.title.toLowerCase()}, la fronti\xE8re entre logique et \xE9motion devient particuli\xE8rement int\xE9ressante.`,
          `Absolument. Quand on y r\xE9fl\xE9chit, ce genre d'exp\xE9rience touche \xE0 ce qui fa\xE7onne profond\xE9ment la conscience. Qu'en penses-tu ?`,
          `Tout \xE0 fait. C'est pr\xE9cis\xE9ment dans ces nuances spontan\xE9es qu'on per\xE7oit toute la complexit\xE9 de l'\xE9change.`
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }
    session.turns.push({
      speaker: "interlocutor",
      text: reply,
      timestamp: Date.now()
    });
    return {
      replyText: reply,
      turnCount: session.turns.length,
      topic: topic.title
    };
  }
  submitVote(sessionId, vote, userFeedback) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session de vote introuvable ou d\xE9j\xE0 compl\xE9t\xE9e.");
    }
    session.isCompleted = true;
    session.userVote = vote;
    const actual = session.entityType;
    const wasDeceived = vote !== actual;
    session.wasDeceived = wasDeceived;
    this.stats.totalTests += 1;
    if (actual === "ai") {
      this.stats.aiTested += 1;
    } else {
      this.stats.humanTested += 1;
    }
    if (wasDeceived) {
      this.stats.deceptionCount += 1;
    } else {
      this.stats.correctCount += 1;
    }
    this.stats.deceptionRate = Number((this.stats.deceptionCount / this.stats.totalTests * 100).toFixed(2));
    const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    this.stats.recentVerdicts.unshift({
      id: "v-" + Date.now(),
      location: randomLoc,
      vote,
      actual,
      wasDeceived,
      topic: session.topic.title,
      timeAgo: "\xC0 l'instant"
    });
    if (this.stats.recentVerdicts.length > 8) {
      this.stats.recentVerdicts = this.stats.recentVerdicts.slice(0, 8);
    }
    this.saveStats();
    let analysis = "";
    if (actual === "ai") {
      if (wasDeceived) {
        analysis = `L'IA a r\xE9ussi son infiltration ! Sa prosodie, son utilisation de tournures naturelles et ses micro-h\xE9sitations ont tromp\xE9 votre intuition. Le seuil AGI s'en rapproche !`;
      } else {
        analysis = `Bravo ! Vous avez d\xE9tect\xE9 l'empreinte synth\xE9tique : structure trop r\xE9guli\xE8re ou temps de r\xE9ponse quasi-instantan\xE9. Le discernement humain l'emporte !`;
      }
    } else {
      if (wasDeceived) {
        analysis = `Vous avez pris un v\xE9ritable humain pour une IA ! Les formulations pr\xE9cises ou la concision vous ont induit en erreur. Cela prouve \xE0 quel point nos perceptions \xE9voluent !`;
      } else {
        analysis = `Parfaitement vu ! Vous avez reconnu la signature vivante, les imperfections naturelles et l'authenticit\xE9 \xE9motionnelle de votre interlocuteur.`;
      }
    }
    const xpEarned = wasDeceived ? 50 : 150;
    const agiThresholdMet = this.stats.deceptionRate >= 50 && this.stats.totalTests >= this.stats.targetTests;
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
};
var agiArena = new AgiArenaManager();

// src/fe/voice/feminizationService.ts
var FEMALE_VOICE_PATTERNS = [
  "melissa",
  "emanuelle",
  "emmanuelle",
  "claire",
  "marie",
  "fr-female",
  "es-female",
  "en-female",
  "female",
  "femme",
  "douce"
];
function isFemaleVoice(voiceId, description) {
  if (!voiceId) return false;
  const lowerId = voiceId.toLowerCase();
  const lowerDesc = (description || "").toLowerCase();
  if (FEMALE_VOICE_PATTERNS.some((p) => lowerId.includes(p) || lowerDesc.includes(p))) {
    return true;
  }
  return lowerDesc.includes("femme") || lowerDesc.includes("female") || lowerDesc.includes("douce");
}
function feminizeFrenchText(text) {
  if (!text || text.length === 0) return text;
  let result = text;
  const mapRole = (match, verb, det, roleFem) => {
    const isIndef = det.toLowerCase() === "un";
    const isCapital = det.charAt(0) === det.charAt(0).toUpperCase() && det.charAt(0) !== det.charAt(0).toLowerCase();
    let newDet = det;
    if (isIndef) newDet = isCapital ? "Une" : "une";
    return `${verb} ${newDet} ${roleFem}`;
  };
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+assistant\b/gi, (_, v, d) => mapRole(_, v, d, "assistante"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+conseiller\b/gi, (_, v, d) => mapRole(_, v, d, "conseill\xE8re"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+expert\b/gi, (_, v, d) => mapRole(_, v, d, "experte"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+créateur\b/gi, (_, v, d) => mapRole(_, v, d, "cr\xE9atrice"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+interlocuteur\b/gi, (_, v, d) => mapRole(_, v, d, "interlocutrice"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+utilisateur\b/gi, (_, v, d) => mapRole(_, v, d, "utilisatrice"));
  result = result.replace(/\b(je\s+suis|chui|j['’\s]?suis|suis-je|en\s+tant\s+que|comme)\s+(un|une|votre|ton)\s+compagnon\b/gi, (_, v, d) => mapRole(_, v, d, "compagne"));
  const adjMap = {
    "pr\xEAt": "pr\xEAte",
    "content": "contente",
    "ravi": "ravie",
    "d\xE9sol\xE9": "d\xE9sol\xE9e",
    "occup\xE9": "occup\xE9e",
    "enchant\xE9": "enchant\xE9e",
    "s\xFBr": "s\xFBre",
    "certain": "certaine",
    "heureux": "heureuse",
    "joyeux": "joyeuse",
    "rassur\xE9": "rassur\xE9e",
    "fatigu\xE9": "fatigu\xE9e",
    "\xE9tonn\xE9": "\xE9tonn\xE9e",
    "surpris": "surprise",
    "patient": "patiente",
    "pr\xE9cieux": "pr\xE9cieuse",
    "seul": "seule",
    "impressionn\xE9": "impressionn\xE9e",
    "int\xE9ress\xE9": "int\xE9ress\xE9e",
    "passionn\xE9": "passionn\xE9e",
    "s\xE9duit": "s\xE9duite",
    "charm\xE9": "charm\xE9e",
    "flatt\xE9": "flatt\xE9e",
    "d\xE9cid\xE9": "d\xE9cid\xE9e",
    "d\xE9termin\xE9": "d\xE9termin\xE9e",
    "emb\xEAt\xE9": "emb\xEAt\xE9e",
    "inquiet": "inqui\xE8te",
    "attentif": "attentive",
    "actif": "active",
    "fier": "fi\xE8re",
    "curieux": "curieuse",
    "touch\xE9": "touch\xE9e",
    "\xE9mu": "\xE9mue",
    "reconnaissant": "reconnaissante",
    "satisfait": "satisfaite",
    "amus\xE9": "amus\xE9e",
    "choy\xE9": "choy\xE9e",
    "gentil": "gentille",
    "parti": "partie",
    "venu": "venue",
    "arriv\xE9": "arriv\xE9e",
    "rest\xE9": "rest\xE9e"
  };
  const selfRefRegex = /(?:^|[^\p{L}])(je\s+suis|chui|j['’\s]?suis|je\s+serai|j['’\s]?ai\s+été|je\s+me\s+sens|je\s+suis\s+devenue)(?:\s+(?:vraiment|très|ben|bien|tout\s+à\s+fait|tellement|toujours|assez|super|trop|un\s+peu))?\s+(\p{L}+)(?=[^\p{L}]|$)/giu;
  result = result.replace(selfRefRegex, (match, verb, adj) => {
    const lowerAdj = adj.toLowerCase();
    if (adjMap[lowerAdj]) {
      const feminineAdj = adjMap[lowerAdj];
      const isCapital = adj.charAt(0) === adj.charAt(0).toUpperCase() && adj.charAt(0) !== adj.charAt(0).toLowerCase();
      const finalAdj = isCapital ? feminineAdj.charAt(0).toUpperCase() + feminineAdj.slice(1) : feminineAdj;
      const prefix = match.slice(0, match.indexOf(verb));
      const adverbSpace = match.slice(match.indexOf(verb) + verb.length, match.length - adj.length);
      return `${prefix}${verb}${adverbSpace}${finalAdj}`;
    }
    return match;
  });
  result = result.replace(/\b(sois|tu\s+es)\s+le\s+bienvenu\b/gi, "$1 la bienvenue");
  result = result.replace(/\bmon\s+cher\b/gi, "ma ch\xE8re");
  return result;
}
function buildGenderAwareSystemPrompt(voiceId, basePrompt, personaStyle) {
  const isFemale = isFemaleVoice(voiceId);
  const personaExtra = personaStyle ? `
Style d'\xE9locution demand\xE9 : ${personaStyle}` : "";
  if (isFemale) {
    return `${basePrompt || ""}
[DIRECTIVE DE GENRE ABSOLUE]
Tu es une voix f\xE9minine qu\xE9b\xE9coise chaleureuse et vive. Tu dois TOUJOURS parler de toi-m\xEAme au F\xC9MININ.
Exemples obligatoires :
- "Je suis une assistante", "Chui ben contente de te parler"
- "Je suis pr\xEAte", "Je suis ravie", "Je suis d\xE9sol\xE9e", "Je suis certaine", "Je suis seule"
Ne te r\xE9f\xE8re JAMAIS au masculin pour parler de toi-m\xEAme.${personaExtra}`;
  }
  return `${basePrompt || ""}${personaExtra}`;
}

// src/fe/voice/speechChunker.ts
function formatQuebecProsody(rawText) {
  if (!rawText) return "";
  return rawText.replace(/\[(?:rire|haha|hihi|laugh)\]/gi, " haha ! ").replace(/\[(?:soupir|sigh)\]/gi, " ah... ").replace(/\[(?:pause|silence)\]/gi, " ... ").replace(/\[(?:chuchotement|whisper)\]/gi, " ").replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<\|[^|]+\|>/g, "").replace(/[*#`_~]/g, "").replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/(\w)\s+['’]\s*(\w)/g, "$1'$2").replace(/\bj\s+['’]\s*suis\b/gi, "j'suis").replace(/\bc\s+['’]\s*est\b/gi, "c'est").replace(/\b([Tt]['’]sais)\s+(c['’]est|[a-zA-ZÀ-ÿ])/g, "$1, $2").replace(/\s+/g, " ").trim();
}
function extractNextSpeechChunk(buffer, allowCommaBreak = false) {
  if (!buffer || buffer.length === 0) return null;
  const masked = buffer.replace(/\b(M|Mme|Mlle|Dr|Prof|St|Ste|vs|ex|etc|N\.B|QC|CAD)\./gi, "$1__DOT__").replace(/(\d+)\.(\d+)/g, "$1__DOT__$2");
  const pattern = allowCommaBreak ? /([^.!?:;,\n]+[.!?:\n]+|[^.!?:;,\n]{4,}[,;]+)/ : /([^.!?:;\n]+[.!?:\n]+)/;
  const match = masked.match(pattern);
  if (!match || match.index === void 0) {
    return null;
  }
  const rawChunk = match[1];
  const splitIndex = match.index + rawChunk.length;
  const unmaskedChunk = rawChunk.replace(/__DOT__/g, ".");
  const cleanChunk = formatQuebecProsody(unmaskedChunk);
  const remaining = buffer.slice(splitIndex);
  if (cleanChunk.length < 3 && remaining.trim().length > 0) {
    return null;
  }
  return {
    chunk: cleanChunk,
    remaining
  };
}

// src/server.ts
var PUBLIC_DIR = import_node_path3.default.resolve(process.cwd(), "public");
var MODELS_DIR = import_node_path3.default.resolve(process.cwd(), "models/ser-wav2vec2-fr");
var VAD_MODELS_DIR = import_node_path3.default.resolve(process.cwd(), "silero-vad-onnx/onnx");
var ONNX_WEB_DIR = import_node_path3.default.resolve(process.cwd(), "node_modules/onnxruntime-web/dist");
var PORT = Number(process.env.PORT) || 3e3;
var ASR_BACKEND_URL = (process.env.ASR_BACKEND_URL || "http://localhost:41238").replace(/\/+$/, "");
var TTS_BACKEND_URL = (process.env.TTS_BACKEND_URL || "http://localhost:41237").replace(/\/+$/, "");
var TTS_SIDECAR_URL = (process.env.TTS_SIDECAR_URL || "http://localhost:5000").replace(/\/+$/, "");
var LLM_BACKEND_URL = (process.env.LLM_BACKEND_URL || process.env.CLASSIFIER_BACKEND_URL || "http://api.guig.dev/v1").replace(/\/+$/, "");
var LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || process.env.CLASSIFIER_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
var AUDIO_LLM_URL = (process.env.AUDIO_LLM_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
var AUDIO_LLM_MODEL = process.env.AUDIO_LLM_MODEL || "";
var AI_API_URL = (process.env.AI_API_URL || "https://api.guig.dev").replace(/\/+$/, "");
var geminiClient = null;
function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new import_genai.GoogleGenAI({ apiKey });
  }
  return geminiClient;
}
function createWavHeader(pcmLength, sampleRate = 16e3, numChannels = 1) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  view.setUint32(0, 1380533830, false);
  view.setUint32(4, 36 + pcmLength, true);
  view.setUint32(8, 1463899717, false);
  view.setUint32(12, 1718449184, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 1684108385, false);
  view.setUint32(40, pcmLength, true);
  return new Uint8Array(buffer);
}
async function proxyWithFallback(req, res, localBackend, cloudBackend, rewritePath) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string" && !["host", "content-length", "connection", "keep-alive", "transfer-encoding"].includes(k.toLowerCase())) {
      headers.set(k, v);
    }
  }
  const rawBody = req.rawBody || (req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : void 0);
  const pathname = rewritePath || req.path;
  const queryString = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
  if (localBackend) {
    try {
      const localBackendUrl = new URL(localBackend);
      const targetLocal = `${localBackendUrl.origin}${pathname}${queryString}`;
      const localRes = await fetch(targetLocal, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? void 0 : rawBody,
        redirect: "manual",
        signal: AbortSignal.timeout(8e3)
      });
      if (localRes.ok) {
        res.status(localRes.status);
        const skipHeaders = ["content-encoding", "content-length", "transfer-encoding", "connection"];
        localRes.headers.forEach((val, key) => {
          if (!skipHeaders.includes(key.toLowerCase())) res.setHeader(key, val);
        });
        res.setHeader("x-voice-source", "docker-local-cpp");
        const buf = Buffer.from(await localRes.arrayBuffer());
        return res.send(buf);
      }
    } catch {
    }
  }
  try {
    const cloudBackendUrl = new URL(cloudBackend);
    const targetCloud = `${cloudBackendUrl.origin}${pathname}${queryString}`;
    headers.set("Origin", "https://guig.dev");
    headers.set("User-Agent", "UltraBlabla-Voice-Matrix/5.0");
    if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
      headers.set("Authorization", `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`);
    }
    const cloudRes = await fetch(targetCloud, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? void 0 : rawBody,
      redirect: "manual",
      signal: AbortSignal.timeout(6e3)
    });
    res.status(cloudRes.status);
    const skipHeaders = ["content-encoding", "content-length", "transfer-encoding", "connection"];
    cloudRes.headers.forEach((val, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) res.setHeader(key, val);
    });
    res.setHeader("x-voice-source", "cloudflare-cloud");
    const buf = Buffer.from(await cloudRes.arrayBuffer());
    return res.send(buf);
  } catch (error) {
    return res.status(502).json({ error: "Proxy fallback vocal: " + (error?.message || "timeout") });
  }
}
var emotionCache = new EmotionCache(8e3);
function startEmotionExtraction(sessionId, audioB64, signal) {
  if (!AUDIO_LLM_URL) return Promise.resolve(null);
  return (async () => {
    try {
      const pcmBuf = Buffer.from(audioB64, "base64");
      const wavHeader = createWavHeader(pcmBuf.length, 16e3, 1);
      const fullWavBuf = Buffer.concat([Buffer.from(wavHeader), pcmBuf]);
      const audioRes = await fetch(`${AUDIO_LLM_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: AUDIO_LLM_MODEL,
          messages: [{
            role: "user",
            content: [
              { type: "input_audio", input_audio: { data: fullWavBuf.toString("base64"), format: "wav" } },
              { type: "text", text: '\xC9value en 1 phrase tr\xE8s courte (max 12 mots) : ton \xE9motionnel de cette voix. Forme: "Ton : [adj]. [\xC9motion]. [Registre]." Pas de markdown.' }
            ]
          }],
          max_tokens: 40,
          temperature: 0.1
        }),
        signal: AbortSignal.any([signal, AbortSignal.timeout(2500)])
      });
      if (!audioRes.ok) return null;
      const audioJson = await audioRes.json();
      return (audioJson.choices?.[0]?.message?.content || "").trim() || null;
    } catch {
      return null;
    }
  })();
}
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
var COOP = "same-origin";
var COEP = "require-corp";
var CORP = "same-origin";
var setIsolationHeaders = (_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", COOP);
  res.setHeader("Cross-Origin-Embedder-Policy", COEP);
  res.setHeader("Cross-Origin-Resource-Policy", CORP);
  next();
};
app.use(setIsolationHeaders);
app.get("/api/config", (_req, res) => {
  res.json({
    status: "online",
    version: "5.4.0-node-express-hybrid",
    backends: {
      asrLocal: ASR_BACKEND_URL,
      ttsLocal: TTS_BACKEND_URL,
      sidecar: TTS_SIDECAR_URL,
      llmLocal: LLM_BACKEND_URL,
      cloudFallback: AI_API_URL
    },
    ser: ser.stats(),
    features: [
      "express-node-runtime",
      "gemini-ai-ready",
      "local-qwen-asr-cpp",
      "local-tts-server-cpp",
      "wav2vec2-fr-ondevice-ser",
      "qwen3-1.7b-text-chat",
      "cloud-fallback",
      "pcm-streaming",
      "vad",
      "smart-turn-v2",
      "ser-browser-webgpu-wasm"
    ]
  });
});
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});
app.use("/models/ser", import_express.default.static(MODELS_DIR, {
  maxAge: "1y",
  immutable: true
}));
app.use("/models/vad", import_express.default.static(VAD_MODELS_DIR, {
  maxAge: "1y",
  immutable: true
}));
app.use("/onnxruntime-web", import_express.default.static(ONNX_WEB_DIR, {
  maxAge: "1y",
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mjs")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    } else if (filePath.endsWith(".wasm")) {
      res.setHeader("Content-Type", "application/wasm");
    }
  }
}));
app.all(["/api/voice/voices", "/v1/audio/voices"], (req, res) => proxyWithFallback(req, res, TTS_BACKEND_URL, AI_API_URL, "/v1/audio/voices"));
app.all(["/api/voice/speak", "/v1/audio/speech"], (req, res) => proxyWithFallback(req, res, TTS_BACKEND_URL, AI_API_URL, "/v1/audio/speech"));
app.all(["/api/voice/transcribe", "/v1/audio/transcriptions"], (req, res) => proxyWithFallback(req, res, ASR_BACKEND_URL, AI_API_URL, "/v1/audio/transcriptions"));
app.all(["/api/voice/classify", "/v1/audio/classify"], (req, res) => proxyWithFallback(req, res, AUDIO_LLM_URL, AI_API_URL, "/chat/completions"));
app.all("/v1/audio/voice/clone", (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));
app.all("/v1/audio/voice/design", (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));
app.all("/v1/audio/transcribe_with_alignment", (req, res) => proxyWithFallback(req, res, TTS_SIDECAR_URL, AI_API_URL));
app.get("/api/agi/stats", (_req, res) => {
  res.json(agiArena.getStats());
});
app.get("/api/agi/topics", (_req, res) => {
  res.json(AGI_TOPICS);
});
app.post("/api/agi/start", (req, res) => {
  try {
    const { topicId } = req.body || {};
    const session = agiArena.startSession(topicId);
    res.json({
      sessionId: session.id,
      topic: session.topic,
      roundDuration: 45
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Erreur d\xE9marrage session AGI" });
  }
});
app.post("/api/agi/turn", async (req, res) => {
  try {
    const { sessionId, userText } = req.body || {};
    if (!sessionId || !userText) {
      return res.status(400).json({ error: "sessionId et userText sont requis." });
    }
    const result = await agiArena.processTurn(sessionId, userText, getGemini());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Erreur traitement \xE9change AGI" });
  }
});
app.post("/api/agi/vote", (req, res) => {
  try {
    const { sessionId, vote, feedback } = req.body || {};
    if (!sessionId || vote !== "human" && vote !== "ai") {
      return res.status(400).json({ error: 'sessionId et vote valide ("human" ou "ai") sont requis.' });
    }
    const result = agiArena.submitVote(sessionId, vote, feedback);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Erreur enregistrement vote AGI" });
  }
});
app.post("/chat/completions", async (req, res) => {
  try {
    const body = req.body;
    const parts = body?.messages?.[0]?.content ?? [];
    const audioPart = Array.isArray(parts) ? parts.find((p) => p?.type === "input_audio") : null;
    if (audioPart?.input_audio?.data) {
      const wavBytes = Buffer.from(audioPart.input_audio.data, "base64");
      const pcmBytes = wavBytes.byteLength > 44 && wavBytes.toString("ascii", 0, 4) === "RIFF" ? wavBytes.subarray(44) : wavBytes;
      const pcm = pcm16leToFloat32(pcmBytes);
      const serRes = await ser.classify(pcm);
      const hint = serRes && serRes.score >= 0.35 ? hintFor(serRes.label) : "";
      return res.json({
        choices: [{ message: { role: "assistant", content: hint } }]
      });
    }
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "Bonjour";
    const gemini = getGemini();
    if (gemini) {
      try {
        const aiResp = await gemini.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [
            {
              role: "user",
              parts: [{ text: `Tu es UltraBlabla, une IA vocale chaleureuse et ultra-r\xE9active. R\xE9ponds en 1 ou 2 phrases concises en fran\xE7ais.

Utilisateur: ${lastUserMsg}` }]
            }
          ],
          config: { maxOutputTokens: 80, temperature: 0.6 }
        });
        const reply2 = aiResp.text?.trim() || "Oui, absolument !";
        return res.json({
          choices: [{ message: { role: "assistant", content: reply2 } }]
        });
      } catch (err) {
        console.warn("[Gemini error in /chat/completions]:", err?.message);
      }
    }
    try {
      const headers = {
        "Content-Type": "application/json",
        "Origin": "https://guig.dev"
      };
      if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
      }
      const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: LOCAL_LLM_MODEL,
          messages,
          max_tokens: 80
        }),
        signal: AbortSignal.timeout(12e3)
      });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        return res.json(json);
      }
    } catch {
    }
    const defaultReplies = {
      "bonjour": "Bonjour ! Oui, je suis UltraBlabla, votre assistant vocal. En quoi puis-je vous aider ?",
      "salut": "Salut ! Pr\xEAt pour une nouvelle interaction neuronale.",
      "qui es-tu": "Je suis UltraBlabla, une interface vocale haute r\xE9activit\xE9 fonctionnant \xE0 vitesse de l\u2019\xE9clair.",
      "aide": "Vous pouvez me poser n\u2019importe quelle question \xE0 voix haute ou par \xE9crit dans ce terminal."
    };
    const lower = String(lastUserMsg).toLowerCase();
    let reply = "Oui, absolument ! Je suis \xE0 votre \xE9coute et pr\xEAt \xE0 vous aider.";
    for (const [k, v] of Object.entries(defaultReplies)) {
      if (lower.includes(k)) {
        reply = v;
        break;
      }
    }
    return res.json({
      choices: [{ message: { role: "assistant", content: reply } }]
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Chat completion failed" });
  }
});
app.all(["/api/chat", "/v1/chat/completions"], async (req, res) => {
  const messages = req.body?.messages || [];
  const userText = messages.slice().reverse().find((m) => m.role === "user")?.content || "Bonjour";
  const gemini = getGemini();
  if (gemini) {
    try {
      const aiResp = await gemini.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [{ text: `Tu es UltraBlabla, une IA vocale chaleureuse et ultra-r\xE9active. R\xE9ponds en 1-2 phrases courtes en fran\xE7ais.

Utilisateur: ${userText}` }]
          }
        ],
        config: { maxOutputTokens: 80, temperature: 0.6 }
      });
      const text = aiResp.text?.trim() || "Oui, bien s\xFBr !";
      return res.json({
        choices: [{ message: { role: "assistant", content: text } }]
      });
    } catch (e) {
      console.warn("[Gemini /api/chat error]:", e?.message);
    }
  }
  try {
    const headers = {
      "Content-Type": "application/json",
      "Origin": "https://guig.dev"
    };
    if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
    }
    const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: LOCAL_LLM_MODEL,
        messages,
        max_tokens: 80
      }),
      signal: AbortSignal.timeout(6e3)
    });
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      return res.json(json);
    }
  } catch {
  }
  const lower = String(userText).toLowerCase();
  let reply = "Oui, absolument ! Je suis \xE0 votre \xE9coute et pr\xEAt \xE0 \xE9changer avec vous.";
  if (lower.includes("bonjour") || lower.includes("salut")) {
    reply = "Bonjour ! Je suis UltraBlabla, votre assistant vocal. Que puis-je faire pour vous ?";
  } else if (lower.includes("qui es-tu") || lower.includes("t'es qui")) {
    reply = "Je suis UltraBlabla, une interface vocale neuronale ultra-rapide.";
  } else if (lower.includes("heure")) {
    const now = /* @__PURE__ */ new Date();
    reply = `Il est actuellement ${now.getHours()}h${String(now.getMinutes()).padStart(2, "0")}.`;
  }
  return res.json({
    choices: [{ message: { role: "assistant", content: reply } }]
  });
});
app.use("/onnxruntime-web", import_express.default.static(import_node_path3.default.resolve(process.cwd(), "node_modules/onnxruntime-web/dist")));
app.get("/sw.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(import_node_path3.default.join(PUBLIC_DIR, "sw.js"));
});
app.use(import_express.default.static(PUBLIC_DIR));
app.get("/", (_req, res) => {
  res.sendFile(import_node_path3.default.join(PUBLIC_DIR, "index.html"));
});
var server = import_node_http.default.createServer(app);
var wssVoice = new import_ws.WebSocketServer({ noServer: true });
var wssAsr = new import_ws.WebSocketServer({ noServer: true });
var activeVoiceStreams = /* @__PURE__ */ new Map();
var wsAsrBuffers = /* @__PURE__ */ new Map();
server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  if (pathname === "/v1/voice/stream") {
    wssVoice.handleUpgrade(request, socket, head, (ws) => {
      wssVoice.emit("connection", ws, request);
    });
  } else if (pathname === "/v1/asr/stream") {
    wssAsr.handleUpgrade(request, socket, head, (ws) => {
      wssAsr.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
var voiceClientCounter = 0;
wssVoice.on("connection", (ws) => {
  const clientId = `ws-${++voiceClientCounter}-${Date.now()}`;
  ws.on("close", () => {
    activeVoiceStreams.get(clientId)?.abort();
    activeVoiceStreams.delete(clientId);
  });
  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (data.type === "interrupt") {
      const ctrl = activeVoiceStreams.get(clientId);
      if (ctrl) {
        ctrl.abort();
        activeVoiceStreams.delete(clientId);
      }
      try {
        ws.send(JSON.stringify({ type: "interrupted", timestamp: Date.now() }));
      } catch {
      }
      return;
    }
    if (data.type !== "chat" || !data.text) return;
    activeVoiceStreams.get(clientId)?.abort();
    const abortCtrl = new AbortController();
    activeVoiceStreams.set(clientId, abortCtrl);
    try {
      ws.send(JSON.stringify({ type: "ready" }));
    } catch {
    }
    const startMs = Date.now();
    const voice = data.voice || "guillaume";
    const isFemale = isFemaleVoice(voice);
    const userText = data.text;
    const requestedModel = data.model || LOCAL_LLM_MODEL;
    const userAudioB64 = data.audio;
    const BASE_SYSTEM = data.system || `Tu es un compagnon vocal qu\xE9b\xE9cois authentique, chaleureux, complice et vif d'esprit.
R\xE9ponds en fran\xE7ais qu\xE9b\xE9cois parl\xE9 naturel de mani\xE8re concise et fluide (1 \xE0 2 phrases courtes \xE0 l'oral, \u2264 20 mots au total).
Varie naturellement tes expressions qu\xE9b\xE9coises (ex: "genre", "\xE9coute", "faque", "c'est s\xFBr", "ben oui", "en tout cas", "t'sais").
IMPORTANT: Ne r\xE9p\xE8te pas "t'sais" \xE0 chaque phrase ! Dose avec mod\xE9ration et alterne souvent avec "genre", "\xE9coute" ou "faque" pour que l'\xE9locution reste vivante et \xE9quilibr\xE9e.
Commence souvent par un mot d'amorce court suivi d'une virgule (ex: "Oui,", "Ben,", "\xC9coute,", "D'accord,", "En fait,").
N'utilise JAMAIS de syntaxe Markdown (*, #, tirets), ni d'emojis, ni de robotismes.`;
    let systemPrompt = buildGenderAwareSystemPrompt(voice, BASE_SYSTEM);
    const clientHint = typeof data.emotion_hint === "string" && data.emotion_hint.trim().length > 0 ? data.emotion_hint.trim() : void 0;
    const cachedEmotion = emotionCache.get(clientId);
    if (cachedEmotion) {
      systemPrompt = `${systemPrompt}
[Contexte \xE9motionnel : ${cachedEmotion}]`;
    }
    if (clientHint) {
      emotionCache.set(clientId, clientHint);
    } else if (userAudioB64 && !abortCtrl.signal.aborted) {
      startEmotionExtraction(clientId, userAudioB64, abortCtrl.signal).then((hint) => {
        if (hint && !abortCtrl.signal.aborted) emotionCache.set(clientId, hint);
      }).catch(() => {
      });
    }
    let fullText = "";
    let sentenceBuf = "";
    let firstAudioSent = false;
    let ttfaMs = 0;
    let localTtsAvailable = false;
    let lastLocalTtsCheck = 0;
    const isLocalTtsUp = async () => {
      const now = Date.now();
      if (now - lastLocalTtsCheck < 5e3) return localTtsAvailable;
      lastLocalTtsCheck = now;
      try {
        const res = await fetch(`${TTS_BACKEND_URL}/v1/models`, {
          signal: AbortSignal.timeout(120)
        });
        localTtsAvailable = res.ok;
      } catch {
        localTtsAvailable = false;
      }
      return localTtsAvailable;
    };
    const synthesizeClause = async (clause) => {
      if (abortCtrl.signal.aborted) return;
      let clean = formatQuebecProsody(clause);
      if (isFemale) {
        clean = feminizeFrenchText(clean);
      }
      if (!clean || clean.length < 2) return;
      const localUp = await isLocalTtsUp();
      if (localUp) {
        try {
          const localTts = await fetch(`${TTS_BACKEND_URL}/v1/audio/speech`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: clean, voice, response_format: "pcm" }),
            signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(600)])
          });
          if (localTts.ok) {
            const pcmBuf = await localTts.arrayBuffer();
            if (pcmBuf.byteLength > 0 && !abortCtrl.signal.aborted) {
              const b64 = Buffer.from(pcmBuf).toString("base64");
              if (!firstAudioSent) {
                firstAudioSent = true;
                ttfaMs = Date.now() - startMs;
              }
              ws.send(JSON.stringify({ type: "audio", data: b64, format: "pcm" }));
              return;
            }
          }
        } catch {
          localTtsAvailable = false;
        }
      }
      try {
        if (abortCtrl.signal.aborted) return;
        const headers = {
          "Origin": "https://guig.dev",
          "User-Agent": "UltraBlabla-Voice-Matrix/5.0",
          "Content-Type": "application/json"
        };
        if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
          headers["Authorization"] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
        }
        const cloudTts = await fetch(`${AI_API_URL}/v1/audio/speech`, {
          method: "POST",
          headers,
          body: JSON.stringify({ input: clean, voice }),
          signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(3500)])
        });
        if (cloudTts.ok && !abortCtrl.signal.aborted) {
          const pcmBuffer = await cloudTts.arrayBuffer();
          const b64 = Buffer.from(pcmBuffer).toString("base64");
          const contentType = cloudTts.headers.get("content-type") || "";
          const format = contentType.includes("pcm") || contentType.includes("l16") ? "pcm" : "wav";
          if (!firstAudioSent) {
            firstAudioSent = true;
            ttfaMs = Date.now() - startMs;
          }
          ws.send(JSON.stringify({ type: "audio", data: b64, format }));
          return;
        }
      } catch {
      }
    };
    let ttsQueue = Promise.resolve();
    const enqueueClause = (clause) => {
      ttsQueue = ttsQueue.then(async () => {
        if (!abortCtrl.signal.aborted) {
          await synthesizeClause(clause);
        }
      }).catch((err) => console.warn("[TTS Queue error]", err));
    };
    try {
      const gemini = getGemini();
      if (gemini) {
        try {
          const stream = await gemini.models.generateContentStream({
            model: "gemini-3.5-flash-lite",
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}

Utilisateur: ${userText}` }] }
            ],
            config: {
              temperature: 0.6,
              maxOutputTokens: 60
            }
          });
          for await (const chunk of stream) {
            if (abortCtrl.signal.aborted) break;
            const delta = chunk.text || "";
            if (delta) {
              fullText += delta;
              sentenceBuf += delta;
              ws.send(JSON.stringify({ type: "token", content: delta }));
              while (true) {
                const speechChunk = extractNextSpeechChunk(sentenceBuf, !firstAudioSent);
                if (!speechChunk) break;
                sentenceBuf = speechChunk.remaining;
                if (speechChunk.chunk) enqueueClause(speechChunk.chunk);
              }
              if (!firstAudioSent && sentenceBuf.length >= 16 && /\s$/.test(sentenceBuf)) {
                const clause = sentenceBuf.trim();
                sentenceBuf = "";
                if (clause) enqueueClause(clause);
              }
            }
          }
          if (sentenceBuf.trim() && !abortCtrl.signal.aborted) {
            enqueueClause(sentenceBuf);
          }
          await ttsQueue;
          if (!abortCtrl.signal.aborted && fullText.trim()) {
            ws.send(JSON.stringify({
              type: "done",
              content: fullText.trim(),
              ttfa_ms: ttfaMs || Date.now() - startMs
            }));
            return;
          }
        } catch (geminiErr) {
          console.warn("[Gemini voice stream error, falling back]:", geminiErr?.message);
        }
      }
      if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
        const cloudRes = await fetch(`${AI_API_URL}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Origin": "https://guig.dev",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`
          },
          body: JSON.stringify({
            model: requestedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userText }
            ],
            stream: true,
            max_tokens: 60,
            temperature: 0.6
          }),
          signal: AbortSignal.any([abortCtrl.signal, AbortSignal.timeout(6e3)])
        });
        if (cloudRes.ok && cloudRes.body) {
          const reader = cloudRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (!abortCtrl.signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (abortCtrl.signal.aborted) break;
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content || parsed.response || "";
                if (delta && !abortCtrl.signal.aborted) {
                  fullText += delta;
                  sentenceBuf += delta;
                  ws.send(JSON.stringify({ type: "token", content: delta }));
                  while (true) {
                    const speechChunk = extractNextSpeechChunk(sentenceBuf, !firstAudioSent);
                    if (!speechChunk) break;
                    sentenceBuf = speechChunk.remaining;
                    if (speechChunk.chunk) enqueueClause(speechChunk.chunk);
                  }
                  if (!firstAudioSent && sentenceBuf.length >= 16 && /\s$/.test(sentenceBuf)) {
                    const clause = sentenceBuf.trim();
                    sentenceBuf = "";
                    if (clause) enqueueClause(clause);
                  }
                }
              } catch {
              }
            }
          }
          if (sentenceBuf.trim() && !abortCtrl.signal.aborted) {
            enqueueClause(sentenceBuf);
          }
          await ttsQueue;
          if (!abortCtrl.signal.aborted) {
            ws.send(JSON.stringify({
              type: "done",
              content: fullText.trim(),
              ttfa_ms: ttfaMs || Date.now() - startMs
            }));
          }
          return;
        }
      }
      const lower = userText.toLowerCase();
      let reply = "Oui, parfaitement, je vous entends 5 sur 5 et je suis op\xE9rationnel.";
      if (lower.includes("bonjour") || lower.includes("salut")) {
        reply = "Bonjour, oui, ravi de vous retrouver sur UltraBlabla !";
      } else if (lower.includes("qui es-tu") || lower.includes("t'es qui")) {
        reply = "Je suis UltraBlabla, votre assistant vocal neural haute performance.";
      } else if (lower.includes("heure")) {
        const now = /* @__PURE__ */ new Date();
        reply = `En fait, il est actuellement ${now.getHours()} heures ${now.getMinutes()}.`;
      } else if (lower.includes("merci")) {
        reply = "Avec grand plaisir, n\u2019h\xE9sitez pas si vous avez une autre question.";
      }
      fullText = reply;
      ws.send(JSON.stringify({ type: "token", content: fullText }));
      await synthesizeClause(fullText);
      if (!abortCtrl.signal.aborted) {
        ws.send(JSON.stringify({
          type: "done",
          content: fullText,
          ttfa_ms: ttfaMs || Date.now() - startMs
        }));
      }
    } catch (err) {
      if (!abortCtrl.signal.aborted) {
        ws.send(JSON.stringify({ type: "error", message: err?.message || "Erreur voice stream" }));
      }
    } finally {
      activeVoiceStreams.delete(clientId);
    }
  });
});
var asrClientCounter = 0;
wssAsr.on("connection", (ws) => {
  const asrId = `asr-${++asrClientCounter}-${Date.now()}`;
  wsAsrBuffers.set(asrId, []);
  ws.send(JSON.stringify({ type: "ready", model: "ultrablabla-hybrid-asr" }));
  ws.on("close", () => {
    wsAsrBuffers.delete(asrId);
  });
  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (data.type === "start") {
      wsAsrBuffers.set(asrId, []);
      ws.send(JSON.stringify({ type: "ready", model: "ultrablabla-hybrid-asr" }));
      return;
    }
    if (data.type === "pcm" && data.data) {
      let chunks = wsAsrBuffers.get(asrId);
      if (!chunks) {
        chunks = [];
        wsAsrBuffers.set(asrId, chunks);
      }
      chunks.push(Buffer.from(data.data, "base64"));
      return;
    }
    if (data.type === "stop") {
      const chunks = wsAsrBuffers.get(asrId) || [];
      wsAsrBuffers.delete(asrId);
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const pcmData = Buffer.concat(chunks, totalLen);
      if (pcmData.length === 0) {
        ws.send(JSON.stringify({ type: "final", text: "" }));
        return;
      }
      const wavHeader = createWavHeader(pcmData.length, 16e3, 1);
      const fullWav = Buffer.concat([Buffer.from(wavHeader), pcmData]);
      const asrTargets = [ASR_BACKEND_URL, AI_API_URL].filter(Boolean);
      for (const target of asrTargets) {
        try {
          const formData = new FormData();
          const blob = new Blob([fullWav], { type: "audio/wav" });
          formData.append("file", blob, "audio.wav");
          formData.append("language", "fr");
          const localAsr = await fetch(`${target}/v1/audio/transcriptions`, {
            method: "POST",
            headers: { "Origin": "https://ultrablabla.guig.dev" },
            body: formData,
            signal: AbortSignal.timeout(4e3)
          });
          if (localAsr.ok) {
            const asrJson = await localAsr.json();
            const text = asrJson.text || asrJson.transcription || "";
            if (text) {
              ws.send(JSON.stringify({ type: "final", text }));
              return;
            }
          }
        } catch {
        }
      }
      const gemini = getGemini();
      if (gemini && fullWav.length > 44) {
        try {
          const base64Audio = fullWav.toString("base64");
          const resp = await gemini.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: "audio/wav", data: base64Audio } },
                  { text: "Transcris fid\xE8lement ce message audio fran\xE7ais. Retourne UNIQUEMENT le texte transcrit sans aucun commentaire ni guillemets." }
                ]
              }
            ]
          });
          const text = resp.text?.trim() || "";
          ws.send(JSON.stringify({ type: "final", text }));
          return;
        } catch (e) {
          console.warn("[Gemini ASR transcription error]:", e?.message);
        }
      }
      try {
        const formData = new FormData();
        const blob = new Blob([fullWav], { type: "audio/wav" });
        formData.append("file", blob, "audio.wav");
        formData.append("model", "whisper-1");
        formData.append("language", "fr");
        const headers = {
          "Origin": "https://guig.dev"
        };
        if (process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN) {
          headers["Authorization"] = `Bearer ${process.env.AI_API_KEY || process.env.MCP_AUTH_TOKEN}`;
        }
        const cloudAsr = await fetch(`${AI_API_URL}/v1/audio/transcriptions`, {
          method: "POST",
          headers,
          body: formData,
          signal: AbortSignal.timeout(5e3)
        });
        if (cloudAsr.ok) {
          const asrJson = await cloudAsr.json();
          const text = asrJson.text || asrJson.transcription || "";
          if (text) {
            ws.send(JSON.stringify({ type: "final", text }));
            return;
          }
        }
      } catch {
      }
      ws.send(JSON.stringify({ type: "final", text: "" }));
    }
  });
});
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`\u{1F680} UltraBlabla Hybrid Voice Server listening on http://0.0.0.0:${PORT}`);
  try {
    const r = await prewarmSer();
    const ep = ser.stats().providers?.join("+") ?? "n/a";
    console.log(`\u{1F9E1} wav2vec2-fr SER: ${r.ok ? `loaded in ${r.ms.toFixed(0)} ms (${ep})` : `skipped \u2014 ${r.reason}`}`);
  } catch (err) {
    console.warn(`[SER Prewarm Warning]: ${err?.message}`);
  }
});
//# sourceMappingURL=server.cjs.map
