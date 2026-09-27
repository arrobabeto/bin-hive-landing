# ADR-007: SEO técnico y rendimiento

## Estado

Aceptado (27-09-2026).

## Decisión

Aplicamos el checklist de [SEO.md](./SEO.md): Google Search Central más los criterios on-page de Rank Math y Yoast. Varias reglas se verifican con tests (`tests/seo.test.ts`) en lugar de revisión manual. Además se inlinea el CSS (`build.inlineStylesheets: 'always'`) para eliminar el request bloqueante.

## Consecuencias

- Title y description tienen límites en el schema del contenido, así que un copy fuera de rango rompe el build.
- La keyword foco se valida en title, description, H1, alt y FAQ, con densidad acotada.
- Se mantiene un solo H1 por página y jerarquía H2 → H3.
- Objetivo: Lighthouse de 95 o más en las cuatro categorías. Última medición: móvil 99/100/100/100, desktop 100/100/100/100.
