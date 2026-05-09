## MODIFIED Requirements

### Requirement: Persist active match state
The system SHALL persist local active match state locally in the browser. For online matches, the system SHALL persist only resumable session metadata such as room code and local player assignment, while the authoritative board state remains in the online room.

#### Scenario: Local match state changes
- **WHEN** the board, current turn, player names, game phase, or sound setting changes in a local match
- **THEN** the system stores the updated local state in localStorage

#### Scenario: Online session metadata changes
- **WHEN** the user creates or joins an online room
- **THEN** the system stores the room code and local player assignment needed to attempt reconnection without storing the online board as authoritative local state

### Requirement: Restore active match after reload
The system SHALL restore a valid persisted local match exactly where it was left after a page reload. For online sessions, the system SHALL attempt to reconnect to the persisted room and restore state from the authoritative online room.

#### Scenario: User reloads during a local match
- **WHEN** the user reloads the page with valid persisted local match state
- **THEN** the system restores the board, current turn, player names, game phase, and sound setting from storage

#### Scenario: User reloads during an online match
- **WHEN** the user reloads the page with valid online session metadata for an active room
- **THEN** the system reconnects to the room and displays the latest authoritative room state

### Requirement: Handle invalid persisted data
The system MUST avoid crashing when persisted data is missing, invalid, incompatible, or references an online room that can no longer be used.

#### Scenario: Stored local state cannot be used
- **WHEN** the application loads and persisted local state is invalid or incompatible
- **THEN** the system clears or ignores that state and displays the initial start screen

#### Scenario: Stored online session cannot be resumed
- **WHEN** the application loads and persisted online session metadata points to a missing, expired, full, or incompatible room
- **THEN** the system clears or ignores that online session metadata and displays the initial start screen with a Spanish message explaining that the room could not be resumed
