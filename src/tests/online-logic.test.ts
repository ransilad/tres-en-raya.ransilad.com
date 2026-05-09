import { describe, expect, it } from 'vitest';
import { emptyBoard } from '../game/logic';
import {
  applyOnlineMove,
  buildInitialRoom,
  buildRematchRoom,
  canSubmitOnlineMove,
  createOnlineSession,
  isRoomExpired,
  mapRoomToGameView,
  normalizeRoomCode,
} from '../game/online/logic';
import type { OnlineClientState } from '../game/online/types';

function onlineState(overrides: Partial<OnlineClientState> = {}): OnlineClientState {
  const room = {
    ...buildInitialRoom('ABC123', 'Alice', 'hash-x'),
    status: 'playing' as const,
    players: {
      X: { name: 'Alice', connected: true },
      O: { name: 'Bob', connected: true },
    },
    guest_token_hash: 'hash-o',
  };

  return {
    mode: 'online',
    room,
    session: createOnlineSession('ABC123', 'X', 'Alice', 'token'),
    connectionStatus: 'connected',
    soundEnabled: true,
    ...overrides,
  };
}

describe('online room helpers', () => {
  it('normalizes room codes', () => {
    expect(normalizeRoomCode(' ab-12-cd ')).toBe('AB12CD');
  });

  it('maps online room state to game view state', () => {
    const view = mapRoomToGameView(onlineState());
    expect(view.players).toEqual({ X: 'Alice', O: 'Bob' });
    expect(view.phase).toBe('playing');
    expect(view.isLocalTurn).toBe(true);
    expect(view.canMove).toBe(true);
    expect(view.statusText).toBe('Tu turno');
  });

  it('prevents local moves while waiting for opponent', () => {
    const state = onlineState({ room: { ...onlineState().room, current_turn: 'O' } });
    expect(canSubmitOnlineMove(state, 0)).toBe(false);
    expect(mapRoomToGameView(state).statusText).toBe('Turno de Bob');
  });

  it('applies a valid online move and advances turn', () => {
    const state = onlineState();
    const next = applyOnlineMove(state.room, 'X', 0);
    expect(next?.board[0]).toBe('X');
    expect(next?.current_turn).toBe('O');
  });

  it('rejects out-of-turn online moves', () => {
    const state = onlineState();
    expect(applyOnlineMove(state.room, 'O', 0)).toBeNull();
  });

  it('resets a completed room for rematch', () => {
    const state = onlineState({ room: { ...onlineState().room, board: ['X', 'X', 'X', null, null, null, null, null, null], status: 'won' } });
    const rematch = buildRematchRoom(state.room);
    expect(rematch.status).toBe('playing');
    expect(rematch.board).toEqual(emptyBoard());
    expect(rematch.current_turn).toBe('X');
  });

  it('detects expired rooms', () => {
    expect(isRoomExpired({ expires_at: new Date(Date.now() - 1_000).toISOString() })).toBe(true);
  });
});
