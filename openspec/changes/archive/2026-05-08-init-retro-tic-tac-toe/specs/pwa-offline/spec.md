## ADDED Requirements

### Requirement: Web app manifest
The system SHALL provide a valid web app manifest for installable PWA behavior.

#### Scenario: Browser checks installability metadata
- **WHEN** a compatible browser loads the application
- **THEN** the browser can discover the manifest with app name, icons, start URL, display mode, and theme metadata

### Requirement: Service worker registration
The system SHALL register a service worker in production-capable browser environments.

#### Scenario: Browser supports service workers
- **WHEN** the application loads in a browser that supports service workers
- **THEN** the system registers the service worker without console errors

### Requirement: Offline play after first load
The system SHALL allow the game to load and be played offline after the first successful online load.

#### Scenario: User returns offline after first load
- **WHEN** the user opens the application without network access after a successful prior load
- **THEN** the application shell and required game assets load from cache and the local game remains playable
