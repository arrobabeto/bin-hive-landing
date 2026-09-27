# Changelog

## 2026-09-27 (d)

- Aviso de privacidad ES/EN reescrito conforme a la LFPDPPP 2025 (DOF 20-03-2025):
  - Responsable persona física con domicilio y contacto `hola@arrobabeto.com` (art. 15-I).
  - Finalidades primarias (lista de espera, lanzamiento, novedades) y secundarias (promociones y marketing, análisis agregado).
  - Cómo negarte a las secundarias o limitar el uso: correo, enlace de baja o REPEP.
  - Sin cookies en el sitio; los correos miden aperturas y clics. MailerLite y Vercel como encargados. Conservación de los datos.
  - Procedimiento ARCO completo (arts. 28, 31 y 34) y la Secretaría Anticorrupción y Buen Gobierno como autoridad.
- El `consent_label` del formulario de cierre ahora nombra las promociones. Los dos formularios solo enlazan al aviso integral (sin aviso simplificado, por decisión del propietario).
- El microcopy del hero ya no promete "nada más" que el aviso de lugares.
- Tests: `tests/legal.test.ts`. BSI: 219 superficies.

## 2026-09-27 (c)

- Navbar móvil rehecha: barra de una línea (logo · CTA · botón de menú) y panel desplegable con las secciones y el cambio de idioma. Antes eran dos filas con una tira de enlaces cortada.
- Menú accesible (`aria-expanded` / `aria-controls`, foco al primer enlace, Escape devuelve el foco, cierra al elegir sección o tocar fuera) en `src/scripts/menu.ts`, con tests. Sin JS el panel queda visible.
- En móviles de 368px o menos solo se muestra el hexágono del logo. `scroll-padding-top` unificado.
- BSI: `shared.nav.menu_label` y `shared.nav.menu_close_aria_label` (219 superficies).

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
