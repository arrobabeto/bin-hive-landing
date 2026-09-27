# Brand: Bin Hive

## Voz

Es la de @arrobabeto (`arrobabeto-media-agents/apiario/voz-y-tono.md`): *un colega que construye con IA todos los días y te enseña lo que funciona*.

- Habla de tú, con frases cortas y claridad antes que tecnicismo.
- La inspiración se apoya en evidencia: números reales del sistema (27 agentes, 4 colmenas, 90 días de memoria, hasta 4 preguntas por ronda).
- Es honesta: dice lo que NO hace (no publica por ti, no inventa datos).
- Frases prohibidas: “En el mundo actual”, “sumérgete”, “descubre el poder de”, “revolucionario”, “potencia tu”, “sin más preámbulos”, “en conclusión”, “es importante destacar que”. `tests/seo.test.ts` las verifica.
- El nombre canónico es **Bin Hive** (dos palabras). El slug es `bin-hive`.

## Metáfora

Apiario, apicultor, colmena, reina, obreras y aguijón forman la identidad. El diseño la traduce en hexágonos: el panal del hero, las celdas de colmenas, las obreras, los números y las viñetas.

## Visual: brutalismo + colmena

| Token | Valor | Uso |
|---|---|---|
| `--bh-ink` | `#0a0a0a` | Texto, bordes, sombras duras, secciones oscuras |
| `--bh-paper` | `#f3eee3` | Fondo base |
| `--bh-paper-2` | `#e9e1cf` | Secciones alternas |
| `--bh-honey` | `#ffc21a` | Acento principal, CTAs, celdas |
| `--bh-wax` | `#ffe58a` | Hover, celdas secundarias |
| `--bh-stinger` | `#ff3d1f` | Errores y marcas del problema (uso mínimo) |

La gramática visual:

- Bordes de 3px, radio 0 y sombras desplazadas sin blur (`6px 6px 0`).
- Los botones se "hunden" al hacer clic.
- Tipografía: **Archivo Variable** a 125% de ancho y 900 de peso para los display en mayúsculas, y Archivo normal para el cuerpo. **JetBrains Mono** para etiquetas, contadores y metadatos.
- Patrón de panal (SVG inline) en claro y en oscuro.

Todas las combinaciones de texto cumplen WCAG AA; tinta sobre miel y tinta sobre papel superan 11:1.

## Logo

Una celda hexagonal miel con un peine interior en tinta, más el wordmark "BIN HIVE" apilado (`src/components/ui/Logo.astro`). Los íconos se generan con `pnpm og`.
