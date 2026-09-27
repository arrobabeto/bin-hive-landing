# BSI: Binflow Surface Inventory (perfil `astro-repo`)

Este repo implementa **BSI**, la convención de Binflow para declarar qué partes del sitio pueden identificar y, cuando la capacidad lo permita, editar las herramientas de Binflow.

Documentos canónicos, en solo lectura, en el repo Binflow:

- General: `binflow/docs/guides/BSI/binflow-surface-inventory.md`
- Contrato y schema: `binflow/docs/guides/BSI/editable-surface-contract.md`
- Brief del stack: `binflow/docs/guides/BSI/stacks/astro-repo.md`
- Freshness (patrón adaptado aquí): `binflow/docs/guides/BSI/surface-inventory-sync.md`
- Gobierno: ADR-0058 y ADR-0064 de Binflow

Este documento describe **cómo** se aplica aquí. Decisión: [ADR-006](./ADR-006-bsi-astro-repo.md).

## Artefactos

| Artefacto | Qué es |
|---|---|
| `binflow/surface-inventory.yaml` | Inventario v1 (`project_key: bin-hive-landing`), con ~217 filas |
| `data-bf-id` / `data-bf-kind` / `data-bf-section` | Markers estáticos en el nodo raíz editable, generados solo con `bf()` (`src/lib/bsi.ts`) |
| `scripts/bsi-lib.mjs` | Reglas compartidas: derivación de `bf_id`, kinds, schema y extracción de markers |
| `scripts/sync-bsi.mjs` (`pnpm bsi:sync`) | Refresca el YAML desde el contenido; preserva `bf_id`, `notes` y `deny_reason`, y nunca borra huérfanos |
| `scripts/check-bsi.mjs` (`pnpm check:bsi`) | Gate post-build: inventario ↔ contenido ↔ markers en ES y EN |
| `tests/bsi-inventory.test.ts` | Schema, sincronía, paridad de idiomas y reglas de naming |
| `binflow/AGENT-INVENTORY-SYNC.md` | Regla para agentes antes de hacer push o abrir un PR |

## Fuente de verdad y locators

- Git es la fuente de verdad. Todo el copy vive en `src/content/home/{locale}.yaml`.
- `publication_target: github_content`.
- Locator: `github:src/content/home/{locale}.yaml#<ruta>`, con `locales: [es, en]`.
- En las listas, la ruta usa el `id` estable del ítem, nunca el índice. Ejemplo: `github:src/content/home/{locale}.yaml#problem.items[id=generic].title`.
- Los containers apuntan al componente, por ejemplo `github:src/components/home/Hero.astro#shell`.

## Derivación de `bf_id` y `kind`

- `bf_id = {area}.{section}.{field}`.
  - `area` es `shared` para `nav` y `footer`, y `home` para lo demás.
  - `section` es la clave de primer nivel del YAML.
  - `field` es la ruta aplanada con `_`, usando los `id` de las listas. Ejemplos: `home.hives.instagram_description`, `home.audiences.agencies_profiles_text`.
- `kind` se asigna así:
  - `heading` → `style_target`, en un solo nodo de texto.
  - `*_label`, `*_href`, `*_placeholder`, `cta_*`, `*_alt` y `*aria_label` → `chrome_denied`, con `deny_reason`.
  - El resto → `copy`.
- Cada sección renderizada tiene su `container` (`home.<section>.shell`, `shared.nav.shell`, `shared.footer.shell`).
- `home.meta.og_image` → `image` (`presentation: img`), con `alt_locator` apuntando a `meta.og_image_alt`.

**Filas sin marker**, porque no hay nodo propio:

- `meta.*`, que solo existe en `<head>`.
- Los valores que son atributos de un elemento ya marcado: `*_href`, `*_placeholder`, `*_alt`, `*aria_label` y `submitting_label`.

Cada una lleva una nota en `notes`.

## Flujo al cambiar la landing

```bash
# 1) edita src/content/home/*.yaml y/o componentes (usa bf() para cada nodo editable)
pnpm bsi:sync        # agrega filas nuevas y refresca samples
pnpm test            # schema + sincronía + paridad ES/EN
pnpm build && pnpm check:bsi
```

Para agregar un campo nuevo:

1. Agrégalo en ambos YAML con la misma ruta o `id`.
2. Tipéalo en `src/lib/home-schema.ts`.
3. Renderízalo con `{...bf('home.<section>.<field>', '<kind>')}`.
4. Corre `pnpm bsi:sync`.

## Reglas

1. **Los `bf_id` son contratos.** No renombres un `id` de lista ni una clave publicada. Si hace falta, crea uno nuevo y registra la migración abajo.
2. `pnpm bsi:sync` nunca borra huérfanos, y `check:bsi` falla mientras existan. Elimínalos a mano con una nota de migración.
3. Los samples de `copy` y `style_target` de 16 caracteres o más deben ser únicos, porque se usan para búsqueda por substring.
4. No se hace fetch del inventario en el cliente ni se usa JS de runtime para los markers.
5. No se marcan wrappers de layout ni hexágonos decorativos. El ticker del hero es decorativo (`aria-hidden`) y reutiliza títulos ya inventariados.
6. No hay atributos paralelos a `data-bf-*`.

## Checklist de PR (del contrato)

- [x] `binflow/surface-inventory.yaml` commiteado para las superficies declaradas
- [x] Todo nodo editable declarado tiene `data-bf-id` / `data-bf-kind` / `data-bf-section`
- [x] Las secciones con peso usan `kind: container`
- [x] Fondos CSS: no hay imágenes de fondo editables (los patrones de panal son decorativos)
- [x] Los ids de copy siguen las reglas de naming; los CTAs son `chrome_denied`
- [x] Alt y aria como filas hermanas `chrome_denied`; el OG con `alt_locator`
- [x] CSS con namespace (`.home-*`, `.site-*`), sin selectores globales de elementos
- [x] Blog: no aplica (sin blog)
- [x] Sin superficie de menú editable (la nav es `chrome_denied`)
- [x] No hay UI de CMS: la edición es solo en Git

## Migraciones de `bf_id`

| Fecha | Antes | Después | Motivo |
|---|---|---|---|
| — | — | — | — |
