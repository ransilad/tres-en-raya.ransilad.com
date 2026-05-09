## MODIFIED Requirements

### Requirement: Current turn display
The system SHALL clearly show whose turn it is during an active match. The turn indicator and player badges SHALL update in place without causing a full game screen re-render.

#### Scenario: Turn changes
- **WHEN** a valid move changes the current turn
- **THEN** the system updates the visible turn indicator to the next player's name and symbol without replacing or flashing the rest of the game screen
