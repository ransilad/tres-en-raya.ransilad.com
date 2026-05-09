import type { Board, Cell, Mark, GameResult, GameState, Players } from './types';

export const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export const CURRENT_STATE_VERSION = 1;

export function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

export function isCellEmpty(board: Board, index: number): boolean {
  return board[index] === null;
}

export function applyMove(board: Board, index: number, mark: Mark): Board {
  if (!isCellEmpty(board, index)) return board;
  const next = [...board] as Board;
  next[index] = mark;
  return next;
}

export function nextTurn(current: Mark): Mark {
  return current === 'X' ? 'O' : 'X';
}

export function checkResult(board: Board): GameResult {
  for (const [a, b, c] of WINNING_LINES) {
    const cell = board[a];
    if (cell !== null && cell === board[b] && cell === board[c]) {
      return { winner: cell as Mark, line: [a, b, c] };
    }
  }
  if (board.every((cell: Cell) => cell !== null)) {
    return { winner: null, draw: true };
  }
  return null;
}

export function isDraw(result: GameResult): result is { winner: null; draw: true } {
  return result !== null && 'draw' in result && result.draw === true;
}

export function isWin(result: GameResult): result is { winner: Mark; line: [number, number, number] } {
  return result !== null && 'winner' in result && result.winner !== null;
}

export function initialGameState(players: Players, soundEnabled = true): GameState {
  return {
    version: CURRENT_STATE_VERSION,
    phase: 'playing',
    board: emptyBoard(),
    currentTurn: 'X',
    players,
    result: null,
    soundEnabled,
  };
}

export function resetBoard(state: GameState): GameState {
  return {
    ...state,
    phase: 'playing',
    board: emptyBoard(),
    currentTurn: 'X',
    result: null,
  };
}
