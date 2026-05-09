## 1. Targeted game screen update

- [x] 1.1 Add `updateGameScreen()` function in `src/game/ui.ts` that updates only cell buttons, turn indicator, and player badge classes in place — without replacing `app.innerHTML`
- [x] 1.2 Update each cell button: set `textContent`, `className`, `disabled`, and `aria-label` to match current board state
- [x] 1.3 Update turn indicator `innerHTML` and both player badge `active` classes
- [x] 1.4 Update sound toggle button text and `aria-label` in place

## 2. Wire targeted update into render flow

- [x] 2.1 Modify `render()` to call `updateGameScreen()` instead of replacing `app.innerHTML` when the game screen is already mounted (detect via `document.querySelector('.game-screen')`)
- [x] 2.2 Keep full `innerHTML` replacement only for screen transitions (setup ↔ game) and initial mount

## 3. Fix event binding

- [x] 3.1 Ensure `bindGameEvents()` is only called on initial game screen mount, not on every targeted update (event listeners must not be added multiple times)

## 4. Verify

- [x] 4.1 Run `pnpm check` — no type errors
- [x] 4.2 Run `pnpm test` — all tests pass
- [x] 4.3 Run `pnpm build` — clean build
- [ ] 4.4 Manual smoke test: play a full match in the browser and confirm no visible flicker on cell clicks or turn updates
