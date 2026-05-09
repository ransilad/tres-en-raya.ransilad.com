## MODIFIED Requirements

### Requirement: Initial start screen
The system SHALL display an initial start screen before a match begins using `prd/mockups/Inputs/screen.png` as the visual target and `prd/mockups/Inputs/DESIGN.md` / `prd/mockups/Inputs/code.html` as implementation references: centered title, short instruction text, mode selection for local or online play, player X and player O name fields for local mode, online room create/join controls for online mode, a decorative X/O mark treatment, a prominent pill-shaped primary action, and compact secondary controls only when they have implemented behavior.

#### Scenario: User opens the app without active match state
- **WHEN** the user opens the application and no valid active match or resumable online session is stored
- **THEN** the system displays the game title, mode selection, local player name fields by default, and a prominent start button in a redesigned setup layout matching `prd/mockups/Inputs/screen.png`

#### Scenario: User switches to online setup
- **WHEN** the user chooses online multiplayer from the initial start screen
- **THEN** the system displays controls to create an online room or join an online room instead of requiring both local player names

### Requirement: Player name validation
The system SHALL require non-empty names for all players needed by the selected mode before starting or joining a match, and validation feedback SHALL fit the redesigned setup layout from `prd/mockups/Inputs/` without shifting or breaking the input rows.

#### Scenario: User submits missing local names
- **WHEN** the user activates the local start button with either local player name empty or whitespace-only
- **THEN** the system prevents the local match from starting and displays validation feedback within the redesigned setup screen

#### Scenario: User submits valid local names
- **WHEN** the user activates the local start button with names for both local players
- **THEN** the system starts a local match using those names and assigns player X the first turn

#### Scenario: User submits missing online name
- **WHEN** the user attempts to create or join an online room with an empty or whitespace-only player name
- **THEN** the system prevents the online action and displays validation feedback within the redesigned setup screen

### Requirement: Local two-player setup
The system SHALL support two players sharing the same device, with one assigned symbol X and the other assigned symbol O, and the setup screen SHALL visually distinguish each player using the cyan X and pink/coral O styling defined in `prd/mockups/Inputs/DESIGN.md`.

#### Scenario: Match starts from setup
- **WHEN** a local match begins after valid setup
- **THEN** the system shows both player names with their assigned symbols using the redesigned game screen styling

#### Scenario: Online mode is selected
- **WHEN** the user selects online multiplayer setup
- **THEN** the system preserves local two-player setup as an available option but does not require two local names for the online match
