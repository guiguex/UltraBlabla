/**
 * Conversation identity shared with guig.dev and the other guig surfaces.
 *
 * The server mints both the id and an HMAC capability token; the id alone is
 * not a credential. Cookie is scoped to `.guig.dev` when served from that zone
 * so UltraBlabla, guiglab and audiollm resolve to the same episodic thread,
 * with a localStorage mirror for localhost and native shells.
 */

const ID_KEY = 'guig_session_id';
const TOKEN_KEY = 'guig_session_token';
const ONE_YEAR = 365 * 24 * 60 * 60;
const MINT_URL = 'https://api.guig.dev/v1/memory/session';

export interface Session {
  session_id: string;
  session_token: string;
}

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return '';
}

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:';
  const host = typeof location !== 'undefined' ? location.hostname : '';
  const domain = host.endsWith('guig.dev') ? '; domain=.guig.dev' : '';
  document.cookie =
    `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax` +
    domain +
    (secure ? '; Secure' : '');
}

function readLocal(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function persist(s: Session): void {
  writeCookie(ID_KEY, s.session_id);
  writeCookie(TOKEN_KEY, s.session_token);
  try {
    localStorage.setItem(ID_KEY, s.session_id);
    localStorage.setItem(TOKEN_KEY, s.session_token);
  } catch { /* private mode */ }
}

function cached(): Session | null {
  const id = readCookie(ID_KEY) || readLocal(ID_KEY);
  const token = readCookie(TOKEN_KEY) || readLocal(TOKEN_KEY);
  return id && token ? { session_id: id, session_token: token } : null;
}

let inflight: Promise<Session | null> | null = null;

/**
 * Resolve the current session, minting one on first use. Returns null when the
 * server is unreachable so callers can degrade to a memory-less turn.
 */
export function ensureSession(): Promise<Session | null> {
  const hit = cached();
  if (hit) return Promise.resolve(hit);
  if (inflight) return inflight;

  inflight = fetch(MINT_URL, { method: 'POST' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: any) => {
      if (!j?.session_id || !j?.session_token) return null;
      const s: Session = { session_id: j.session_id, session_token: j.session_token };
      persist(s);
      return s;
    })
    .catch(() => null)
    .finally(() => { inflight = null; });

  return inflight;
}

/** Synchronous read for callers that cannot await; null until minted. */
export function getSession(): Session | null {
  return cached();
}

/** Drop the local handle so the next call starts a fresh episode. */
export function resetSession(): void {
  writeCookie(ID_KEY, '');
  writeCookie(TOKEN_KEY, '');
  try {
    localStorage.removeItem(ID_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
}
