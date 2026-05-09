## Why

El modo online actual usa Supabase Realtime (`postgres_changes`) para sincronizar movimientos entre jugadores, lo que introduce latencia perceptible: el rival ve el movimiento con un retardo apreciable porque la notificación pasa por Postgres WAL → Realtime → cliente. El usuario experimenta la partida como lenta e imprecisa. Supabase Broadcast es un canal WebSocket directo dentro del mismo proyecto Supabase, sin pasar por Postgres, lo que reduce la latencia de propagación significativamente.

## What Changes

- Reemplazar `subscribeToOnlineRoom()` (Postgres Realtime) por un canal Broadcast WebSocket para sincronización en tiempo real de movimientos, revancha y salida.
- Mantener la tabla `rooms` como estado autoritativo para persistencia, recuperación al reconectar y validación RLS.
- Al conectarse a una sala, hacer un fetch inicial de `rooms` (como ahora) y luego suscribirse al canal Broadcast.
- Al enviar un movimiento: actualizar `rooms` vía REST y emitir un mensaje Broadcast con el nuevo estado de la sala.
- Al recibir un mensaje Broadcast: aplicar el estado directamente en la UI sin esperar confirmación de Postgres.
- Si el canal Broadcast pierde conexión, hacer un fetch puntual de `rooms` para recuperar el estado.
- Eliminar el timer de fallback de 1500ms que actualmente hace un fetch de respaldo.
- Mantener el movimiento optimista para el jugador local (sin cambio de comportamiento visible).

## Capabilities

### New Capabilities

- `online-broadcast`: Canal Broadcast WebSocket para propagar eventos de sala entre jugadores en tiempo real, sin pasar por Postgres Realtime.

### Modified Capabilities

- `online-multiplayer`: La sincronización entre jugadores cambia de `postgres_changes` a Broadcast. Los requisitos de persistencia, recuperación y flujo de juego (crear sala, unirse, moverse, revancha, salir) no cambian; solo cambia el mecanismo de propagación en tiempo real.

## Impact

- `src/game/online/rooms.ts`: nueva función `subscribeToRoomBroadcast()`, nueva función `broadcastRoomEvent()`, eliminar la suscripción a `postgres_changes`.
- `src/game/ui.ts`: actualizar `subscribeToCurrentRoom()` y `cleanupRoomSubscription()` para usar Broadcast; ajustar handler de reconexión.
- `supabase/migrations/`: no se requiere migración nueva; Broadcast no necesita configuración SQL. La tabla `rooms` y su RLS no cambian.
- `@supabase/supabase-js`: ya incluye soporte Broadcast; sin dependencias nuevas.
- Sin cambios de API pública, sin cambios en tipos de `online/types.ts`, sin cambios de UI/UX.
