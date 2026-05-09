## Context

The current `render()` function in `src/game/ui.ts` rebuilds the entire `#app` innerHTML on every state change — including after each cell click. This causes the browser to tear down and recreate the full game screen DOM, which produces a visible flash/flicker between the old state and the new one.

The fix is to update only the parts of the DOM that actually changed on a move, rather than replacing the whole screen.

## Goals / Non-Goals

**Goals:**
- Eliminate the flicker on cell clicks during normal gameplay
- Eliminate the flicker on turn indicator updates
- Keep the sound toggle and reset/new-game buttons working without full re-render
- Preserve all existing behavior (win modal, draw auto-reset, accessibility attributes)

**Non-Goals:**
- Introduce a virtual DOM or diffing library
- Refactor into a component architecture
- Change game logic or state management
- Fix anything outside the game screen (setup screen re-renders are fine, they're rare)

## Decisions

### Decision 1: Targeted DOM updates instead of full innerHTML replacement for the game screen

**Chosen**: After the game screen is mounted once, subsequent moves update only the changed cell(s), the turn indicator, and player badges — without replacing `app.innerHTML`.

**Alternative considered**: Use a lightweight diffing approach (e.g., morphdom or similar). Rejected — adds a dependency and is overkill for a static app with a small, predictable DOM.

**Alternative considered**: Continue with full innerHTML replacement but add CSS `content-visibility: auto` or `will-change` hints to reduce paint cost. Rejected — doesn't eliminate the DOM teardown; flicker is caused by element destruction and recreation, not paint cost.

### Decision 2: Keep full re-render for screen transitions (setup ↔ game)

Screen transitions (setup → game, game → setup) are rare and user-initiated. Full innerHTML replacement is acceptable here and simplifies the screen-switching logic.

### Decision 3: Separate render path for "game already mounted" vs "first mount"

Introduce a boolean or phase check: if the game screen is already in the DOM, call `updateGameScreen()` (targeted update); otherwise call the existing full mount. This minimizes code change surface.

## Risks / Trade-offs

- [Risk]: `updateGameScreen()` can get out of sync with `renderGameScreen()` HTML structure if one is changed without updating the other. → Mitigation: Keep the HTML template and the update function co-located with clear comments. The cells, turn indicator, and player badges are simple and stable.
- [Risk]: Win modal still calls `render()` indirectly via the "play again" button. → Mitigation: The modal's "play again" path resets to a new match on the same screen — use targeted update there too.
