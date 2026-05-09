## Context

The current app is a fully static Astro site with all interactivity in vanilla TypeScript. Game rules are pure functions in `src/game/logic.ts`, while `src/game/ui.ts` owns DOM rendering and local event handling. Persistence currently stores one local active match in `localStorage`.

Online multiplayer changes the architecture because two browsers must share one authoritative room state. The app will use Supabase Realtime as the hosted realtime data layer, with a `rooms` table storing room code, players, board, turn, result, rematch requests, status, timestamps, and expiration.

The Supabase project URL is `https://rudyxhxefkqaowbndlom.supabase.co`. The public anon/publishable key must be provided through local and Vercel environment variables, not committed to the repository. The `service_role` key is secret and must never be used in browser code.

## Goals / Non-Goals

**Goals:**

- Preserve the current local two-player mode as the default offline-capable path.
- Add an online 1vs1 mode where a host creates a room and another player joins from a different device.
- Keep Tres en Raya rule evaluation in pure TypeScript where possible so local and online modes share the same rules.
- Make online room state authoritative outside each individual browser so clients cannot diverge by applying independent moves.
- Keep the Astro app static for the first online implementation by using Supabase directly from client-side TypeScript with RLS policies.
- Provide clear Spanish UI states for mode selection, room creation, joining, waiting, active remote turn, winner, draw, disconnect, and rematch.

**Non-Goals:**

- No AI opponent.
- No public matchmaking or player accounts.
- No spectator mode, chat, rankings, or persistent match history.
- No support for more than two players in one room.
- No guarantee that online multiplayer works offline; only local mode remains offline-capable.
- No Astro API routes or server-side secret key usage in the first implementation.

## Decisions

- Use room codes for online sessions.
  - Rationale: Room codes are easy to share across devices and do not require accounts.
  - Alternative considered: URL-only invite links. Links are convenient, but a short code still supports manual entry and can be embedded in a link later.

- Use Supabase Realtime and a `rooms` table as the online backend.
  - Rationale: Supabase provides a hosted Postgres database plus realtime subscriptions, avoiding custom WebSocket infrastructure while fitting the current Astro/Vercel project.
  - Alternative considered: Astro API routes plus Redis/KV polling. That would keep more backend logic in this repo, but it adds polling latency and does not provide realtime push without another service.

- Keep Supabase access client-side with public env vars for the initial version.
  - Rationale: This preserves static deployment and uses Supabase RLS as the security boundary.
  - Alternative considered: Astro API routes with a server-side secret key. That provides stronger control over writes, but requires moving away from fully static output and carefully protecting server-only credentials.

- Store online rooms in one `rooms` table with JSON fields for compact game state.
  - Rationale: Tres en Raya state is tiny and room-scoped, so one row per room keeps Realtime subscriptions simple.
  - Alternative considered: Separate tables for players, moves, and rematch requests. That is more normalized but unnecessary for temporary two-player rooms.

- Keep local and online match state as separate modes in the client model.
  - Rationale: Local persistence and online synchronization have different lifecycles. A discriminated state shape prevents accidentally treating remote state as a complete local save.
  - Alternative considered: Extend the existing `GameState` with optional online fields. That would be smaller initially but increases branching and validation ambiguity.

- Treat the Supabase room row as authoritative for online rooms.
  - Rationale: Both clients need one source of truth for whose turn it is, whether a move is legal, and whether a match has ended.
  - Alternative considered: Peer-to-peer browser sync. It avoids a server but adds NAT/connectivity complexity and weaker authority for a simple web game.

- Reuse pure game logic for move validation and result calculation.
  - Rationale: Existing logic is already testable and prevents duplicate rule implementations.
  - Alternative considered: Implement all rules only in backend code. That would make authority clear but duplicate client behavior unless the code can be shared.

- Persist only resumable online session metadata locally.
  - Rationale: The browser should remember the last online room code and assigned mark for reconnection, but the room board must come from the authoritative online state.
  - Alternative considered: Persist full online board locally. That risks stale state and conflicts after reconnect.

## Risks / Trade-offs

- Client-side Supabase writes with a public key require correct RLS -> Mitigate by creating minimal RLS policies, using per-player tokens stored in room JSON, and rejecting writes that do not match the assigned player and current turn.
- Supabase schema or RLS mistakes can expose room data -> Mitigate by storing only temporary player display names and game state, avoiding personal data, expiring rooms, and reviewing policies before deploy.
- Client-side move validation alone is insufficient for cheating or race conditions -> Mitigate by validating moves against authoritative room state before committing them.
- Reconnect and disconnect handling can add UI complexity -> Mitigate with simple states: reconnecting, opponent disconnected, room expired, and return-to-menu.
- Realtime services can introduce latency or quota limits -> Mitigate by keeping payloads tiny and syncing only room state changes.
- Service worker caching can serve stale frontend code during protocol changes -> Mitigate by bumping the service worker cache name when online multiplayer assets or state contracts change.
