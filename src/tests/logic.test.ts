import { describe, it, expect } from 'vitest';
import {
  emptyBoard,
  applyMove,
  checkResult,
  nextTurn,
  resetBoard,
  isDraw,
  isWin,
  initialGameState,
} from '../game/logic';
import type { Board } from '../game/types';

describe('emptyBoard', () => {
  it('returns 9 null cells', () => {
    const board = emptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((c) => c === null)).toBe(true);
  });
});

describe('applyMove', () => {
  it('places the mark on an empty cell', () => {
    const board = emptyBoard();
    const next = applyMove(board, 4, 'X');
    expect(next[4]).toBe('X');
  });

  it('does not modify an occupied cell', () => {
    const board = emptyBoard();
    const after = applyMove(board, 4, 'X');
    const again = applyMove(after, 4, 'O');
    expect(again[4]).toBe('X');
  });

  it('does not mutate the original board', () => {
    const board = emptyBoard();
    applyMove(board, 0, 'X');
    expect(board[0]).toBeNull();
  });
});

describe('nextTurn', () => {
  it('switches X to O', () => expect(nextTurn('X')).toBe('O'));
  it('switches O to X', () => expect(nextTurn('O')).toBe('X'));
});

describe('checkResult', () => {
  it('returns null for an empty board', () => {
    expect(checkResult(emptyBoard())).toBeNull();
  });

  it('detects a row win', () => {
    const board: Board = ['X', 'X', 'X', null, null, null, null, null, null];
    const result = checkResult(board);
    expect(isWin(result)).toBe(true);
    if (isWin(result)) {
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 1, 2]);
    }
  });

  it('detects a column win', () => {
    const board: Board = ['O', null, null, 'O', null, null, 'O', null, null];
    const result = checkResult(board);
    expect(isWin(result)).toBe(true);
    if (isWin(result)) expect(result.winner).toBe('O');
  });

  it('detects a diagonal win', () => {
    const board: Board = ['X', null, null, null, 'X', null, null, null, 'X'];
    const result = checkResult(board);
    expect(isWin(result)).toBe(true);
  });

  it('detects a draw', () => {
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'X', 'O', 'X', 'O'];
    const result = checkResult(board);
    expect(isDraw(result)).toBe(true);
  });

  it('returns null when game is not finished', () => {
    const board: Board = ['X', 'O', null, null, null, null, null, null, null];
    expect(checkResult(board)).toBeNull();
  });
});

describe('resetBoard', () => {
  it('clears the board and resets turn to X', () => {
    const state = initialGameState({ X: 'Alice', O: 'Bob' });
    const modified = {
      ...state,
      board: applyMove(state.board, 0, 'X'),
      currentTurn: 'O' as const,
      phase: 'playing' as const,
    };
    const reset = resetBoard(modified);
    expect(reset.board.every((c) => c === null)).toBe(true);
    expect(reset.currentTurn).toBe('X');
    expect(reset.players).toEqual({ X: 'Alice', O: 'Bob' });
    expect(reset.soundEnabled).toBe(state.soundEnabled);
  });
});
