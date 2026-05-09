// Game types

export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type GamePhase = 'setup' | 'playing' | 'won' | 'draw';

export interface Players {
  X: string;
  O: string;
}

export interface WinResult {
  winner: Mark;
  line: [number, number, number];
}

export type GameResult = WinResult | { winner: null; draw: true } | null;

export interface GameState {
  version: number;
  phase: GamePhase;
  board: Board;
  currentTurn: Mark;
  players: Players;
  result: GameResult;
  soundEnabled: boolean;
}
