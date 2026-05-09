## ADDED Requirements

### Requirement: Persist active match state
The system SHALL persist the active match state locally in the browser.

#### Scenario: Match state changes
- **WHEN** the board, current turn, player names, game phase, or sound setting changes
- **THEN** the system stores the updated state in localStorage

### Requirement: Restore active match after reload
The system SHALL restore a valid persisted match exactly where it was left after a page reload.

#### Scenario: User reloads during a match
- **WHEN** the user reloads the page with valid persisted match state
- **THEN** the system restores the board, current turn, player names, game phase, and sound setting from storage

### Requirement: Handle invalid persisted data
The system MUST avoid crashing when persisted data is missing, invalid, or incompatible.

#### Scenario: Stored state cannot be used
- **WHEN** the application loads and persisted state is invalid or incompatible
- **THEN** the system clears or ignores that state and displays the initial start screen
