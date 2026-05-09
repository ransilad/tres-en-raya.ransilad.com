## 1. Project Foundation

- [x] 1.1 Initialize the Astro and TypeScript application structure with scripts for development, build, preview, and tests.
- [x] 1.2 Add base project files and configuration needed for static deployment on Vercel.
- [x] 1.3 Create the main Astro page shell with SEO metadata, favicon reference, manifest link, and app mount points.

## 2. Game Logic

- [x] 2.1 Define TypeScript types for players, marks, board cells, game phase, persisted state, and game results.
- [x] 2.2 Implement pure game logic for valid moves, occupied-cell protection, turn switching, win detection, draw detection, and reset behavior.
- [x] 2.3 Add validation utilities for player names and persisted state payloads.

## 3. Game UI

- [x] 3.1 Build the initial start screen with title, player X name field, player O name field, validation feedback, and "Comenzar" action.
- [x] 3.2 Build the 3x3 board UI with accessible selectable cells and visible X/O marks.
- [x] 3.3 Add current-turn display using player names and symbols.
- [x] 3.4 Add manual reset and sound toggle controls.
- [x] 3.5 Add victory modal, winning-line highlight, win animation, and draw restart feedback.

## 4. Persistence And Audio

- [x] 4.1 Persist board state, current turn, player names, game phase, and sound setting to localStorage after state changes.
- [x] 4.2 Restore valid persisted state on page load and fall back to the start screen for invalid persisted data.
- [x] 4.3 Implement lightweight retro sound effects that respect the sound toggle and browser interaction restrictions.

## 5. Retro Responsive Styling

- [x] 5.1 Implement the dark retro visual theme with high contrast, readable typography, and consistent controls.
- [x] 5.2 Add responsive layouts for mobile, tablet, and desktop without horizontal overflow.
- [x] 5.3 Tune touch target sizes and board spacing for mobile use without zoom.
- [x] 5.4 Add lightweight animations for screen transitions, cell selection, and victory feedback.

## 6. PWA And Offline Support

- [x] 6.1 Add a web app manifest with app name, icons, start URL, display mode, theme color, and background color.
- [x] 6.2 Add required favicon and app icon assets.
- [x] 6.3 Implement and register a service worker that caches the app shell and required game assets.
- [x] 6.4 Verify the application loads and remains playable after first load when offline.

## 7. Tests And Quality

- [x] 7.1 Add Vitest test setup for TypeScript game logic.
- [x] 7.2 Add tests for valid moves, occupied cells, turn changes, win detection, draw detection, reset behavior, and persisted state validation.
- [x] 7.3 Add critical UI tests for setup validation and gameplay flow where supported by the chosen test setup.
- [x] 7.4 Run tests, build, and preview checks to verify no production console errors in normal flows.
- [x] 7.5 Check Lighthouse-oriented basics for performance, best practices, SEO, installability, and offline support.
