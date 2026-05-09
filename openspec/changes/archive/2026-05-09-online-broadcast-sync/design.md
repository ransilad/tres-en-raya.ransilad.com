## Context

El modo online usa Supabase Realtime con `postgres_changes` para notificar al rival cuando cambia la tabla `rooms`. El flujo actual:

1. Jugador A hace move → `rooms.update()` vía REST
2. Supabase WAL detecta el cambio → lo propaga al canal Realtime
3. Jugador B recibe el evento `postgres_changes` → aplica el nuevo estado de sala

El paso 2 introduce latencia adicional porque el cambio debe pasar por el Write-Ahead Log de Postgres y el pipeline de Realtime antes de llegar al cliente. En redes móviles o con carga en el proyecto Supabase, esto puede tomar 500ms–2s, lo que se siente lento en un juego en tiempo real.

**Estado actual del código relevante:**
- `rooms.ts` → `subscribeToOnlineRoom()`: suscripción `postgres_changes`
- `ui.ts` → `subscribeToCurrentRoom()`: crea la suscripción y fija timer de fallback de 1500ms
- `ui.ts` → `applyIncomingOnlineRoom()`: handler del evento Realtime

## Goals / Non-Goals

**Goals:**
- Reducir latencia de propagación de movimientos al rival usando Supabase Broadcast (WebSocket directo, sin Postgres WAL).
- Mantener `rooms` como fuente de verdad para persistencia y recuperación.
- No introducir dependencias nuevas (Broadcast ya está en `@supabase/supabase-js`).
- No cambiar el contrato de UI ni la lógica de juego.
- Mantener recuperación ante desconexión: fetch de `rooms` al reconectar.

**Non-Goals:**
- Validar movimientos en el servidor (RLS en Supabase sigue siendo la capa de seguridad; la validación lógica sigue en el cliente como ahora).
- Implementar cola de eventos persistente o event sourcing.
- Cambiar el esquema SQL de `rooms`.
- Soportar más de dos jugadores.
- Implementar presencia (online/offline indicators) más allá de lo actual.

## Decisions

### D1: Supabase Broadcast como canal de propagación

**Decisión:** Usar Supabase Broadcast en vez de `postgres_changes`.

**Por qué:** Broadcast usa un canal WebSocket directo en Supabase Realtime pero sin pasar por Postgres WAL. El mensaje llega al canal tan pronto como el emisor lo publica. Latencia típica: 50–200ms vs 300ms–2s con `postgres_changes`.

**Alternativas consideradas:**
- Mantener `postgres_changes`: sin cambio de código backend pero latencia alta.
- Polling adaptativo (300ms): predecible y sin WebSocket, pero más requests y aun mayor latencia media.
- WebSocket propio (servidor externo): máximo control pero requiere infraestructura nueva incompatible con Astro static.
- Pusher / Ably: menor latencia pero dependencia externa de pago.

**Conclusión:** Broadcast está incluido en Supabase sin costo extra y sin servidor adicional.

### D2: `rooms` sigue siendo fuente de verdad

**Decisión:** El REST update de `rooms` sigue siendo obligatorio. Broadcast solo propaga el resultado; no reemplaza la persistencia.

**Por qué:** Si un jugador se desconecta y reconecta, Broadcast no tiene historial. Al reconectar, se hace `fetchOnlineRoom()` para recuperar el estado desde `rooms`. Sin este respaldo, una desconexión breve perdería la partida.

### D3: Mensaje Broadcast contiene el snapshot completo de la sala

**Decisión:** Al emitir un evento Broadcast, incluir el objeto `room` completo (no solo el delta).

**Por qué:**
- Simplifica el receptor: aplica directamente sin necesidad de merging.
- Evita race conditions si llegan mensajes fuera de orden.
- El tamaño del payload es pequeño (tablero 9 celdas, ~400 bytes JSON).

**Alternativa:** Enviar solo el delta (index de celda + mark). Menor payload pero más lógica en el receptor y riesgo de estado inconsistente.

### D4: Un canal por sala, nombre `room:{code}`

**Decisión:** Canal: `` `room:${code}` ``. Tipo de evento unificado: `room_update`.

**Por qué:** Convención simple, ya usada en la suscripción Realtime actual. Un solo tipo de evento reduce la lógica de dispatch en el receptor.

### D5: Eliminar el timer de fallback de 1500ms

**Decisión:** Quitar el `setTimeout` de 1500ms que actualmente hace un fetch puntual de `rooms` al conectar.

**Por qué:** Con Broadcast, el canal está listo tan pronto como `.subscribe()` resuelve. El fetch inicial al entrar a la sala ya cubre el estado autoritativo. Si se pierde la conexión Broadcast, el handler `onclose` del canal puede disparar un re-fetch puntual.

### D6: Reconexión manejada por el canal Broadcast

**Decisión:** Usar el callback de estado del canal (`CHANNEL_ERROR`, `CLOSED`) para detectar desconexión y hacer fetch de `rooms` como recuperación.

**Por qué:** Supabase Realtime ya maneja reconexión automática del WebSocket. El callback de estado es el punto de enganche correcto para notificar al usuario y recuperar estado si el canal se cierra.

## Risks / Trade-offs

- **Broadcast es efímero** → Si ambos jugadores pierden conexión simultáneamente, los mensajes Broadcast se pierden. Mitigación: al reconectar se hace fetch de `rooms` para recuperar el último estado.

- **RLS no aplica a Broadcast** → Cualquier cliente puede publicar en un canal Broadcast si conoce el nombre. Mitigación: el mensaje Broadcast lleva el estado de `rooms` que fue validado por RLS en el REST update. El receptor compara `updated_at` para ignorar snapshots obsoletos (mismo guard que hoy).

- **Sin orden garantizado** → En teoría dos mensajes Broadcast podrían llegar invertidos. Mitigación: comparar `updated_at` del payload con el estado local y descartar snapshots antiguos (misma lógica de `isStaleOnlineRoom` actual).

- **Cuota de Realtime en plan gratuito** → Broadcast usa el mismo WebSocket que Realtime. El plan gratuito tiene límite de 200 conexiones concurrentes. Para este juego (2 jugadores/sala) no es un problema práctico.

## Migration Plan

1. Actualizar `rooms.ts`: añadir `broadcastRoomEvent()` y `subscribeToRoomBroadcast()`; mantener `subscribeToOnlineRoom()` durante la transición hasta validar.
2. Actualizar `ui.ts`: cambiar `subscribeToCurrentRoom()` para usar Broadcast; quitar el timer de 1500ms; añadir handler de reconexión.
3. Verificar en dos navegadores que los movimientos se propagan correctamente.
4. Eliminar `subscribeToOnlineRoom()` (Realtime) una vez validado.
5. No se requiere migración SQL ni cambios en variables de entorno.

**Rollback:** Revertir `rooms.ts` y `ui.ts` a la versión con `postgres_changes`. Sin cambios de base de datos que deshacer.

## Open Questions

- ¿Se debe mostrar indicador visual de latencia/conexión Broadcast? Por ahora se mantiene el `connectionStatus` actual.
- ¿Vale la pena habilitar presencia (Presence) en el mismo canal para detectar si el rival está activo? Fuera del alcance de esta change; podría ser una mejora posterior.
