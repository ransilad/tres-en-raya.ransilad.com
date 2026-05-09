## MODIFIED Requirements

### Requirement: 3x3 game board
The system SHALL display a classic 3x3 Tres en Raya board during an active local or online match using `prd/mockups/game/screen.png` as the visual target and `prd/mockups/game/DESIGN.md` / `prd/mockups/game/code.html` as implementation references for large rounded square cells, dark card surfaces, and cyan/pink mark styling.

#### Scenario: Active match is shown
- **WHEN** a local or online match is active
- **THEN** the system displays nine selectable rounded cells arranged as a centered 3x3 board matching `prd/mockups/game/screen.png`

### Requirement: Turn management
The system SHALL alternate turns between player X and player O after each valid move in both local and online matches.

#### Scenario: Local player makes a valid move
- **WHEN** the current player selects an empty cell in a local match
- **THEN** the system places that player's symbol in the cell and advances the turn to the other player

#### Scenario: Online player makes a valid move
- **WHEN** the assigned current player selects an empty cell in an online match and the authoritative room accepts the move
- **THEN** both devices show that player's symbol in the cell and advance the turn to the other player

### Requirement: Occupied cell protection
The system MUST prevent selecting a cell that already contains a symbol in both local and online matches.

#### Scenario: Player selects an occupied cell
- **WHEN** a player selects a cell that already contains X or O
- **THEN** the system leaves the board unchanged and keeps the current turn unchanged

### Requirement: Current turn display
The system SHALL clearly show whose turn it is during an active local or online match with a compact centered turn indicator above the board, following `prd/mockups/game/screen.png`. The turn indicator and player score cards SHALL update in place without causing a full game screen re-render.

#### Scenario: Turn changes
- **WHEN** a valid move changes the current turn
- **THEN** the system updates the visible turn indicator and active player styling to the next player's name and symbol without replacing or flashing the rest of the game screen

#### Scenario: Online player waits for opponent
- **WHEN** an online match is active and the current turn belongs to the remote opponent
- **THEN** the system shows that the local player is waiting for the opponent and prevents local board input

### Requirement: Win detection
The system SHALL automatically detect a winning row, column, or diagonal after each valid local move and after each accepted online room move.

#### Scenario: Player completes a winning line
- **WHEN** a valid move creates three matching symbols in a row, column, or diagonal
- **THEN** the system declares that player as the winner and ends normal move input for the match

### Requirement: Win feedback
The system SHALL show victory feedback when a player wins using `prd/mockups/modal/screen.png` as the visual target and `prd/mockups/modal/DESIGN.md` / `prd/mockups/modal/code.html` as implementation references: a centered modal card over a dimmed or blurred game background, trophy icon, winner text, primary play-again action, and secondary back-to-menu action.

#### Scenario: Match has a winner
- **WHEN** the system detects a winning line
- **THEN** the system highlights the winning line, shows the redesigned victory modal matching `prd/mockups/modal/screen.png`, plays a victory animation, and plays a retro sound if sound is enabled

### Requirement: Draw handling
The system SHALL detect a draw when all cells are filled and no player has won. Local matches SHALL automatically restart the board using the same players and settings, while online matches SHALL wait for rematch coordination between both players.

#### Scenario: Local board is full without winner
- **WHEN** the last empty cell is filled in a local match and no winning line exists
- **THEN** the system treats the match as a draw and automatically restarts the board for a new local match using the same players and settings

#### Scenario: Online board is full without winner
- **WHEN** the last empty cell is filled in an online match and no winning line exists
- **THEN** both devices show the draw result and wait for the online rematch flow or return-to-menu action

### Requirement: Manual match reset
The system SHALL provide a manual reset control during local gameplay using a compact circular floating control below the player score cards, following `prd/mockups/game/screen.png`, while preserving player names and sound settings. Online matches SHALL NOT allow one player to unilaterally reset an active shared board.

#### Scenario: User resets local match
- **WHEN** the user activates the reset control during a local match
- **THEN** the system clears the board and starts a new local match with player X to move first while preserving player names and sound settings

#### Scenario: Online match is active
- **WHEN** an online match is in progress
- **THEN** the system hides or disables unilateral reset and offers only online-safe actions such as leave match or coordinated rematch after completion

### Requirement: Sound control
The system SHALL provide a control to enable or disable sound effects.

#### Scenario: User toggles sound off
- **WHEN** the user disables sound
- **THEN** the system stops playing sound effects for subsequent game events

#### Scenario: User toggles sound on
- **WHEN** the user enables sound and later triggers a sound-producing game event
- **THEN** the system plays the corresponding retro sound effect
