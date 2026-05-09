## MODIFIED Requirements

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
