# AGENTS.md — reglas del repo `bin-hive-landing`

Estas reglas aplican a cualquier agente (Claude, Cursor, Codex…) o persona que trabaje aquí.

## 1. Documentation first

- Lee [docs/README.md](docs/README.md) antes de cambiar algo.
- Un cambio de decisión (stack, hosting, formulario, i18n, SEO, BSI) requiere un ADR nuevo o enmendado en `docs/` **en el mismo cambio**.
- Anota los cambios relevantes en [docs/CHANGELOG.md](docs/CHANGELOG.md).
- Nunca pongas secretos ni valores de `.env` en docs, fixtures o commits.

## 2. Repos de referencia (solo lectura)

- `../webbin`: arquitectura de referencia (Astro estático, tokens, formularios con mejora progresiva, Vitest, ADRs).
- `../binflow`: guías BSI (`docs/guides/BSI/`).
- `../arrobabeto-media-agents`: fuente del producto y del copy (voz, agentes, colmenas).

**No los modifiques.**

## 3. Copy

- Todo el texto visible vive en `src/content/home/{es,en}.yaml`. No hardcodees copy en componentes.
- Los `id` de listas son estables e idénticos en ambos idiomas, porque forman parte del `bf_id`.
- Voz: la de `arrobabeto-media-agents/apiario/voz-y-tono.md`. Es cercana, habla de tú y usa datos reales. Nada de frases de "texto de IA"; `tests/seo.test.ts` las bloquea.
- Solo se permiten claims verificables en la documentación del apiario. Nada de testimonios, logos ni métricas inventadas.

## 4. BSI (Binflow Surface Inventory): gate obligatorio

Contrato: [docs/BSI.md](docs/BSI.md), que resume `binflow/docs/guides/BSI/` y el brief `stacks/astro-repo.md`.

Si tu cambio toca `src/content/home/**`, `src/components/**`, `src/layouts/**` o cualquier `data-bf-*`, haz esto antes de hacer push o abrir un PR:

1. `pnpm bsi:sync`: refresca `binflow/surface-inventory.yaml`, conserva los `bf_id`, agrega filas y no borra huérfanos.
2. `pnpm test`, que incluye `tests/bsi-inventory.test.ts`.
3. `pnpm build && pnpm check:bsi`. Debe salir con código 0.

Reglas de BSI:

- `bf_id` = `{area}.{section}.{field}`. Nunca se renombra después de publicarse; renombrar requiere un id nuevo y una nota de migración en `docs/BSI.md`.
- Los markers se generan solo con `bf()` de `src/lib/bsi.ts`: atributos estáticos, sin JS de runtime ni fetch del inventario.
- Los CTAs, labels de formulario, links y aria son `chrome_denied`; nunca `copy`.
- No inventes un sistema paralelo de atributos.

## 5. CSS

- Tokens en `src/styles/tokens.css`. No uses colores ni tamaños sueltos en componentes.
- Clases con namespace `.home-*` / `.site-*`. No estilices `h1`, `p`, `a` ni `button` globalmente.
- Respeta `prefers-reduced-motion`, el foco visible, el contraste AA y los targets de 44px o más.

## 6. SEO

Checklist completo en [docs/SEO.md](docs/SEO.md). Lo mínimo:

- Un solo H1 por página y jerarquía H2 → H3 sin saltos.
- Title de 60 caracteres o menos, con la keyword primero.
- Meta description de 120 a 160 caracteres.
- Canonical, hreflang (es-MX, en, x-default) y JSON-LD válido.

## 7. Definition of Done

`pnpm check`, `pnpm test`, `pnpm build` y `pnpm check:bsi` en verde. La página debe verse bien en 375px y 1280px. Lighthouse debe dar 95 o más en las cuatro categorías.
