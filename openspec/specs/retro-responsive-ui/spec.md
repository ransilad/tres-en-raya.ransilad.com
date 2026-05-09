## ADDED Requirements

### Requirement: Retro dark visual theme
The system SHALL use a dark retro-inspired visual theme as the base interface design.

#### Scenario: Application renders
- **WHEN** the user views any primary screen
- **THEN** the interface uses dark colors, high contrast, retro styling, and legible text

### Requirement: Responsive layout
The system SHALL be fully responsive across mobile, tablet, and desktop viewport sizes.

#### Scenario: User views on different devices
- **WHEN** the viewport changes between mobile, tablet, and desktop widths
- **THEN** the layout remains usable without horizontal scrolling or broken controls

### Requirement: Mobile touch usability
The system SHALL support touch interaction on mobile without requiring zoom.

#### Scenario: Mobile user plays a move
- **WHEN** a mobile user taps a board cell or primary control
- **THEN** the target is large enough to use reliably and the action can be completed without zooming

### Requirement: Smooth game animations
The system SHALL include lightweight animations for cell selection, victory feedback, and basic screen transitions. The game screen SHALL update cell state and turn indicators without full DOM replacement, so that CSS transitions are not interrupted and no visual flash occurs between moves.

#### Scenario: User interacts with game UI
- **WHEN** the user starts a match, selects a cell, or wins a match
- **THEN** the system shows smooth, non-blocking animations appropriate to the event

#### Scenario: User selects a cell during a match
- **WHEN** the current player clicks an empty cell
- **THEN** the system updates that cell's content and class in place without replacing or flashing any other part of the game screen
