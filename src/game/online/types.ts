import type { Board, GameResult, GameState, Mark } from '../types';

export type OnlineRoomStatus = 'waiting' | 'playing' | 'won' | 'draw' | 'abandoned';
export type OnlineConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface OnlinePlayer {
  name: string;
  connected: boolean;
  left?: boolean;
}

export type OnlinePlayers = Partial<Record<Mark, OnlinePlayer>>;
export type RematchRequests = Partial<Record<Mark, boolean>>;

export interface OnlineRoomRecord {
  id?: string;
  code: string;
  status: OnlineRoomStatus;
  players: OnlinePlayers;
  board: Board;
  current_turn: Mark;
  result: GameResult;
  rematch_requests: RematchRequests;
  host_token_hash?: string;
  guest_token_hash?: string | null;
  created_at?: string;
  updated_at?: string;
  expires_at: string;
}

export interface OnlineSession {
  version: 1;
  roomCode: string;
  mark: Mark;
  playerName: string;
  playerToken: string;
}

export interface OnlineClientState {
  mode: 'online';
  room: OnlineRoomRecord;
  session: OnlineSession;
  connectionStatus: OnlineConnectionStatus;
  errorMessage?: string;
  soundEnabled: boolean;
}

export interface OnlineGameView extends GameState {
  localMark: Mark;
  isLocalTurn: boolean;
  canMove: boolean;
  connectionStatus: OnlineConnectionStatus;
  statusText: string;
  roomCode: string;
}
