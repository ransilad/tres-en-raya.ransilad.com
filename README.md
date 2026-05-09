# Tres en Raya

Juego retro de Tres en Raya para dos jugadores locales y modo online 1vs1, construido con Astro y TypeScript.

**[Jugar ahora →](https://tres-en-raya.ransilad.com)**

---

## Características

- Pantalla de inicio con validación de nombres para los dos jugadores
- Tablero 3×3 con detección automática de victoria y empate
- Indicador de turno en tiempo real
- Modal de victoria con línea ganadora resaltada y efecto de sonido retro
- Reinicio automático al empate en modo local; revancha y salida sincronizadas en modo online
- Persistencia local — recarga la página y la partida local sigue donde quedó
- Control de sonido (activar/desactivar)
- Tema oscuro retro, totalmente responsive (mobile, tablet, desktop)
- PWA instalable con service worker network-first para HTML/assets de Astro y fallback offline
- Multijugador online 1vs1 con salas temporales vía Supabase Realtime

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Astro](https://astro.build) 6 — salida estática |
| Lógica | TypeScript puro, sin framework de UI |
| Estilos | CSS vanilla con variables (sin preprocesador) |
| Audio | Web Audio API — sin archivos de audio |
| Persistencia | localStorage (local) + Supabase Realtime (online) |
| PWA | Service worker + Web Manifest |
| Tests | Vitest |
| Deploy | Vercel |

## Estructura

```
src/
  pages/index.astro        # Única página (SEO, PWA, shell)
  styles/global.css        # Tema retro oscuro, responsive
  game/
    types.ts               # Tipos compartidos
    logic.ts               # Lógica pura (testable en Node)
    validation.ts          # Validación de nombres y estado
    persistence.ts         # localStorage save/load
    online/                # Cliente Supabase, salas y helpers online
    audio.ts               # Efectos de sonido (Web Audio API)
    ui.ts                  # Renderizado y eventos DOM
  tests/
    logic.test.ts
    validation.test.ts
public/
  sw.js                    # Service worker (network-first para HTML/_astro)
  manifest.json            # PWA manifest
  favicon.svg, icon-*.svg
```

## Desarrollo local

**Requisitos:** Node.js 20+ y pnpm

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

Para probar en otro dispositivo de la red local:

```bash
pnpm dev -- --host 0.0.0.0
```

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción → dist/
pnpm preview      # Servir dist/ localmente
pnpm check        # Type check (Astro + TypeScript)
pnpm test         # Tests (Vitest)
pnpm test:watch   # Tests en modo watch
```

Verificación completa antes de commit:

```bash
pnpm check && pnpm test && pnpm build
```

## Tests

Los tests cubren la lógica pura del juego, helpers online y utilidades de validación — sin dependencias de DOM.

```
src/tests/logic.test.ts        # movimientos, detección de victoria/empate, reset
src/tests/online-logic.test.ts # mapeo de sala online, turnos, rematch, expiración
src/tests/validation.test.ts   # validación de nombres, estado local y sesión online
```

## Supabase

El modo online usa Supabase Realtime con el proyecto:

```env
PUBLIC_SUPABASE_URL=https://rudyxhxefkqaowbndlom.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anon_o_publishable
```

La clave `service_role` es secreta y nunca debe usarse en frontend, variables `PUBLIC_`, ni archivos versionados.

El modo online usa una tabla `rooms` con salas temporales, tokens por jugador, estado de tablero, turno, resultado, expiración y Realtime habilitado. La app usa Supabase Realtime y una sincronización puntual de respaldo al entrar a sala; no debe usarse polling continuo porque genera ruido de red y puede causar parpadeos.

El schema de la tabla `rooms`, Realtime y RLS está en:

```text
supabase/migrations/20260509123000_create_rooms.sql
```

Las salas expiradas no se borran solas a menos que se programe limpieza. La migración incluye `public.delete_expired_rooms()`, que puede ejecutarse manualmente o programarse con `pg_cron`.

## PWA y caché

El service worker vive en `public/sw.js`. Actualmente usa cache `tres-en-raya-v4`.

- Navegación/HTML: network-first
- Assets `/_astro/`: network-first
- Otros assets públicos: cache-first con fallback

Cuando se cambie el comportamiento del service worker o assets públicos cacheados, subir el nombre de cache para evitar clientes pegados a versiones anteriores.

## Deploy

El proyecto se despliega automáticamente en Vercel desde la rama principal. La configuración está en `vercel.json`. Para habilitar online, configurar las variables públicas de Supabase en Vercel.

## Licencia

MIT
