# ADR-002: Hosting estático en Vercel

## Estado

Aceptado (27-09-2026).

## Decisión

El sitio se publica como estático en **Vercel** en `https://binhive.arrobabeto.com`, igual que Webbin. CI (`.github/workflows/ci.yml`) corre `install → check → test → build → check:bsi`.

## Consecuencias

- No hay backend: el formulario usa MailerLite ([ADR-004](./ADR-004-mailerlite-waitlist.md)).
- `PUBLIC_MAILERLITE_*` debe existir en Vercel (Preview y Production) y en los secrets de GitHub.
- `trailingSlash: 'always'`, para que las URLs canónicas sean consistentes.
