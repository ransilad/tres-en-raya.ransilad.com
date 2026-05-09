## Why

The current interface should be redesigned to match the committed mobile-first Lumina Games mockups in `prd/mockups/`. This improves visual consistency across setup, gameplay, and win states while preserving the existing local two-player game behavior.

## What Changes

- Replace the current setup screen using `prd/mockups/Inputs/screen.png` as the visual target and `prd/mockups/Inputs/DESIGN.md` / `code.html` as implementation references.
- Redesign the active game screen using `prd/mockups/game/screen.png` as the visual target and `prd/mockups/game/DESIGN.md` / `code.html` as implementation references.
- Redesign the win state using `prd/mockups/modal/screen.png` as the visual target and `prd/mockups/modal/DESIGN.md` / `code.html` as implementation references.
- Preserve existing game rules, persistence, sound setting, and local two-player flow.
- Keep the UI responsive so the mobile composition remains usable on narrow screens and scales cleanly on desktop.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `retro-responsive-ui`: Update visual layout and responsive behavior to match the provided dark mobile-first arcade UI across setup, gameplay, and win modal states.
- `game-setup`: Update setup-screen presentation and required controls while preserving player-name entry and match start behavior.
- `gameplay`: Update gameplay-screen presentation for turn state, board cells, player score cards, reset action, and winner overlay without changing game rules.

## Impact

- Affected code: `src/game/ui.ts`, `src/styles/global.css`, and possibly `src/pages/index.astro` for page-level layout metadata or shell adjustments.
- Design inputs: `prd/mockups/Inputs/`, `prd/mockups/game/`, and `prd/mockups/modal/`.
- No backend, API, storage schema, or dependency changes are expected.
- Existing tests for pure game logic and validation should continue to pass; visual changes will require manual responsive smoke testing.
