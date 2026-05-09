# Tres en Raya

Juego retro de Tres en Raya para dos jugadores locales, construido con Astro y TypeScript.

**[Jugar ahora →](https://tres-en-raya.ransilad.com)**

---

## Características

- Pantalla de inicio con validación de nombres para los dos jugadores
- Tablero 3×3 con detección automática de victoria y empate
- Indicador de turno en tiempo real
- Modal de victoria con línea ganadora resaltada y efecto de sonido retro
- Reinicio automático al empate, reinicio manual disponible en cualquier momento
- Persistencia local — recarga la página y la partida sigue donde quedó
- Control de sonido (activar/desactivar)
- Tema oscuro retro, totalmente responsive (mobile, tablet, desktop)
- PWA instalable y funciona offline tras la primera carga

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Astro](https://astro.build) 4 — salida estática |
| Lógica | TypeScript puro, sin framework de UI |
| Estilos | CSS vanilla con variables (sin preprocesador) |
| Audio | Web Audio API — sin archivos de audio |
| Persistencia | localStorage (clave `tres-en-raya-state`, versionado) |
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
    audio.ts               # Efectos de sonido (Web Audio API)
    ui.ts                  # Renderizado y eventos DOM
  tests/
    logic.test.ts
    validation.test.ts
public/
  sw.js                    # Service worker (cache-first)
  manifest.json            # PWA manifest
  favicon.svg, icon-*.svg
```

## Desarrollo local

**Requisitos:** Node.js 20+ y pnpm

```bash
pnpm install
pnpm dev        # http://localhost:4321
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

Los tests cubren la lógica pura del juego y las utilidades de validación — sin dependencias de DOM.

```
src/tests/logic.test.ts       # 13 tests: movimientos, detección de victoria/empate, reset
src/tests/validation.test.ts  # 12 tests: validación de nombres y estado persistido
```

## Deploy

El proyecto se despliega automáticamente en Vercel desde la rama principal. La configuración está en `vercel.json`. No requiere variables de entorno.

## Licencia

MIT
