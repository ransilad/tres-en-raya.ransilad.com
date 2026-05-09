import type { RealtimeChannel } from '@supabase/supabase-js';
import { validatePlayerName } from '../validation';
import type { Mark } from '../types';
import { createSupabasePlayerClient, getSupabaseClient } from './supabase';
import {
  applyOnlineMove,
  buildInitialRoom,
  buildRematchRoom,
  createOnlineSession,
  generatePlayerToken,
  generateRoomCode,
  hashPlayerToken,
  isRoomExpired,
  normalizeRoomCode,
} from './logic';
import type { OnlineRoomRecord, OnlineSession } from './types';

const ROOM_SELECT = '*';

export interface OnlineRoomResult {
  room: OnlineRoomRecord;
  session: OnlineSession;
}

export type RoomSubscription = {
  channel: RealtimeChannel;
  unsubscribe: () => void;
};

function toRoomRecord(value: unknown): OnlineRoomRecord {
  return value as OnlineRoomRecord;
}

function getRoomErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la acción online.';
}

export async function createOnlineRoom(playerName: string): Promise<OnlineRoomResult> {
  const name = validatePlayerName(playerName);
  if (!name) throw new Error('Ingresa tu nombre para crear la sala.');

  const client = getSupabaseClient();
  const playerToken = generatePlayerToken();
  const tokenHash = await hashPlayerToken(playerToken);
  let lastError: unknown = null;

  for (let attempts = 0; attempts < 5; attempts += 1) {
    const code = generateRoomCode();
    const room = buildInitialRoom(code, name, tokenHash);
    const { data, error } = await client.from('rooms').insert(room).select(ROOM_SELECT).single();

    if (!error && data) {
      return {
        room: toRoomRecord(data),
        session: createOnlineSession(code, 'X', name, playerToken),
      };
    }

    lastError = error;
  }

  throw new Error(getRoomErrorMessage(lastError));
}

export async function joinOnlineRoom(roomCode: string, playerName: string): Promise<OnlineRoomResult> {
  const name = validatePlayerName(playerName);
  const code = normalizeRoomCode(roomCode);
  if (!name) throw new Error('Ingresa tu nombre para unirte a la sala.');
  if (code.length !== 6) throw new Error('Ingresa un código de sala válido.');

  const client = getSupabaseClient();
  const { data, error } = await client.from('rooms').select(ROOM_SELECT).eq('code', code).single();
  if (error || !data) throw new Error('No encontramos esa sala.');

  const room = toRoomRecord(data);
  if (isRoomExpired(room)) throw new Error('La sala expiró. Crea una nueva.');
  if (room.status !== 'waiting' || room.players.O) throw new Error('La sala ya no está disponible.');

  const playerToken = generatePlayerToken();
  const tokenHash = await hashPlayerToken(playerToken);
  const authedClient = createSupabasePlayerClient(playerToken);
  const nextRoom: OnlineRoomRecord = {
    ...room,
    status: 'playing',
    players: {
      ...room.players,
      O: { name, connected: true },
    },
    guest_token_hash: tokenHash,
  };

  const { data: updated, error: updateError } = await authedClient
    .from('rooms')
    .update(nextRoom)
    .eq('code', code)
    .select(ROOM_SELECT)
    .single();

  if (updateError || !updated) throw new Error('No pudimos unirnos a la sala.');

  const updatedRoom = toRoomRecord(updated);

  return {
    room: updatedRoom,
    session: createOnlineSession(code, 'O', name, playerToken),
  };
}

export async function fetchOnlineRoom(roomCode: string): Promise<OnlineRoomRecord | null> {
  const code = normalizeRoomCode(roomCode);
  if (code.length !== 6) return null;

  const { data, error } = await getSupabaseClient().from('rooms').select(ROOM_SELECT).eq('code', code).single();
  if (error || !data) return null;
  const room = toRoomRecord(data);
  return isRoomExpired(room) ? null : room;
}

export async function submitOnlineMove(room: OnlineRoomRecord, session: OnlineSession, index: number): Promise<OnlineRoomRecord> {
  const nextRoom = applyOnlineMove(room, session.mark, index);
  if (!nextRoom) throw new Error('Ese movimiento no está permitido.');

  const { data, error } = await createSupabasePlayerClient(session.playerToken)
    .from('rooms')
    .update(nextRoom)
    .eq('code', room.code)
    .eq('current_turn', session.mark)
    .select(ROOM_SELECT)
    .single();

  if (error || !data) throw new Error('No pudimos enviar tu movimiento.');
  const updatedRoom = toRoomRecord(data);
  broadcastCurrentRoomUpdate(updatedRoom);
  return updatedRoom;
}

export async function leaveOnlineRoom(room: OnlineRoomRecord, session: OnlineSession): Promise<void> {
  const players = {
    ...room.players,
    [session.mark]: {
      ...room.players[session.mark],
      name: room.players[session.mark]?.name ?? session.playerName,
      connected: false,
      left: true,
    },
  };

  await createSupabasePlayerClient(session.playerToken)
    .from('rooms')
    .update({ status: 'abandoned', players })
    .eq('code', room.code);

  const { data: fetchData } = await getSupabaseClient().from('rooms').select(ROOM_SELECT).eq('code', room.code).single();
  if (fetchData) {
    broadcastCurrentRoomUpdate(toRoomRecord(fetchData));
  }
}

export async function requestOnlineRematch(room: OnlineRoomRecord, session: OnlineSession): Promise<OnlineRoomRecord> {
  const rematch_requests = { ...room.rematch_requests, [session.mark]: true };
  const nextRoom = buildRematchRoom({ ...room, rematch_requests });

  const { data, error } = await createSupabasePlayerClient(session.playerToken)
    .from('rooms')
    .update(nextRoom)
    .eq('code', room.code)
    .select(ROOM_SELECT)
    .single();

  if (error || !data) throw new Error('No pudimos preparar la revancha.');
  const updatedRoom = toRoomRecord(data);
  broadcastCurrentRoomUpdate(updatedRoom);
  return updatedRoom;
}

export type RoomBroadcastStatus = 'subscribed' | 'channel_error' | 'closed';

export type BroadcastSubscription = {
  channel: RealtimeChannel;
  unsubscribe: () => void;
};

let currentRoomChannel: RealtimeChannel | null = null;

export function setRoomChannel(channel: RealtimeChannel | null): void {
  currentRoomChannel = channel;
}

export function broadcastRoomEvent(channel: RealtimeChannel, room: OnlineRoomRecord): void {
  channel.send({
    type: 'broadcast',
    event: 'room_update',
    payload: room,
  });
}

export function broadcastCurrentRoomUpdate(room: OnlineRoomRecord): void {
  if (currentRoomChannel) {
    broadcastRoomEvent(currentRoomChannel, room);
  }
}

export function subscribeToRoomBroadcast(
  roomCode: string,
  onChange: (room: OnlineRoomRecord) => void,
  onStatusChange?: (status: RoomBroadcastStatus) => void,
  onSubscribed?: (channel: RealtimeChannel) => void,
): BroadcastSubscription {
  const code = normalizeRoomCode(roomCode);
  const client = getSupabaseClient();

  const channel = client.channel(`room:${code}`);

  channel.on('broadcast', { event: 'room_update' }, (payload) => {
    if (payload.payload) onChange(toRoomRecord(payload.payload));
  });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      onStatusChange?.('subscribed');
      onSubscribed?.(channel);
    } else if (status === 'CHANNEL_ERROR') {
      onStatusChange?.('channel_error');
    } else if (status === 'CLOSED') {
      onStatusChange?.('closed');
    }
  });

  return {
    channel,
    unsubscribe: () => {
      void client.removeChannel(channel);
    },
  };
}

export function getOpponentMark(mark: Mark): Mark {
  return mark === 'X' ? 'O' : 'X';
}
