# Changelog

## 2026-09-27 (b)

- Lista de espera: del formulario embebido de MailerLite a la **API de MailerLite** vía `/api/waitlist.json` (Vercel Function, `@astrojs/vercel`). La key es solo de servidor (`astro:env`, `validateSecrets`).
- Env: `MAILERLITE_API_KEY` + `PUBLIC_MAILERLITE_GROUP_ID` (se eliminan `PUBLIC_MAILERLITE_ACCOUNT_ID` / `PUBLIC_MAILERLITE_FORM_ID`).
- Nota de privacidad en el form del hero, páginas `/gracias/` y `/en/thanks/` (noindex) para el fallback sin JS, y copy de éxito que no promete double opt-in.
- ADR-002 y ADR-004 enmendados; BSI con 217 superficies.

## 2026-09-27

- Versión inicial de la landing de Bin Hive (ES `/`, EN `/en/`) con Astro 7 + Tailwind 4, diseño brutalista con concepto de colmena.
- Lista de espera con MailerLite (form corto en el hero y completo al cierre) y avisos de privacidad ES/EN.
- SEO: canonical, hreflang, OG/Twitter por idioma, JSON-LD (`@graph`), sitemap i18n, robots, llms.txt, manifest.
- BSI (`astro-repo`): inventario con 214 superficies, markers `data-bf-*`, `pnpm bsi:sync`, `pnpm check:bsi` y tests.
- ADR-001 a ADR-007.
