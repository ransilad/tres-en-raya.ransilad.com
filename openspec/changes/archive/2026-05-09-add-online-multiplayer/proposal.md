## Why

The game currently only supports two players sharing one device, which limits the expected 1vs1 experience when players are not together. Adding online multiplayer lets two people play the same Tres en Raya match from different devices while preserving the existing local mode.

## What Changes

- Add an online multiplayer mode where one player can create a room and another player can join from a different device.
- Add room-based match synchronization so both devices see the same board, turn, player names, win/draw state, and rematch state.
- Add clear setup and lobby UI for choosing local vs online play, creating a room, sharing/joining a room, and waiting for the opponent.
- Enforce turn ownership so only the assigned player can move on their device.
- Preserve local two-player gameplay as an offline option.
- Integrate Supabase Realtime for room creation, live game state updates, and cross-device synchronization using a `rooms` table.

## Capabilities

### New Capabilities

- `online-multiplayer`: Covers room creation, room joining, player assignment, realtime synchronization, turn enforcement, disconnect handling, and online rematches for 1vs1 matches across devices.

### Modified Capabilities

- `game-setup`: Add mode selection and online room setup/join flows while preserving the existing local two-player setup.
- `gameplay`: Add online gameplay behavior for synchronized moves, remote turn waiting, online result handling, and rematch coordination without changing Tres en Raya rules.
- `game-persistence`: Define how online session references are stored/restored separately from local active match state.

## Impact

- Affected code: `src/game/ui.ts`, `src/game/logic.ts`, `src/game/types.ts`, `src/game/persistence.ts`, `src/styles/global.css`, and `src/pages/index.astro` as needed for the expanded flow.
- New code needed for Supabase client setup, online transport, room state mapping, and client-side connection lifecycle.
- New dependency: `@supabase/supabase-js`.
- New public environment variables: `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` or `PUBLIC_SUPABASE_PUBLISHABLE_KEY`; the `service_role` key MUST NOT be exposed to the frontend or committed.
- Supabase schema changes are needed for the `rooms` table, Realtime publication, and RLS policies.
- The app can remain static if all Supabase access uses the public client with RLS; Astro API routes are not required for the first implementation.
- Existing local gameplay tests should continue to pass; new tests should cover online state mapping and move validation where logic is pure.
