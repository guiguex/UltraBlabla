# 🛡️ Politique de Sécurité (Security Policy)

## Rapports de Vulnérabilités

La sécurité du moteur vocal UltraBlabla et de l'infrastructure Cloudflare Edge est notre priorité absolue. Si vous découvrez une faille de sécurité, veuillez **ne pas la divulguer publiquement**. 

Veuillez créer un incident privé (Private Issue) sur GitHub ou contacter directement l'équipe de développement. Nous répondrons dans les 48 heures.

## Versions Supportées

Seule la dernière version majeure (v4.0+) déployée sur l'infrastructure Cloudflare Edge reçoit des mises à jour de sécurité régulières.
Les versions précédentes (v1 à v3) basées sur VOSK local sont obsolètes et ne sont plus maintenues.

## Bonnes Pratiques d'Implémentation

### 1. Variables d'Environnement
**Ne commitez jamais vos clés d'API (OpenAI, Cloudflare, Deepgram) dans le dépôt.**
Le fichier `src/server.ts` est conçu pour utiliser `process.env.AI_API_URL` comme proxy pour éviter l'exposition de clés sur le frontend.

### 2. CORS (Cross-Origin Resource Sharing)
Le serveur `Bun` applique des règles CORS strictes. L'en-tête `Origin` est surveillé et configuré pour ne relayer que les requêtes autorisées (`https://guig.dev` ou l'URL Firebase Hosting approuvée).

### 3. Exécution Docker
Il est fortement déconseillé d'exécuter le conteneur Docker en tant qu'utilisateur `root`. Le `Dockerfile` officiel utilise la base `oven/bun:alpine` qui réduit considérablement la surface d'attaque.

### 4. Application Android
L'application Capacitor (Android 15) communique exclusivement via HTTPS/WSS avec le backend. Le mode `cleartextTrafficPermitted` est désactivé par défaut en production.
