import type { GameState } from './types';
import { CURRENT_STATE_VERSION } from './logic';

export function validatePlayerName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (trimmed.length === 0) return null;
  return trimmed;
}

export function validateGameState(data: unknown): GameState | null {
  try {
    if (!data || typeof data !== 'object') return null;
    const s = data as Record<string, unknown>;

    if (s['version'] !== CURRENT_STATE_VERSION) return null;
    if (!['setup', 'playing', 'won', 'draw'].includes(s['phase'] as string)) return null;
    if (!Array.isArray(s['board']) || s['board'].length !== 9) return null;
    if (!['X', 'O'].includes(s['currentTurn'] as string)) return null;

    const players = s['players'] as Record<string, unknown> | undefined;
    if (!players || typeof players['X'] !== 'string' || typeof players['O'] !== 'string') return null;
    if (!players['X'] || !players['O']) return null;

    if (typeof s['soundEnabled'] !== 'boolean') return null;

    // Validate board cells
    const validCells = [null, 'X', 'O'];
    const board = s['board'] as unknown[];
    if (!board.every((c) => validCells.includes(c as string | null))) return null;

    return data as GameState;
  } catch {
    return null;
  }
}
