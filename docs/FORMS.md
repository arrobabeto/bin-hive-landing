# Forms: lista de espera (MailerLite)

## Servicio

MailerLite, mediante su formulario embebido (endpoint público `https://assets.mailerlite.com/jsonp/<ACCOUNT_ID>/forms/<FORM_ID>/subscribe`). No hay backend propio. Ver [ADR-004](./ADR-004-mailerlite-waitlist.md).

## Instancias

| Dónde | Campos |
|---|---|
| Hero (`#hero-email`) | `fields[email]` |
| Cierre (`#lista-de-espera` / `#waitlist`) | `fields[name]`, `fields[email]`, `fields[perfil]` (`creador` \| `agencia`), consentimiento |

Ambas envían también `fields[idioma]` (`es` \| `en`), `ml-submit=1` y `anticsrf=true`. El honeypot `website` nunca se envía; si viene lleno, el script simula éxito sin hacer la petición.

Los CTAs de "Para quién" preseleccionan `fields[perfil]` con `data-profile`.

## Configuración en MailerLite (una vez)

1. Crea un grupo, por ejemplo "Bin Hive · Waitlist".
2. Crea los campos personalizados `perfil` (texto) e `idioma` (texto).
3. Crea un **Embedded form** que suscriba a ese grupo, con los campos email, name, perfil e idioma. Activa el double opt-in si lo quieres; el copy de éxito ya pide revisar el correo.
4. Del código HTML del embed, copia `<ACCOUNT_ID>` y `<FORM_ID>` de la URL `…/jsonp/<ACCOUNT_ID>/forms/<FORM_ID>/subscribe`.
5. Configura `PUBLIC_MAILERLITE_ACCOUNT_ID` y `PUBLIC_MAILERLITE_FORM_ID` en Vercel (Preview y Production) y en los secrets de GitHub Actions.

> Por verificar con los IDs reales: que el endpoint responda `{"success": true}` con CORS abierto para `fetch` (es el mismo endpoint que usa el JS oficial de MailerLite) y que los campos personalizados se guarden con esos nombres. Sin JS, el POST nativo sigue registrando al usuario, pero el navegador muestra la respuesta JSON cruda.

## Variables de entorno

Son públicas por diseño, porque los IDs aparecen en el HTML. Los builds de producción fallan si faltan o son placeholders (`src/lib/mailerlite-config.mjs`, llamado desde `astro.config.mjs`).

```bash
PUBLIC_MAILERLITE_ACCOUNT_ID=123456 PUBLIC_MAILERLITE_FORM_ID=abc123 pnpm build
```

## Contrato de UX (igual que Webbin)

- El formulario conserva el fallback HTML nativo (`method="post"` + `action`).
- La mejora progresiva vive en `src/scripts/waitlist.ts` (`initAllWaitlists`):
  - Estados `idle`, `submitting`, `success` y `error`.
  - Errores tipados: `configuration`, `network`, `timeout` (10 s), `rate-limit`, `rejected`, `server` e `invalid-response`, con mensajes en ES y EN.
- El estado se anuncia en `role="status"` + `aria-live="polite"`.
- El éxito solo se muestra tras confirmar `success: true`. En el formulario completo se oculta el form, aparece el panel de éxito y recibe el foco.
- Al tener éxito se emite el evento `binhive:waitlist-success` (burbujea desde el form) para conectar analítica después.
