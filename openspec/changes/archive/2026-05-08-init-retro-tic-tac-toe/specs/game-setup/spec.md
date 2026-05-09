## ADDED Requirements

### Requirement: Initial start screen
The system SHALL display an initial start screen before a match begins.

#### Scenario: User opens the app without active match state
- **WHEN** the user opens the application and no valid active match is stored
- **THEN** the system displays the game title, a player X name field, a player O name field, and a "Comenzar" button

### Requirement: Player name validation
The system SHALL require non-empty names for both players before starting a match.

#### Scenario: User submits missing names
- **WHEN** the user activates "Comenzar" with either player name empty or whitespace-only
- **THEN** the system prevents the match from starting and displays validation feedback

#### Scenario: User submits valid names
- **WHEN** the user activates "Comenzar" with names for both players
- **THEN** the system starts a match using those names and assigns player X the first turn

### Requirement: Local two-player setup
The system SHALL support two players sharing the same device, with one assigned symbol X and the other assigned symbol O.

#### Scenario: Match starts from setup
- **WHEN** a match begins after valid setup
- **THEN** the system shows both player names with their assigned symbols
