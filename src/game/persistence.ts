import type { OnlineSession } from './online/types';
import type { GameState } from './types';
import { validateGameState } from './validation';

const STORAGE_KEY = 'tres-en-raya-state';
const ONLINE_SESSION_KEY = 'tres-en-raya-online-session';

export function saveState(state: GameState | null): void {
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Silently ignore storage errors (e.g. private mode, quota)
  }
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const valid = validateGameState(parsed);
    if (!valid) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return valid;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveOnlineSession(session: OnlineSession | null): void {
  try {
    if (session === null) {
      localStorage.removeItem(ONLINE_SESSION_KEY);
    } else {
      localStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Silently ignore storage errors (e.g. private mode, quota)
  }
}

export function loadOnlineSession(): OnlineSession | null {
  try {
    const raw = localStorage.getItem(ONLINE_SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const valid = validateOnlineSession(parsed);
    if (!valid) {
      localStorage.removeItem(ONLINE_SESSION_KEY);
      return null;
    }
    return valid;
  } catch {
    localStorage.removeItem(ONLINE_SESSION_KEY);
    return null;
  }
}

export function clearOnlineSession(): void {
  saveOnlineSession(null);
}

export function validateOnlineSession(data: unknown): OnlineSession | null {
  if (!data || typeof data !== 'object') return null;
  const session = data as Record<string, unknown>;

  if (session['version'] !== 1) return null;
  if (typeof session['roomCode'] !== 'string' || !/^[A-Z0-9]{6}$/.test(session['roomCode'])) return null;
  if (!['X', 'O'].includes(session['mark'] as string)) return null;
  if (typeof session['playerName'] !== 'string' || session['playerName'].trim().length === 0) return null;
  if (typeof session['playerToken'] !== 'string' || session['playerToken'].length < 32) return null;

  return session as unknown as OnlineSession;
}
