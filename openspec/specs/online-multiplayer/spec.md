## ADDED Requirements

### Requirement: Online mode selection
The system SHALL provide an online multiplayer mode for two players on different devices while keeping local two-player mode available.

#### Scenario: User chooses online mode
- **WHEN** the user selects online multiplayer from the setup flow
- **THEN** the system shows online options to create a room or join an existing room

#### Scenario: User keeps local mode
- **WHEN** the user selects local two-player mode
- **THEN** the system starts or continues the existing same-device setup flow without requiring network connectivity

### Requirement: Room creation
The system SHALL allow a player to create an online room with a display name and receive a shareable room code backed by a Supabase `rooms` record.

#### Scenario: Host creates room
- **WHEN** the host submits a valid player name to create an online room
- **THEN** the system creates a waiting room, assigns the host to one mark, and displays the room code

### Requirement: Supabase room storage
The system SHALL store online room state in Supabase using a `rooms` table with fields for room code, status, players, board, current turn, result, rematch requests, timestamps, and expiration.

#### Scenario: Room record is created
- **WHEN** an online room is created
- **THEN** Supabase stores a room record containing the initial empty board, host player data, waiting status, current turn, empty result, and expiration time

#### Scenario: Room expires
- **WHEN** an online room is older than its configured expiration time
- **THEN** the system treats the room as unavailable for joining or resuming

### Requirement: Room joining
The system SHALL allow a second player to join an existing waiting room from another device using the room code and a display name.

#### Scenario: Guest joins waiting room
- **WHEN** a guest submits a valid player name and valid room code for a room with one waiting player
- **THEN** the system adds the guest as the second player and starts the online match for both devices

#### Scenario: Guest enters unavailable room
- **WHEN** a guest submits a room code that is missing, expired, full, or already finished
- **THEN** the system prevents joining and displays a Spanish error message that explains the room cannot be used

### Requirement: Realtime board synchronization
The system SHALL use Supabase Broadcast to synchronize the board, current turn, players, phase, and result between both devices in an online match. The `rooms` table remains the authoritative source of truth and SHALL be updated on every state change; Broadcast propagates the update to the opponent in real time.

#### Scenario: Player makes online move
- **WHEN** the active online player selects an empty cell and the move is accepted
- **THEN** both devices show the updated board, next turn, and any resulting win or draw state

#### Scenario: Remote state changes
- **WHEN** the authoritative online room state changes from another device
- **THEN** the local UI updates to match that room state without requiring a page reload

#### Scenario: Broadcast delivers update faster than Postgres Realtime
- **WHEN** the active player emits a `room_update` Broadcast event after updating `rooms`
- **THEN** the opponent's UI applies the new state upon receiving the Broadcast event, without waiting for a Postgres WAL notification

### Requirement: Public client configuration
The system SHALL connect to Supabase from browser code using only public environment variables and MUST NOT expose or require the Supabase `service_role` key.

#### Scenario: Supabase config is available
- **WHEN** `PUBLIC_SUPABASE_URL` and the public anon or publishable key are configured
- **THEN** the online multiplayer client initializes Supabase using those public values

#### Scenario: Supabase config is missing
- **WHEN** required public Supabase configuration is missing
- **THEN** the system disables online multiplayer actions and displays a Spanish configuration error without affecting local play

### Requirement: Online turn enforcement
The system MUST only allow the player assigned to the current turn to submit an online move.

#### Scenario: Local player waits for opponent
- **WHEN** it is the opponent's turn in an online match
- **THEN** the system disables board input for the local player and shows that it is waiting for the opponent

#### Scenario: Player attempts invalid online move
- **WHEN** a player attempts to move out of turn, move in an occupied cell, or move after the match has ended
- **THEN** the system rejects the move and leaves the authoritative online room state unchanged

### Requirement: Online disconnect handling
The system SHALL show connection and opponent availability states during online matches.

#### Scenario: Connection is interrupted
- **WHEN** the local device loses connection to the online room
- **THEN** the system shows a reconnecting state and prevents new move submissions until synchronization is restored

#### Scenario: Opponent disconnects
- **WHEN** the remote opponent disconnects from an active online room
- **THEN** the system informs the local player that the opponent disconnected while preserving the last synchronized board state

### Requirement: Online rematch coordination
The system SHALL support starting a new board with the same online players after a win or draw when either player requests a rematch.

#### Scenario: Player requests rematch
- **WHEN** either online player chooses to play again after a completed match
- **THEN** the system resets the online board, clears the result, and starts a new online match with player X to move first for both devices

#### Scenario: One player returns to menu
- **WHEN** one online player leaves the completed match instead of requesting a rematch
- **THEN** the other player is informed that the opponent left and can return to the menu
