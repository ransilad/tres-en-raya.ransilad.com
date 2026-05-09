import { describe, it, expect } from 'vitest';
import { validateOnlineSession } from '../game/persistence';
import { validatePlayerName, validateGameState } from '../game/validation';
import { CURRENT_STATE_VERSION } from '../game/logic';
import type { GameState } from '../game/types';

describe('validatePlayerName', () => {
  it('returns trimmed name for valid string', () => {
    expect(validatePlayerName('  Alice  ')).toBe('Alice');
  });
  it('returns null for empty string', () => {
    expect(validatePlayerName('')).toBeNull();
  });
  it('returns null for whitespace-only', () => {
    expect(validatePlayerName('   ')).toBeNull();
  });
  it('returns null for non-string', () => {
    expect(validatePlayerName(123)).toBeNull();
    expect(validatePlayerName(null)).toBeNull();
  });
});

describe('validateOnlineSession', () => {
  const valid = {
    version: 1,
    roomCode: 'ABC123',
    mark: 'X',
    playerName: 'Alice',
    playerToken: '12345678901234567890123456789012',
  };

  it('returns session for valid online metadata', () => {
    expect(validateOnlineSession(valid)).toEqual(valid);
  });

  it('returns null for invalid room code', () => {
    expect(validateOnlineSession({ ...valid, roomCode: 'bad' })).toBeNull();
  });

  it('returns null for invalid mark', () => {
    expect(validateOnlineSession({ ...valid, mark: 'Z' })).toBeNull();
  });

  it('returns null for short player token', () => {
    expect(validateOnlineSession({ ...valid, playerToken: 'short' })).toBeNull();
  });
});

describe('validateGameState', () => {
  const valid: GameState = {
    version: CURRENT_STATE_VERSION,
    phase: 'playing',
    board: [null, null, null, null, null, null, null, null, null],
    currentTurn: 'X',
    players: { X: 'Alice', O: 'Bob' },
    result: null,
    soundEnabled: true,
  };

  it('returns state for valid data', () => {
    expect(validateGameState(valid)).toEqual(valid);
  });

  it('returns null for wrong version', () => {
    expect(validateGameState({ ...valid, version: 999 })).toBeNull();
  });

  it('returns null for invalid phase', () => {
    expect(validateGameState({ ...valid, phase: 'unknown' })).toBeNull();
  });

  it('returns null for board with wrong length', () => {
    expect(validateGameState({ ...valid, board: [null, null] })).toBeNull();
  });

  it('returns null for invalid turn', () => {
    expect(validateGameState({ ...valid, currentTurn: 'Z' })).toBeNull();
  });

  it('returns null for empty player name', () => {
    expect(validateGameState({ ...valid, players: { X: '', O: 'Bob' } })).toBeNull();
  });

  it('returns null for null input', () => {
    expect(validateGameState(null)).toBeNull();
  });

  it('returns null for non-boolean soundEnabled', () => {
    expect(validateGameState({ ...valid, soundEnabled: 'yes' })).toBeNull();
  });
});
