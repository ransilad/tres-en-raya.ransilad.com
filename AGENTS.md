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

Static Astro app (`output: 'static'`), no framework integration. Client interactivity is vanilla TypeScript bundled by Astro/Vite.

```
src/
  pages/index.astro       — only page; imports global.css; registers SW inline
  styles/global.css       — all styles (dark retro theme, CSS vars, responsive)
  game/
    types.ts              — shared TypeScript types (Mark, Board, GameState, …)
    logic.ts              — pure functions, no DOM (testable in Node)
    validation.ts         — validatePlayerName, validateGameState
    persistence.ts        — localStorage save/load; validates on load, clears on bad data
    audio.ts              — Web Audio API tones (no audio files)
    ui.ts                 — full DOM renderer; imported via <script> in index.astro
  tests/
    logic.test.ts         — 13 tests
    validation.test.ts    — 12 tests
public/
  sw.js                   — service worker (cache-first, named cache "tres-en-raya-v1")
  manifest.json           — PWA manifest (SVG icons)
  favicon.svg, icon-192.svg, icon-512.svg
```

## Key conventions

- **All game logic lives in `src/game/logic.ts`** — pure functions, no DOM, fully testable under Node (`environment: 'node'` in vitest).
- `ui.ts` imports from sibling files without `.ts` extension (`'./logic'`, not `'./logic.ts'`). Astro/Vite resolves them; do not add extensions.
- `ui.ts` is wired into the page via `<script>import('./game/ui')</script>` (dynamic import). Astro bundles it as `_astro/ui.<hash>.js`.
- Tests only cover pure modules (`logic.ts`, `validation.ts`). No browser/DOM tests — vitest environment is `node`.
- `localStorage` key: `tres-en-raya-state`. State schema is versioned (`version: 1`). Bump `CURRENT_STATE_VERSION` in `logic.ts` when the shape changes; `validateGameState` will auto-clear old data on load.
- Sound uses Web Audio API only — no audio files. No audio library dependency.
- Service worker cache name is `"tres-en-raya-v1"` in `public/sw.js`. Rename on breaking cache changes.

## OpenSpec workflow

This repo uses the OpenSpec `spec-driven` schema. Commands live in `.opencode/commands/`:

- `/opsx-propose` — create a new change with proposal + design + specs + tasks
- `/opsx-apply` — implement tasks from an active change
- `/opsx-archive` — sync delta specs to `openspec/specs/` and move change to `openspec/changes/archive/`

Active changes: `openspec/changes/<name>/`  
Archived: `openspec/changes/archive/YYYY-MM-DD-<name>/`  
Canonical specs: `openspec/specs/<capability>/spec.md`

## Deployment

Vercel (`vercel.json` in root). Build output is `dist/`. No env vars required — fully static, no backend.
