## 1. Audit Current UI Structure

- [x] 1.1 Review `src/game/ui.ts` render templates and identify setup, gameplay, winner modal, reset, sound, and score elements that need new class names or structure
- [x] 1.2 Review `src/styles/global.css` and map existing selectors to redesigned setup, gameplay, and modal states
- [x] 1.3 Confirm no storage schema or pure game-logic changes are required for the redesign
- [x] 1.4 Review `prd/mockups/Inputs/`, `prd/mockups/game/`, and `prd/mockups/modal/` including `screen.png`, `DESIGN.md`, and `code.html` before implementation

## 2. Redesign Setup Screen

- [x] 2.1 Update setup screen markup in `src/game/ui.ts` to match `prd/mockups/Inputs/screen.png` with title, subtitle, two large player input rows, decorative X/O marks, pill start button, and supported secondary controls
- [x] 2.2 Style setup screen in `src/styles/global.css` with deep navy background, cyan/pink mark accents, rounded input cards, large decorative X/O treatment, and responsive spacing
- [x] 2.3 Preserve player-name validation behavior and ensure validation feedback fits the redesigned layout

## 3. Redesign Gameplay Screen

- [x] 3.1 Update gameplay markup in `src/game/ui.ts` to match `prd/mockups/game/screen.png` for centered turn indicator, rounded 3x3 board cells, player score cards, versus label, and floating circular reset control
- [x] 3.2 Update `updateGameScreen()` selectors and mutations so board cells, turn indicator, active player card state, score cards, and sound/reset controls update in place without full DOM replacement
- [x] 3.3 Style gameplay screen in `src/styles/global.css` to match the supplied mobile portrait reference and scale cleanly on desktop
- [x] 3.4 Preserve existing move, reset, sound toggle, score, draw, and persistence behavior

## 4. Redesign Winner Overlay

- [x] 4.1 Update winner modal markup to match `prd/mockups/modal/screen.png` as a centered card over the active game screen with trophy icon, winner text, play-again action, and back-to-menu action
- [x] 4.2 Style the winner overlay with dimmed or blurred background context, rounded card, cyan primary button, and subdued secondary button
- [x] 4.3 Preserve winner detection, winning-line highlight, victory sound, play-again, and back-to-menu behavior

## 5. Responsive And Accessibility Pass

- [ ] 5.1 Verify mobile, tablet, and desktop breakpoints avoid horizontal scrolling and keep controls tappable
- [x] 5.2 Ensure inputs, board cells, reset, sound, start, play-again, and back-to-menu controls retain accessible labels or text
- [x] 5.3 Ensure animations are lightweight and do not reintroduce visible flicker on cell clicks, turn updates, or winner modal display

## 6. Verify

- [x] 6.1 Run `pnpm check` and fix any type or Astro diagnostics
- [x] 6.2 Run `pnpm test` and fix any failing tests
- [x] 6.3 Run `pnpm build` and fix any production build failures
- [ ] 6.4 Manually smoke test setup, full match, winner modal, reset, sound toggle, back-to-menu, and responsive layouts in the browser
- [ ] 6.5 Compare implementation against `prd/mockups/Inputs/screen.png`, `prd/mockups/game/screen.png`, and `prd/mockups/modal/screen.png` at mobile width
