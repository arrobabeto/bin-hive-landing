# Copy: estructura y fuentes

La fuente única es `src/content/home/{es,en}.yaml`, validada por `src/lib/home-schema.ts`. Hay 12 secciones y cada una tiene un solo H2.

| # | Sección (YAML) | Propósito | Fuente en el apiario |
|---|---|---|---|
| — | `hero` | H1 con keyword + form corto | README, CLAUDE.md |
| 1 | `problem` | Dolor: publicar por publicar | definicion-proyecto.md §1 y §3 |
| 2 | `whatis` | Metáfora: apicultor, colmenas, reina, obreras | ADR-0003, jerarquia-roles.md |
| 3 | `how` | Seis pasos | flujo-solicitud.md, ADR-0019 |
| 4 | `hives` | Una colmena por red | colmenas/*/genoma.md, ADR-0010 |
| 5 | `workers` | 5 obreras + 6 servicios visibles | agentes de colmena y apiario |
| 6 | `benefits` | Diferenciadores | arquitectura.md (principios) |
| 7 | `audiences` | Creadores / agencias | definicion-proyecto.md §5 + alcance nuevo (agencias) |
| 8 | `numbers` | 27 · 4 · 90 días · ≤4 | roadmap / memoria / ADR-0019 |
| 9 | `trust` | Control humano | voz-y-tono.md §6, alcance |
| 10 | `faq` | Objeciones (+ FAQPage JSON-LD) | docs varios |
| 11 | `waitlist` | Form completo | — |

## Claims permitidos

27 agentes especializados, 4 colmenas, 5 obreras por colmena, 7 servicios compartidos, 90 días de memoria sin repetir, hasta 4 preguntas por ronda y hasta 2 rondas de corrección. Además: no publica automáticamente, no inventa datos de productos, escritora y revisora aisladas, y afinación en lenguaje natural.

**No usar** las cifras ilustrativas de los specs de agentes ("3 h → 10 min", "2.1× más guardados"), testimonios ni logos de clientes.

## Nota de alcance

La gestión multi-cliente para agencias (un perfil por cliente bajo la cuenta de agencia) es una promesa del release que se comunica aquí. No existe en `arrobabeto-media-agents`.

## Keywords foco

- ES: **agentes de IA para redes sociales**
- EN: **AI agents for social media**
