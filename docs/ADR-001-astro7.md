# ADR-001: Astro 7 como framework

## Estado

Aceptado (27-09-2026).

## Decisión

La landing usa **Astro 7** con `output: 'static'` y TypeScript estricto (`astro/tsconfigs/strict`). Replica la arquitectura de Webbin: layouts, componentes por sección, content collections con zod, Vitest y ADRs.

## Contexto

El propietario pidió "el mismo stack y arquitectura" que Webbin, pero con las versiones de `landing-binflow` (Astro 7 + Tailwind 4). La landing es de una sola página por idioma, sin backend.

## Consecuencias

- Todo el copy vive en una content collection (`home`), con validación de schema en build.
- JS mínimo y solo donde aporta: el formulario y el reveal.
- `@astrojs/check` corre como `pnpm check`.
