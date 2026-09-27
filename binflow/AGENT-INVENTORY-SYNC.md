# Agent rule: BSI inventory sync (bin-hive-landing)

Adaptado de `binflow/docs/guides/BSI/surface-inventory-sync.md` al perfil `astro-repo`. **Es un gate duro.**

Antes de `git push`, `gh pr create` o un merge a la rama de producción, si el cambio tocó `src/content/home/**`, `src/components/**`, `src/layouts/**`, cualquier marker `data-bf-*` o este directorio:

1. Corre `pnpm bsi:sync` para refrescar `binflow/surface-inventory.yaml`.
2. Conserva los `bf_id` estables y los `notes` y `deny_reason` ajustados a mano; el script ya lo hace.
3. Agrega filas para los markers nuevos. No borres huérfanos en silencio: elimínalos a mano y registra la migración en `docs/BSI.md`.
4. Corre `pnpm test`, luego `pnpm build` y después `pnpm check:bsi`. Los tres deben salir con código 0.

Contrato completo: [docs/BSI.md](../docs/BSI.md).
