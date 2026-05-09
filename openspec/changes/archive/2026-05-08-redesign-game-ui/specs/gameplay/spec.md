## MODIFIED Requirements

### Requirement: 3x3 game board
The system SHALL display a classic 3x3 Tres en Raya board during an active match using `prd/mockups/game/screen.png` as the visual target and `prd/mockups/game/DESIGN.md` / `prd/mockups/game/code.html` as implementation references for large rounded square cells, dark card surfaces, and cyan/pink mark styling.

#### Scenario: Active match is shown
- **WHEN** a match is active
- **THEN** the system displays nine selectable rounded cells arranged as a centered 3x3 board matching `prd/mockups/game/screen.png`

### Requirement: Current turn display
The system SHALL clearly show whose turn it is during an active match with a compact centered turn indicator above the board, following `prd/mockups/game/screen.png`. The turn indicator and player score cards SHALL update in place without causing a full game screen re-render.

#### Scenario: Turn changes
- **WHEN** a valid move changes the current turn
- **THEN** the system updates the visible turn indicator and active player styling to the next player's name and symbol without replacing or flashing the rest of the game screen

### Requirement: Win feedback
The system SHALL show victory feedback when a player wins using `prd/mockups/modal/screen.png` as the visual target and `prd/mockups/modal/DESIGN.md` / `prd/mockups/modal/code.html` as implementation references: a centered modal card over a dimmed or blurred game background, trophy icon, winner text, primary play-again action, and secondary back-to-menu action.

#### Scenario: Match has a winner
- **WHEN** the system detects a winning line
- **THEN** the system highlights the winning line, shows the redesigned victory modal matching `prd/mockups/modal/screen.png`, plays a victory animation, and plays a retro sound if sound is enabled

### Requirement: Manual match reset
The system SHALL provide a manual reset control during gameplay using a compact circular floating control below the player score cards, following `prd/mockups/game/screen.png`, while preserving player names and sound settings.

#### Scenario: User resets the match
- **WHEN** the user activates the reset control
- **THEN** the system clears the board and starts a new match with player X to move first while preserving player names and sound settings
