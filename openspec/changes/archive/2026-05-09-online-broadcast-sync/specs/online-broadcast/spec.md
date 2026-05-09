## ADDED Requirements

### Requirement: Broadcast channel per room
The system SHALL open a Supabase Broadcast WebSocket channel named `room:{code}` when a player joins or creates an online room, and SHALL close it when the player leaves the room or returns to the menu.

#### Scenario: Channel opens on room entry
- **WHEN** a player successfully creates or joins an online room
- **THEN** the system subscribes to the Broadcast channel `room:{code}` and is ready to send and receive events

#### Scenario: Channel closes on room exit
- **WHEN** a player returns to the menu or the room is abandoned
- **THEN** the system unsubscribes from the Broadcast channel and releases the WebSocket resource

### Requirement: Broadcast move propagation
The system SHALL emit a `room_update` Broadcast event containing the full current room snapshot after every authoritative `rooms` table update (move, rematch, abandon).

#### Scenario: Move is broadcast to opponent
- **WHEN** the active player submits a valid online move and the `rooms` record is updated
- **THEN** the system emits a `room_update` Broadcast event with the updated room snapshot on the `room:{code}` channel

#### Scenario: Opponent receives broadcast update
- **WHEN** a `room_update` Broadcast event arrives on the active channel
- **THEN** the system applies the room snapshot to the local UI immediately without waiting for a Postgres Realtime notification

### Requirement: Stale broadcast guard
The system SHALL discard incoming Broadcast snapshots that are older than the current local state based on `updated_at`.

#### Scenario: Out-of-order message is discarded
- **WHEN** a `room_update` Broadcast event arrives with an `updated_at` timestamp older than or equal to the last applied snapshot
- **THEN** the system ignores the event and leaves the local UI unchanged

### Requirement: Broadcast reconnection recovery
The system SHALL recover authoritative room state from the `rooms` table when the Broadcast channel connection is interrupted.

#### Scenario: Channel error triggers recovery fetch
- **WHEN** the Broadcast channel enters an error or closed state
- **THEN** the system fetches the current room record from `rooms` and applies it to the local UI to restore consistent state
