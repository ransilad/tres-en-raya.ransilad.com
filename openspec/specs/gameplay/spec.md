## ADDED Requirements

### Requirement: 3x3 game board
The system SHALL display a classic 3x3 Tres en Raya board during an active match.

#### Scenario: Active match is shown
- **WHEN** a match is active
- **THEN** the system displays nine selectable cells arranged as a 3x3 board

### Requirement: Turn management
The system SHALL alternate turns between player X and player O after each valid move.

#### Scenario: Player makes a valid move
- **WHEN** the current player selects an empty cell
- **THEN** the system places that player's symbol in the cell and advances the turn to the other player

### Requirement: Occupied cell protection
The system MUST prevent selecting a cell that already contains a symbol.

#### Scenario: Player selects an occupied cell
- **WHEN** a player selects a cell that already contains X or O
- **THEN** the system leaves the board unchanged and keeps the current turn unchanged

### Requirement: Current turn display
The system SHALL clearly show whose turn it is during an active match. The turn indicator and player badges SHALL update in place without causing a full game screen re-render.

#### Scenario: Turn changes
- **WHEN** a valid move changes the current turn
- **THEN** the system updates the visible turn indicator to the next player's name and symbol without replacing or flashing the rest of the game screen

### Requirement: Win detection
The system SHALL automatically detect a winning row, column, or diagonal after each valid move.

#### Scenario: Player completes a winning line
- **WHEN** a valid move creates three matching symbols in a row, column, or diagonal
- **THEN** the system declares that player as the winner and ends normal move input for the match

### Requirement: Win feedback
The system SHALL show victory feedback when a player wins.

#### Scenario: Match has a winner
- **WHEN** the system detects a winning line
- **THEN** the system shows a victory modal, highlights the winning line, plays a victory animation, and plays a retro sound if sound is enabled

### Requirement: Draw handling
The system SHALL detect a draw when all cells are filled and no player has won.

#### Scenario: Board is full without winner
- **WHEN** the last empty cell is filled and no winning line exists
- **THEN** the system treats the match as a draw and automatically restarts the board for a new match using the same players and settings

### Requirement: Manual match reset
The system SHALL provide a manual reset control during gameplay.

#### Scenario: User resets the match
- **WHEN** the user activates the reset control
- **THEN** the system clears the board and starts a new match with player X to move first while preserving player names and sound settings

### Requirement: Sound control
The system SHALL provide a control to enable or disable sound effects.

#### Scenario: User toggles sound off
- **WHEN** the user disables sound
- **THEN** the system stops playing sound effects for subsequent game events

#### Scenario: User toggles sound on
- **WHEN** the user enables sound and later triggers a sound-producing game event
- **THEN** the system plays the corresponding retro sound effect
