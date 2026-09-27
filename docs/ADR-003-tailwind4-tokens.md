# ADR-003: Tailwind CSS 4 + tokens canónicos

## Estado

Aceptado (27-09-2026).

## Decisión

Usamos Tailwind CSS 4 (`@tailwindcss/vite`). La fuente visual única es `src/styles/tokens.css` (`--bh-*`), expuesta a Tailwind con `@theme inline` en `src/styles/global.css`. Es el mismo principio del ADR-006 de Webbin.

## Consecuencias

- Los componentes consumen `var(--bh-*)`; los cambios visuales se hacen primero en los tokens.
- Clases con namespace `.home-*` / `.site-*`. No hay estilos globales de `h1`, `p`, `a` ni `button` (regla CSS de BSI).
- Fuentes self-hosted con `@fontsource-variable` (Archivo con ejes wdth/wght y JetBrains Mono).
