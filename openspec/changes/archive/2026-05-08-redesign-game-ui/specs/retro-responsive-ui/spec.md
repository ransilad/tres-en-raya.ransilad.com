## MODIFIED Requirements

### Requirement: Retro dark visual theme
The system SHALL use the Lumina Games dark arcade visual theme from `prd/mockups/Inputs/DESIGN.md`, `prd/mockups/game/DESIGN.md`, and `prd/mockups/modal/DESIGN.md` as the base interface design, matching the committed mockups with deep navy backgrounds, cyan primary accents, pink/coral secondary mark accents, rounded cards, pill controls, soft glow effects, and legible high-contrast text.

#### Scenario: Application renders
- **WHEN** the user views any primary screen
- **THEN** the interface uses the Lumina Games dark arcade visual language from `prd/mockups/` with high contrast, rounded surfaces, cyan/pink mark styling, and legible text

### Requirement: Responsive layout
The system SHALL be fully responsive across mobile, tablet, and desktop viewport sizes, using the portrait mobile compositions in `prd/mockups/Inputs/screen.png`, `prd/mockups/game/screen.png`, and `prd/mockups/modal/screen.png` as the primary layouts and scaling them cleanly on wider screens without horizontal scrolling or broken controls.

#### Scenario: User views on different devices
- **WHEN** the viewport changes between mobile, tablet, and desktop widths
- **THEN** the layout remains usable, centered, and visually consistent without horizontal scrolling or broken controls

### Requirement: Mobile touch usability
The system SHALL support touch interaction on mobile without requiring zoom, with large rounded board cells, pill buttons, and compact secondary controls sized for reliable tapping.

#### Scenario: Mobile user plays a move
- **WHEN** a mobile user taps a board cell or primary control
- **THEN** the target is large enough to use reliably and the action can be completed without zooming

### Requirement: Smooth game animations
The system SHALL include lightweight animations for cell selection, victory feedback, modal presentation, and basic screen transitions consistent with the mockups in `prd/mockups/`. The game screen SHALL update cell state and turn indicators without full DOM replacement, so that CSS transitions are not interrupted and no visual flash occurs between moves.

#### Scenario: User interacts with game UI
- **WHEN** the user starts a match, selects a cell, or wins a match
- **THEN** the system shows smooth, non-blocking animations appropriate to the event

#### Scenario: User selects a cell during a match
- **WHEN** the current player clicks an empty cell
- **THEN** the system updates that cell's content and class in place without replacing or flashing any other part of the game screen

#### Scenario: Winner modal appears
- **WHEN** a player wins a match
- **THEN** the system presents a centered winner modal over a dimmed or blurred game background without causing an abrupt full-screen flash
