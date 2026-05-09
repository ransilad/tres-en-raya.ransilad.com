## Context

The app is a static Astro site with vanilla TypeScript DOM rendering in `src/game/ui.ts` and all visual styling in `src/styles/global.css`. The requested redesign is visual and interaction-layout focused: it should match the committed dark mobile-first Lumina Games mockups while keeping the current pure game logic, local persistence, sound behavior, and PWA setup unchanged.

The reference UI has three key states:

- Setup/input screen: `prd/mockups/Inputs/screen.png`, with `prd/mockups/Inputs/DESIGN.md` and `prd/mockups/Inputs/code.html` as design and markup references.
- Gameplay screen: `prd/mockups/game/screen.png`, with `prd/mockups/game/DESIGN.md` and `prd/mockups/game/code.html` as design and markup references.
- Winner modal: `prd/mockups/modal/screen.png`, with `prd/mockups/modal/DESIGN.md` and `prd/mockups/modal/code.html` as design and markup references.

The `DESIGN.md` files define the shared Lumina Games visual system: Outfit typography, deep navy surfaces (`#0b1326`), cyan primary accents (`#8aebff` / `#22d3ee`), coral secondary accents (`#ffb2b9`), rounded surfaces, 24px container padding, 12px grid gaps, and pill-shaped primary buttons.

## Goals / Non-Goals

**Goals:**

- Rebuild setup, active game, and win modal markup/classes to support the referenced UI composition.
- Keep the implementation in vanilla TypeScript and CSS, with no new framework or runtime dependency.
- Preserve existing game behavior: validation, turn order, win/draw handling, score tracking, reset, sound toggle, and localStorage persistence.
- Keep the interface responsive, with mobile as the primary layout and desktop scaling the same visual language without stretching controls awkwardly.
- Maintain the targeted in-place gameplay updates introduced by the flicker fix.

**Non-Goals:**

- No new game modes, AI opponent, online play, backend, or analytics.
- No storage schema changes unless implementation discovers that current persisted state cannot represent the redesigned UI.
- No browser/DOM test framework introduction for this visual-only change.
- No pixel-perfect clone requirement; the implementation should match the visual direction and structure of the supplied UI while fitting the existing app.

## Decisions

1. Use existing DOM renderer with renamed/expanded class structure.

   The redesign can be implemented by updating `ui.ts` templates and `global.css`. This avoids introducing a component framework for a small static app. Alternative considered: add a frontend framework, but that increases dependency and build complexity without improving this change.

2. Keep mobile-first layout as the source of truth.

   The screenshots are portrait/mobile-oriented, so CSS should define the narrow layout first, then add desktop constraints with max-width containers and spacing adjustments. Alternative considered: desktop-first CSS, but that risks degrading the primary referenced experience.

3. Render the winner state as an overlay on top of the game screen.

   The win screenshot shows board context blurred/dimmed behind the modal. Keeping the game screen mounted and adding overlay markup preserves context and aligns with the no-flicker direction. Alternative considered: replace the full screen with a standalone winner screen, but that loses the background context and can reintroduce screen flashing.

4. Represent history/settings as compact secondary controls without adding new panels unless current behavior already supports them.

   The setup reference includes small `History` and `Settings` actions. Since the existing app does not define history or settings panels beyond sound control, these should either map to existing available actions or be styled as non-disruptive controls only if backed by implemented behavior. The implementation should not add unsupported fake flows.

5. Preserve accessibility semantics while changing visuals.

   Inputs need labels or accessible names, board cells remain buttons with accurate `aria-label`, reset and sound controls remain buttons, and the winner overlay should be announced as modal/status content where practical.

## Risks / Trade-offs

- Visual drift from mockups → Mitigation: build against `prd/mockups/Inputs/screen.png`, `prd/mockups/game/screen.png`, and `prd/mockups/modal/screen.png`, then include manual screenshots/smoke testing at mobile and desktop widths.
- Existing targeted update selectors may break after markup changes → Mitigation: update `updateGameScreen()` selectors together with template class names and verify moves do not duplicate listeners or flash.
- Decorative controls may imply unavailable functionality → Mitigation: only expose controls that perform existing actions, or clearly defer unsupported history/settings features instead of adding inert buttons.
- Modal overlay can trap or obscure controls on small screens → Mitigation: test narrow viewport height, keep modal compact, and ensure primary actions are reachable.
