import type { GameState } from './types';
import { validateGameState } from './validation';

const STORAGE_KEY = 'tres-en-raya-state';

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
