# Bin Hive · Landing

Landing de marketing (ES/EN) de **Bin Hive**, el apiario de agentes de IA para redes sociales de Arrobabeto Media. Objetivo único: registros a la **lista de espera** del release.

- Producción: `https://binhive.arrobabeto.com` (ES en `/`, EN en `/en/`)
- Stack: Astro 7 (estático) + Tailwind CSS 4 + TypeScript estricto + Vitest, con la misma arquitectura que Webbin
- Formulario: MailerLite API vía un endpoint propio (`/api/waitlist.json`, Vercel Function); el resto es estático
- BSI: Binflow Surface Inventory, perfil `astro-repo` → [`binflow/surface-inventory.yaml`](binflow/surface-inventory.yaml)

**Documentation first:** empieza por [AGENTS.md](AGENTS.md) y [docs/](docs/README.md).

## Desarrollo

Requisitos: Node 22.12+ (ver `.nvmrc`) y pnpm 10.

```bash
pnpm install
pnpm dev                 # http://localhost:4321
pnpm check               # astro check (tipos)
pnpm test                # vitest
pnpm bsi:sync            # regenera binflow/surface-inventory.yaml desde src/content/home/*.yaml
pnpm build               # requiere MAILERLITE_API_KEY y PUBLIC_MAILERLITE_GROUP_ID (.env)
pnpm check:bsi           # gate BSI post-build (markers ↔ inventario)
pnpm og                  # regenera OG images e íconos en public/
```

Copia `.env.example` a `.env`. El build **falla** sin `MAILERLITE_API_KEY` y `PUBLIC_MAILERLITE_GROUP_ID` ([docs/FORMS.md](docs/FORMS.md)). La key solo se usa en el servidor.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Todo el copy (ES/EN) | `src/content/home/{es,en}.yaml` (fuente única, validada con zod) |
| Secciones | `src/components/home/*.astro` |
| SEO (head, JSON-LD) | `src/components/ui/BaseHead.astro`, `src/lib/seo.ts` |
| Tokens visuales | `src/styles/tokens.css` |
| Formulario | `src/scripts/waitlist.ts` (cliente), `src/lib/waitlist-server.ts` + `src/pages/api/waitlist.json.ts` (servidor) |
| BSI | `binflow/`, `src/lib/bsi.ts`, `scripts/*-bsi.mjs` |
