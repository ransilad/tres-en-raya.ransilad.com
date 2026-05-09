## Why

The project needs an initial production-ready implementation of a local two-player Tres en Raya game based on the PRD in `prd/init-project.md`. This change establishes the game experience, persistence, responsive retro UI, PWA/offline support, SEO basics, and baseline quality checks needed before deployment to Vercel.

## What Changes

- Add an Astro and TypeScript Tres en Raya application for two local players on the same device.
- Add a start screen that collects and validates player names before starting the match.
- Add a 3x3 game board with alternating turns, occupied-cell protection, win detection, draw handling, manual reset, and current-turn display.
- Add win feedback with a modal, highlighted winning line, animation, and retro sound effect.
- Add automatic draw restart behavior.
- Add local persistence for board state, current turn, player names, and sound settings so reloads restore the active match.
- Add a retro dark responsive UI optimized for desktop, tablet, and mobile touch use.
- Add sound enable/disable controls and lightweight retro audio effects.
- Add PWA install/offline support through a manifest and service worker.
- Add SEO basics including title, meta description, Open Graph metadata, favicon, and manifest metadata.
- Add basic automated tests for game logic and critical UI behavior.

## Capabilities

### New Capabilities

- `game-setup`: Covers the initial screen, player name entry, validation, and game start flow.
- `gameplay`: Covers the 3x3 board, turn management, move validation, win/draw detection, reset behavior, and result feedback.
- `game-persistence`: Covers local storage of match state, player names, current turn, and sound settings, plus restoration after reload.
- `retro-responsive-ui`: Covers the dark retro visual treatment, animations, responsive layout, and mobile touch usability.
- `pwa-offline`: Covers installability, web manifest, service worker registration, and offline operation after first load.
- `seo-quality`: Covers SEO metadata, favicon/manifest metadata, production console cleanliness, and automated test coverage expectations.

### Modified Capabilities

None.

## Impact

- Affects the Astro app structure, pages, components, styles, static assets, and TypeScript game logic.
- Adds browser localStorage usage for persisted game state and settings.
- Adds PWA assets and service worker behavior that must be compatible with Vercel static deployment.
- May add or configure test tooling such as Vitest and Testing Library if not already present.
- Adds lightweight audio assets or generated browser audio for retro sound feedback.
