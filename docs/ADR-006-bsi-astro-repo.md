# ADR-006: Adoptar BSI con el perfil `astro-repo`

## Estado

Aceptado (27-09-2026).

## Decisión

La landing adopta **Binflow Surface Inventory (BSI)** desde el día uno, con el brief `astro-repo`. Esto implica:

- Inventario en `binflow/surface-inventory.yaml` y markers `data-bf-*` estáticos.
- Copy en Git (`publication_target: github_content`).
- `bf_id` derivados de forma determinista del contenido, con gates automáticos (`pnpm bsi:sync`, tests, `pnpm check:bsi`).

## Contexto

BSI es opcional para Astro (ADR-0064 de Binflow), pero en un sitio greenfield pensado para Binflow conviene declararlo antes de la primera capacidad. Así las herramientas no tienen que adivinar campos.

## Consecuencias

- Todo nodo editable se marca con `bf()`. Todo cambio de copy o componentes pasa por el gate de [BSI.md](./BSI.md).
- Los `bf_id` son contratos: no se renombran sin migración.
- El repo Binflow no se modifica. Si el perfil necesita cambios, se proponen allá.
