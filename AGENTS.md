# AGENTS.md

## Commands

```bash
pnpm dev          # dev server (localhost:4321)
pnpm build        # production build → dist/
pnpm preview      # serve dist/ locally
pnpm check        # Astro + TypeScript type check
pnpm test         # Vitest run (non-interactive)
pnpm test:watch
```

Run order before committing: `pnpm check && pnpm test && pnpm build`

## Architecture

Static Astro app (`output: 'static'`), no framework integration. Client interactivity is vanilla TypeScript bundled by Astro/Vite. Online multiplayer uses Supabase directly from browser code with public env vars and RLS; do not add server-only secrets to the frontend.

```
src/
  pages/index.astro       — only page; imports global.css; registers SW inline
  styles/global.css       — all styles (dark retro theme, CSS vars, responsive)
  game/
    types.ts              — shared TypeScript types (Mark, Board, GameState, …)
    logic.ts              — pure functions, no DOM (testable in Node)
    validation.ts         — validatePlayerName, validateGameState
    persistence.ts        — localStorage save/load for local state and online session metadata
    online/               — Supabase client, room service, online state mapping helpers
    audio.ts              — Web Audio API tones (no audio files)
    ui.ts                 — full DOM renderer; imported via <script> in index.astro
  tests/
    logic.test.ts         — 13 tests
    online-logic.test.ts  — online state mapping and move helper tests
    validation.test.ts    — validation and persistence metadata tests
public/
  sw.js                   — service worker (network-first for navigation/_astro, cache "tres-en-raya-v4")
  manifest.json           — PWA manifest (SVG icons)
  favicon.svg, icon-192.svg, icon-512.svg
```

## Key conventions

- **All game logic lives in `src/game/logic.ts`** — pure functions, no DOM, fully testable under Node (`environment: 'node'` in vitest).
- Online pure helpers live in `src/game/online/logic.ts`; Supabase I/O lives in `src/game/online/rooms.ts` and `src/game/online/supabase.ts`.
- `ui.ts` imports from sibling files without `.ts` extension (`'./logic'`, not `'./logic.ts'`). Astro/Vite resolves them; do not add extensions.
- `ui.ts` is wired into the page via `<script>import('./game/ui')</script>` (dynamic import). Astro bundles it as `_astro/ui.<hash>.js`.
- Tests only cover pure modules and validation helpers. No browser/DOM tests — vitest environment is `node`.
- `localStorage` key: `tres-en-raya-state`. State schema is versioned (`version: 1`). Bump `CURRENT_STATE_VERSION` in `logic.ts` when the shape changes; `validateGameState` will auto-clear old data on load.
- Online session metadata uses localStorage key `tres-en-raya-online-session`. It stores room code, assigned mark, player name, and player token only; the authoritative online board stays in Supabase.
- Supabase env vars are public-only: `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` or `PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never commit real keys. Never expose `service_role`.
- Supabase project URL currently documented as `https://rudyxhxefkqaowbndlom.supabase.co`.
- Supabase schema/RLS lives in `supabase/migrations/20260509123000_create_rooms.sql`. Realtime must be enabled for `rooms`.
- Online sync should primarily use Supabase Realtime. Avoid continuous polling; if a fallback is needed, keep it bounded and guard against stale `updated_at` snapshots.
- Online UX conventions: local move is optimistic, `Volver al menu` is optimistic and sets room `abandoned`, either player can trigger rematch and it resets the board for both.
- Sound uses Web Audio API only — no audio files. No audio library dependency.
- Service worker cache name is `"tres-en-raya-v4"` in `public/sw.js`. Rename on breaking cache changes or public cached asset changes.

## OpenSpec workflow

This repo uses the OpenSpec `spec-driven` schema. Commands live in `.opencode/commands/`:

- `/opsx-propose` — create a new change with proposal + design + specs + tasks
- `/opsx-apply` — implement tasks from an active change
- `/opsx-archive` — sync delta specs to `openspec/specs/` and move change to `openspec/changes/archive/`

Active changes: `openspec/changes/<name>/`  
Archived: `openspec/changes/archive/YYYY-MM-DD-<name>/`  
Canonical specs: `openspec/specs/<capability>/spec.md`

## Deployment

Vercel (`vercel.json` in root). Build output is `dist/`. Online mode requires public Supabase env vars in Vercel; local mode works without them.
