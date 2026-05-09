## Why

Al hacer una jugada en el tablero, la pantalla parpadea visiblemente. Esto degrada la experiencia de juego y da la impresión de que la UI se re-renderiza por completo en cada turno. El problema debe resolverse para lograr una experiencia fluida.

## What Changes

- Eliminar el parpadeo visual al actualizar el tablero tras una jugada
- El renderizado del tablero no debe causar reflow/repaint total de la pantalla
- Las transiciones de estado (celda vacía → marcada, celda ganadora) deben ser suaves o inmediatas sin flash

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `gameplay`: El comportamiento visual de las celdas al registrar una jugada cambia: no debe haber parpadeo perceptible entre estado anterior y nuevo estado del tablero.
- `retro-responsive-ui`: Los estilos y animaciones de celdas se ajustan para evitar cambios de layout o repaint que causen parpadeo.

## Impact

- `src/game/ui.ts`: Función que renderiza el tablero (actualmente reemplaza `innerHTML` completo en cada jugada)
- `src/styles/global.css`: Posibles ajustes a transiciones o animaciones de celdas
- Sin cambios a lógica de juego (`logic.ts`), persistencia ni PWA
