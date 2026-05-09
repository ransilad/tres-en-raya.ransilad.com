## MODIFIED Requirements

### Requirement: Initial start screen
The system SHALL display an initial start screen before a match begins using `prd/mockups/Inputs/screen.png` as the visual target and `prd/mockups/Inputs/DESIGN.md` / `prd/mockups/Inputs/code.html` as implementation references: centered title, short instruction text, player X and player O name fields in large rounded rows, a decorative X/O mark treatment, a prominent pill-shaped start button, and compact secondary controls only when they have implemented behavior.

#### Scenario: User opens the app without active match state
- **WHEN** the user opens the application and no valid active match is stored
- **THEN** the system displays the game title, a player X name field, a player O name field, and a prominent start button in a redesigned setup layout matching `prd/mockups/Inputs/screen.png`

### Requirement: Player name validation
The system SHALL require non-empty names for both players before starting a match, and validation feedback SHALL fit the redesigned setup layout from `prd/mockups/Inputs/` without shifting or breaking the input rows.

#### Scenario: User submits missing names
- **WHEN** the user activates the start button with either player name empty or whitespace-only
- **THEN** the system prevents the match from starting and displays validation feedback within the redesigned setup screen

#### Scenario: User submits valid names
- **WHEN** the user activates the start button with names for both players
- **THEN** the system starts a match using those names and assigns player X the first turn

### Requirement: Local two-player setup
The system SHALL support two players sharing the same device, with one assigned symbol X and the other assigned symbol O, and the setup screen SHALL visually distinguish each player using the cyan X and pink/coral O styling defined in `prd/mockups/Inputs/DESIGN.md`.

#### Scenario: Match starts from setup
- **WHEN** a match begins after valid setup
- **THEN** the system shows both player names with their assigned symbols using the redesigned game screen styling
