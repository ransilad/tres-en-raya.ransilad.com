## 1. rooms.ts — Broadcast channel

- [x] 1.1 Añadir función `broadcastRoomEvent(channel, room)` que emite un evento `room_update` con el snapshot completo de la sala en el canal Broadcast dado
- [x] 1.2 Añadir función `subscribeToRoomBroadcast(roomCode, onChange, onStatusChange?)` que crea un canal Broadcast `room:{code}`, se suscribe a eventos `room_update` y llama a `onChange` con el snapshot recibido (descartando snapshots con `updated_at` ≤ al último aplicado)
- [x] 1.3 Actualizar `RoomSubscription` para exponer el canal de forma que `ui.ts` pueda usarlo para emitir eventos Broadcast
- [x] 1.4 Mantener `subscribeToOnlineRoom` pero marcarlo como obsoleto con un comentario (se elimina en la siguiente tarea)

## 2. rooms.ts — Emitir Broadcast tras cada escritura

- [x] 2.1 En `submitOnlineMove`: tras actualizar `rooms`, llamar a `broadcastRoomEvent` con el snapshot devuelto por Supabase
- [x] 2.2 En `requestOnlineRematch`: tras actualizar `rooms`, llamar a `broadcastRoomEvent` con el snapshot devuelto
- [x] 2.3 En `leaveOnlineRoom`: tras actualizar `rooms`, llamar a `broadcastRoomEvent` con el snapshot actualizado (status `abandoned`)
- [x] 2.4 En `joinOnlineRoom`: tras actualizar `rooms`, llamar a `broadcastRoomEvent` para notificar al host que el guest se unió

## 3. ui.ts — Usar Broadcast en lugar de postgres_changes

- [x] 3.1 En `subscribeToCurrentRoom()`: reemplazar la llamada a `subscribeToOnlineRoom` por `subscribeToRoomBroadcast`; guardar el canal en la variable de suscripción existente
- [x] 3.2 Eliminar el `setTimeout` de 1500ms (fallback fetch) que se dispara al suscribirse
- [x] 3.3 Pasar un callback `onStatusChange` a `subscribeToRoomBroadcast` que haga fetch de `rooms` cuando el canal entre en estado `CHANNEL_ERROR` o `CLOSED`, y aplique el snapshot recuperado con `applyIncomingOnlineRoom`
- [x] 3.4 Verificar que `cleanupRoomSubscription()` sigue llamando a `unsubscribe()` correctamente con el nuevo tipo de canal

## 4. Limpieza

- [x] 4.1 Eliminar la función `subscribeToOnlineRoom` (y su importación de `RealtimeChannel` si ya no es necesaria) una vez validado que Broadcast funciona correctamente

## 5. Verificación

- [x] 5.1 Ejecutar `pnpm check && pnpm test && pnpm build` sin errores
- [ ] 5.2 Smoke test en dos navegadores/dispositivos: crear sala, unirse, hacer movimientos, revancha, volver al menú — verificar que los cambios se propagan sin retardo visible
- [ ] 5.3 Smoke test de reconexión: desconectar y reconectar la red en uno de los clientes; verificar que el estado se recupera del fetch de `rooms`