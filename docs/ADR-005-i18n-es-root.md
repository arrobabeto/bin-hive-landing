# ADR-005: Español en la raíz, inglés en /en/

## Estado

Aceptado (27-09-2026).

## Decisión

El español (es-MX) es el idioma principal, en `/`. El inglés vive en `/en/`. `x-default` apunta al español. Los helpers están en `src/lib/i18n.ts`, adaptado de Webbin pero con la raíz invertida.

## Contexto

La voz y la audiencia del apiario son hispanohablantes (MX/LATAM). El inglés amplía el alcance del release.

## Consecuencias

- Las anclas de sección están localizadas (`#como-funciona` / `#how-it-works`); un test verifica que la nav apunte a anclas reales.
- Las páginas con slug distinto (privacidad) se emparejan en `localizedPath` y en el sitemap.
- Cada `id` de lista es idéntico en ambos YAML, porque forma parte del `bf_id` de BSI.
