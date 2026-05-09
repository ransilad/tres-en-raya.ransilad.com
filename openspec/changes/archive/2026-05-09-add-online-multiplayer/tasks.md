## 1. Architecture And Provider Setup

- [x] 1.1 Install `@supabase/supabase-js` and add a Supabase client module that reads public env vars only.
- [x] 1.2 Add `.env.example` entries for `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` or `PUBLIC_SUPABASE_PUBLISHABLE_KEY` without committing real keys.
- [x] 1.3 Document that the Supabase project URL is `https://rudyxhxefkqaowbndlom.supabase.co` and that `service_role` is secret/server-only.
- [x] 1.4 Define online room and client session types separately from local game state.
- [x] 1.5 Add pure helpers for mapping authoritative Supabase room state to UI state.

## 2. Supabase Schema And Security

- [x] 2.1 Add a versioned SQL migration for the Supabase `rooms` table.
- [x] 2.2 Include fields for room code, status, players, board, current turn, result, rematch requests, created/updated timestamps, and expiration.
- [x] 2.3 Enable Supabase Realtime for the `rooms` table.
- [x] 2.4 Add RLS policies that allow public clients to read/join/update only valid room state using room code and per-player tokens.
- [x] 2.5 Add an updated-at trigger and room expiration/cleanup strategy.

## 3. Online Room Service

- [x] 3.1 Implement room creation with host player name, room code generation, player token generation, and player assignment.
- [x] 3.2 Implement room joining with room-code validation, capacity checks, guest token generation, and guest assignment.
- [x] 3.3 Implement move submission against Supabase with turn, phase, token, and occupied-cell validation.
- [x] 3.4 Implement Supabase Realtime subscription for board, players, turn, result, presence, and rematch state.
- [x] 3.5 Implement leave, disconnect, room-expiry, and reconnect handling.

## 4. Persistence And State Lifecycle

- [x] 4.1 Update persistence to distinguish local match saves from online session metadata.
- [x] 4.2 Restore local matches exactly as before when local state is valid.
- [x] 4.3 Attempt online room reconnection from stored room code, assigned mark, and player token.
- [x] 4.4 Clear invalid, expired, or incompatible online metadata with Spanish user feedback.

## 5. Setup And Lobby UI

- [x] 5.1 Add setup mode selection for local two-player and online multiplayer.
- [x] 5.2 Preserve existing local setup validation, autofocus, styling, and start flow.
- [x] 5.3 Add online create-room form with player-name validation and loading/error states.
- [x] 5.4 Add online join-room form with player-name and room-code validation.
- [x] 5.5 Add waiting-room UI that displays the room code and opponent waiting status.
- [x] 5.6 Disable online actions with Spanish feedback when public Supabase configuration is missing.

## 6. Online Gameplay UI

- [x] 6.1 Render online matches using the existing board visual style and synchronized room state.
- [x] 6.2 Disable board input and show waiting copy when it is the remote opponent's turn.
- [x] 6.3 Hide or disable unilateral reset during active online matches.
- [x] 6.4 Show online win, draw, opponent-left, reconnecting, and room-unavailable states in Spanish.
- [x] 6.5 Implement coordinated online rematch so both players must opt in before the board resets.

## 7. Tests And Verification

- [x] 7.1 Add unit tests for online state mapping and move-validation helpers.
- [x] 7.2 Add tests for persistence validation of local state versus online session metadata.
- [ ] 7.3 Validate the Supabase SQL migration and RLS policy assumptions against the project.
- [x] 7.4 Run `pnpm check` and fix any TypeScript or Astro diagnostics.
- [x] 7.5 Run `pnpm test` and fix failing tests.
- [x] 7.6 Run `pnpm build` and verify static build output succeeds with Supabase client configuration.
- [ ] 7.7 Manually smoke test two browsers/devices: create room, join room, alternating moves, win, draw, rematch, disconnect, reload, and return to local mode.
