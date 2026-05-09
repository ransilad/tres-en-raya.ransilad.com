import { applyMove, checkResult, emptyBoard, isDraw, isWin, nextTurn } from '../logic';
import type { Board, Mark } from '../types';
import type { OnlineClientState, OnlineGameView, OnlineRoomRecord, OnlineSession } from './types';

export const ONLINE_SESSION_VERSION = 1;
export const ONLINE_ROOM_TTL_HOURS = 6;

export function normalizeRoomCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
}

export function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function generatePlayerToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPlayerToken(token: string): Promise<string> {
  if (!globalThis.crypto?.subtle) return token;

  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createOnlineSession(roomCode: string, mark: Mark, playerName: string, playerToken: string): OnlineSession {
  return {
    version: ONLINE_SESSION_VERSION,
    roomCode,
    mark,
    playerName,
    playerToken,
  };
}

export function buildInitialRoom(code: string, hostName: string, hostTokenHash: string): OnlineRoomRecord {
  const expiresAt = new Date(Date.now() + ONLINE_ROOM_TTL_HOURS * 60 * 60 * 1000).toISOString();

  return {
    code,
    status: 'waiting',
    players: {
      X: { name: hostName, connected: true },
    },
    board: emptyBoard(),
    current_turn: 'X',
    result: null,
    rematch_requests: {},
    host_token_hash: hostTokenHash,
    guest_token_hash: null,
    expires_at: expiresAt,
  };
}

export function isRoomExpired(room: Pick<OnlineRoomRecord, 'expires_at'>, now = Date.now()): boolean {
  return new Date(room.expires_at).getTime() <= now;
}

export function mapRoomToGameView(state: OnlineClientState): OnlineGameView {
  const { room, session, soundEnabled, connectionStatus } = state;
  const players = {
    X: room.players.X?.name ?? 'Jugador X',
    O: room.players.O?.name ?? 'Jugador O',
  };
  const phase = room.status === 'won' ? 'won' : room.status === 'draw' ? 'draw' : room.status === 'playing' ? 'playing' : 'setup';
  const isLocalTurn = phase === 'playing' && room.current_turn === session.mark;

  return {
    version: 1,
    phase,
    board: room.board,
    currentTurn: room.current_turn,
    players,
    result: room.result,
    soundEnabled,
    localMark: session.mark,
    isLocalTurn,
    canMove: isLocalTurn && connectionStatus === 'connected',
    connectionStatus,
    statusText: getOnlineStatusText(state),
    roomCode: room.code,
  };
}

export function getOnlineStatusText(state: OnlineClientState): string {
  const { room, session, connectionStatus } = state;
  if (connectionStatus === 'connecting') return 'Conectando...';
  if (connectionStatus === 'reconnecting') return 'Reconectando...';
  if (connectionStatus === 'disconnected') return 'Sin conexión con la sala';
  if (connectionStatus === 'error') return state.errorMessage ?? 'No se pudo sincronizar la sala';
  if (room.status === 'waiting') return `Sala ${room.code}: esperando rival`;
  if (room.status === 'abandoned') return 'El rival salió de la partida';
  if (room.status === 'draw') return 'Empate. Esperando revancha';
  if (isWin(room.result)) return `${room.players[room.result.winner]?.name ?? 'Un jugador'} gana`;
  if (room.current_turn === session.mark) return 'Tu turno';
  return `Turno de ${room.players[room.current_turn]?.name ?? 'tu rival'}`;
}

export function canSubmitOnlineMove(state: OnlineClientState, index: number): boolean {
  return mapRoomToGameView(state).canMove && state.room.board[index] === null;
}

export function applyOnlineMove(room: OnlineRoomRecord, mark: Mark, index: number): OnlineRoomRecord | null {
  if (room.status !== 'playing' || room.current_turn !== mark || room.board[index] !== null) return null;

  const board = applyMove(room.board, index, mark);
  const result = checkResult(board);
  const status = isWin(result) ? 'won' : isDraw(result) ? 'draw' : 'playing';

  return {
    ...room,
    board,
    result,
    status,
    current_turn: status === 'playing' ? nextTurn(mark) : mark,
    rematch_requests: {},
  };
}

export function buildRematchRoom(room: OnlineRoomRecord): OnlineRoomRecord {
  return {
    ...room,
    status: 'playing',
    board: emptyBoard() as Board,
    current_turn: 'X',
    result: null,
    rematch_requests: {},
  };
}
