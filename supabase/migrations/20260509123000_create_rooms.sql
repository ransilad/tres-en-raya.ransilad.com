create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  status text not null check (status in ('waiting', 'playing', 'won', 'draw', 'abandoned')),
  players jsonb not null default '{}'::jsonb,
  board jsonb not null default '[null,null,null,null,null,null,null,null,null]'::jsonb,
  current_turn text not null default 'X' check (current_turn in ('X', 'O')),
  result jsonb,
  rematch_requests jsonb not null default '{}'::jsonb,
  host_token_hash text not null,
  guest_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint rooms_board_length check (jsonb_typeof(board) = 'array' and jsonb_array_length(board) = 9),
  constraint rooms_players_object check (jsonb_typeof(players) = 'object'),
  constraint rooms_rematch_object check (jsonb_typeof(rematch_requests) = 'object')
);

create index if not exists rooms_code_idx on public.rooms (code);
create index if not exists rooms_expires_at_idx on public.rooms (expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

alter table public.rooms enable row level security;

drop policy if exists "rooms are readable while active" on public.rooms;
create policy "rooms are readable while active"
on public.rooms
for select
to anon
using (expires_at > now());

drop policy if exists "anon can create waiting rooms" on public.rooms;
create policy "anon can create waiting rooms"
on public.rooms
for insert
to anon
with check (
  status = 'waiting'
  and current_turn = 'X'
  and host_token_hash is not null
  and guest_token_hash is null
  and expires_at > now()
  and jsonb_typeof(players) = 'object'
  and players ? 'X'
  and not (players ? 'O')
);

drop policy if exists "anon can update active rooms" on public.rooms;
create policy "anon can update active rooms"
on public.rooms
for update
to anon
using (
  expires_at > now()
  and (
    encode(digest(coalesce((current_setting('request.headers', true)::jsonb ->> 'x-player-token'), ''), 'sha256'), 'hex') in (host_token_hash, coalesce(guest_token_hash, ''))
    or coalesce((current_setting('request.headers', true)::jsonb ->> 'x-player-token'), '') in (host_token_hash, coalesce(guest_token_hash, ''))
    or (status = 'waiting' and guest_token_hash is null)
  )
)
with check (
  expires_at > now()
  and (
    encode(digest(coalesce((current_setting('request.headers', true)::jsonb ->> 'x-player-token'), ''), 'sha256'), 'hex') in (host_token_hash, coalesce(guest_token_hash, ''))
    or coalesce((current_setting('request.headers', true)::jsonb ->> 'x-player-token'), '') in (host_token_hash, coalesce(guest_token_hash, ''))
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end;
$$;

create or replace function public.delete_expired_rooms()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.rooms where expires_at <= now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
