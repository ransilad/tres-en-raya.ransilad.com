## Context

The repository currently contains the PRD and OpenSpec scaffolding, but no Astro application source files yet. The implementation will create a production-oriented Astro and TypeScript app for a local two-player Tres en Raya game, deployable as a static site on Vercel.

The game is browser-only and has no backend, authentication, database, online multiplayer, AI, rankings, or match history. State persistence, sound preferences, and offline support are handled locally in the browser.

## Goals / Non-Goals

**Goals:**

- Create a complete local two-player Tres en Raya game with a start screen, validated player names, and a 3x3 board.
- Keep game rules deterministic and testable through TypeScript modules separated from UI code.
- Persist active match state and sound settings in localStorage and restore them on reload.
- Deliver a dark retro responsive interface that works on desktop, tablet, and mobile touch screens without zoom.
- Support installable PWA behavior and offline play after the first load.
- Include SEO basics and automated tests for critical game behavior.

**Non-Goals:**

- No online multiplayer, AI opponent, backend, database, authentication, rankings, advanced statistics, chat, or social integrations.
- No multiple board sizes or alternate rule sets.
- No persistent historical match records beyond the current active match.

## Decisions

1. Use a static Astro app with a small client-side TypeScript game module.

   Rationale: The game is interactive and browser-local, but does not need a backend or complex client framework. Astro can serve the static shell while TypeScript controls the game state and DOM behavior.

   Alternative considered: Add a heavier framework integration for stateful UI. This is unnecessary for a single-screen game and would increase setup and bundle complexity.

2. Separate pure game logic from DOM rendering.

   Rationale: Win detection, draw detection, turn switching, and move validation should be easy to test without a browser. UI code can call pure functions and render the resulting state.

   Alternative considered: Keep all logic inside event handlers. This is simpler initially but harder to test and maintain.

3. Store one versioned localStorage object for the active game.

   Rationale: A single persisted payload keeps board state, current turn, player names, game phase, and sound settings consistent. Including a version allows safe resets if the shape changes before release.

   Alternative considered: Use multiple localStorage keys. This makes partial updates easier but increases the risk of inconsistent restored state.

4. Implement sound effects with lightweight browser audio or small static assets and gate playback behind user interaction and the sound toggle.

   Rationale: Browser autoplay restrictions are easier to satisfy when sounds are triggered by clicks. Small audio avoids performance and network overhead.

   Alternative considered: Use a full audio library. This is unnecessary for simple retro effects.

5. Use a service worker and web manifest under `public/` for PWA support.

   Rationale: Static assets are compatible with Vercel and Astro. The service worker can cache the app shell and assets required for offline replay after first load.

   Alternative considered: Add a PWA plugin immediately. A plugin may be useful, but a simple service worker keeps the first version explicit and dependency-light.

6. Add Vitest for pure logic tests and browser-oriented UI tests only where the implementation justifies them.

   Rationale: Game rules are the highest-risk logic and can be covered cheaply. UI tests should focus on critical flows such as name validation and move feedback.

   Alternative considered: Add end-to-end tests in the initial change. This would improve confidence but is larger than needed for the first production baseline.

## Risks / Trade-offs

- Service worker cache staleness -> Use a named cache version and activate-time cleanup so deployments can replace old assets.
- localStorage data corruption or stale schema -> Validate persisted payloads and reset to the start screen if data is invalid.
- Browser audio restrictions -> Trigger sounds only from user actions and keep the sound toggle available before gameplay.
- Automatic draw restart may surprise users -> Keep draw feedback brief and deterministic before resetting the board, preserving player names and settings.
- Static-only architecture limits future online features -> This is acceptable because online multiplayer, backend, and authentication are explicitly out of scope.
