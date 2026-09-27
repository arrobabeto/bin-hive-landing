# Forms: lista de espera (MailerLite API)

## Arquitectura

```text
<form action="/api/waitlist.json">  ──POST──▶  Vercel function (src/pages/api/waitlist.json.ts)
   (HTML estático + mejora progresiva)            │  valida (zod), honeypot, origin
                                                  ▼
                                   MailerLite API · POST https://connect.mailerlite.com/api/subscribers
                                   Authorization: Bearer MAILERLITE_API_KEY
                                   { email, fields: { name, perfil, idioma }, groups: [PUBLIC_MAILERLITE_GROUP_ID] }
```

- Todas las páginas siguen prerenderizadas. El endpoint es la **única** ruta on-demand; ver [ADR-002](./ADR-002-static-hosting.md) y [ADR-004](./ADR-004-mailerlite-waitlist.md).
- La lógica vive en `src/lib/waitlist-server.ts`, con tests en `tests/waitlist-server.test.ts`. La ruta de Astro es solo un adaptador.
- La API key se lee con `astro:env/server` (`access: 'secret'`, en runtime) y **nunca** llega al navegador ni al HTML. Verificado: no aparece en `.vercel/output`.

## Variables de entorno

| Variable | Uso | Dónde configurarla |
|---|---|---|
| `MAILERLITE_API_KEY` | Token de la API (secreto) | `.env` local, Vercel (Production + Preview) |
| `PUBLIC_MAILERLITE_GROUP_ID` | Grupo de la lista de espera ("Binhive") | `.env` local, Vercel (Production + Preview) |

Con `validateSecrets: true`, `astro build` falla si falta alguna. El CI usa valores ficticios solo para compilar; nunca despliega.

## Instancias del formulario

| Dónde | Campos enviados |
|---|---|
| Hero (`#hero-email`) | `email`, `idioma` |
| Cierre (`#lista-de-espera` / `#waitlist`) | `name`, `email`, `perfil` (`creador` \| `agencia`), `consent`, `idioma` |

El honeypot `website` nunca llega a MailerLite; si viene lleno, el endpoint responde éxito sin hacer nada. Los CTAs de "Para quién" preseleccionan `perfil`.

## Respuestas del endpoint

| Caso | JS (`Accept: application/json`) | Sin JS (POST nativo) |
|---|---|---|
| Alta nueva o existente (MailerLite 201 / 200) | `200 {"success":true}` | `303` → `/gracias/` · `/en/thanks/` (noindex) |
| Datos inválidos (zod o MailerLite 422) | `400 {"success":false,"error":"rejected"}` | `303` → `/?waitlist=error#lista-de-espera` |
| Rate limit (429) | `429 … "rate-limit"` | igual que el error |
| Key o grupo inválidos (401/403/404) | `503 … "configuration"` (se registra en los logs de Vercel) | igual que el error |
| MailerLite caído, timeout (8 s) o 5xx | `502 … "server"` | igual que el error |
| `Origin` de otro sitio | `403` (check del endpoint + `security.checkOrigin` de Astro) | — |

## Campos personalizados en MailerLite

El endpoint envía `fields.perfil` y `fields.idioma`. **Deben existir como campos personalizados** en MailerLite (Subscribers → Fields); si no, MailerLite descarta esos valores. `name` es un campo por defecto.

## Double opt-in

Por defecto, un alta por API queda activa sin correo de confirmación. Si quieres confirmación, activa en MailerLite **Account settings → Subscribe settings → "Double opt-in for API and integrations"**. El copy de éxito no promete confirmación, así que sirve en ambos casos.

## Contrato de UX (igual que Webbin)

- Fallback HTML nativo (`method="post"` + `action`) con redirección a páginas de gracias.
- La mejora progresiva vive en `src/scripts/waitlist.ts`:
  - Estados `idle`, `submitting`, `success` y `error`.
  - Errores tipados: los que reporta el endpoint más `network`, `timeout` (10 s) e `invalid-response`, con mensajes en ES y EN.
- El estado se anuncia en `role="status"` + `aria-live="polite"`. El éxito solo se muestra tras `success: true`; el panel de éxito recibe el foco.
- Al tener éxito se emite el evento `binhive:waitlist-success` para conectar analítica después.
