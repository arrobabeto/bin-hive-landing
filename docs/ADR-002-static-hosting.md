# ADR-002: Hosting estático en Vercel

## Estado

Aceptado (27-09-2026).

## Decisión

El sitio se publica en **Vercel** en `https://binhive.arrobabeto.com`, usando `@astrojs/vercel`.

- Todas las páginas son estáticas (prerender), igual que Webbin.
- Hay **una** ruta on-demand: `src/pages/api/waitlist.json.ts`, que corre como Vercel Function para usar la API de MailerLite sin exponer la key.

CI (`.github/workflows/ci.yml`) corre `install → check → test → build → check:bsi`.

## Enmienda (27-09-2026)

La versión original era 100% estática, con el formulario embebido de MailerLite. Se cambió a API key + group ID ([ADR-004](./ADR-004-mailerlite-waitlist.md)), así que hace falta una función de servidor.

## Consecuencias

- El output del build es `.vercel/output` (static + functions). `astro preview` no aplica: para local usa `pnpm dev`, o `vercel dev` para emular la plataforma.
- `MAILERLITE_API_KEY` y `PUBLIC_MAILERLITE_GROUP_ID` deben existir en Vercel (Production y Preview).
- `trailingSlash: 'always'` para las páginas. El endpoint usa extensión `.json`, así que queda fuera de esa regla.
