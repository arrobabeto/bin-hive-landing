# SEO: checklist y verificación

Criterios de Google Search Central y de los análisis on-page de Rank Math y Yoast, adaptados a una landing estática bilingüe.

## On-page (Rank Math / Yoast)

| Criterio | Implementación | Verificación |
|---|---|---|
| Keyword foco en el title, al inicio | `meta.title` en YAML | `tests/seo.test.ts` |
| Title ≤ 60 caracteres, marca al final | `… \| Bin Hive` | schema zod + test |
| Meta description de 120 a 160 caracteres con keyword y CTA | `meta.description` | schema zod + test |
| Keyword en el H1 | `hero.heading` | test |
| Keyword en las primeras 100 palabras | subheading del hero y FAQ #1 | revisión |
| Keyword en el alt de la imagen | `meta.og_image_alt` | test |
| Densidad sin stuffing (≤ 2.5%) | copy natural | test |
| Un H1 por página y H2 → H3 sin saltos | `SectionHeader` (H2), tarjetas (H3) | auditoría del HTML construido |
| URLs cortas | `/`, `/en/`, `/privacidad/`, `/en/privacy/` | — |
| Enlaces internos descriptivos | nav de anclas localizadas | test i18n (anclas válidas) |
| Enlaces externos | Instagram y webbin.com.mx (`rel="me noopener"`) | — |
| Legibilidad | párrafos cortos, frases breves, voz activa | revisión |

## Técnico (Google)

- `canonical` autorreferente en las páginas indexables. El 404 es `noindex` y no tiene canonical.
- `hreflang`: `es-MX`, `en` y `x-default` (→ ES) en el HTML. Los alternates van también en el sitemap, incluido el par de privacidad con slugs distintos.
- `robots`: `index, follow, max-image-preview:large, max-snippet:-1`. `public/robots.txt` apunta al sitemap.
- Sitemap: `@astrojs/sitemap` con i18n (`/sitemap-index.xml`).
- Datos estructurados: un `@graph` con Organization, WebSite, WebPage, SoftwareApplication y FAQPage (`src/lib/seo.ts`).
  - No hay precios ni ratings falsos, así que SoftwareApplication no pretende rich result.
  - Desde 2023 Google limita los rich results de FAQ, pero el marcado sigue siendo válido y útil para motores generativos.
- Open Graph y Twitter con `summary_large_image`: OG de 1200×630 por idioma (`public/og/og-{es,en}.png`) con alt, `og:locale` y `og:locale:alternate`.
- `llms.txt` para motores generativos (GEO).
- Las páginas de gracias son `noindex` y quedan fuera del sitemap.
- Favicons (svg, ico, apple-touch), `site.webmanifest` y `theme-color`.

## Core Web Vitals

- HTML estático con JS mínimo: solo el formulario (~4.6 KB) y el reveal.
- CSS inline (`build.inlineStylesheets: 'always'`, ~11 KB gzip), sin request bloqueante.
- Fuentes self-hosted con subset por unicode-range y `font-display: swap`. Preload de Archivo latin.
- Visuales en SVG inline con dimensiones explícitas (CLS 0).

Resultado (Lighthouse, 27-09-2026, preview local):

| Formato | Performance | Accessibility | Best practices | SEO | Métricas |
|---|---|---|---|---|---|
| Móvil | 99 | 100 | 100 | 100 | LCP 1.9 s, CLS 0, TBT 0 ms |
| Desktop | 100 | 100 | 100 | 100 | — |

## Antes de lanzar

- [ ] Dar de alta `binhive.arrobabeto.com` en Google Search Console y enviar `sitemap-index.xml`.
- [ ] Validar el JSON-LD en <https://validator.schema.org/> y el preview social en las herramientas de LinkedIn, X y Meta.
