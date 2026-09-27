# ADR-004: MailerLite para la lista de espera

## Estado

Aceptado (27-09-2026).

## Decisión

La lista de espera usa la **API de MailerLite** (`POST /api/subscribers`, upsert al grupo de la lista) desde un endpoint propio (`/api/waitlist.json`, Vercel Function). El formulario conserva el fallback HTML nativo y la mejora progresiva en TypeScript (`src/scripts/waitlist.ts`), con el mismo contrato que Webbin usa con Web3Forms.

## Enmienda (27-09-2026)

La versión inicial usaba el formulario embebido (`PUBLIC_MAILERLITE_ACCOUNT_ID` / `PUBLIC_MAILERLITE_FORM_ID`). El propietario proporcionó `MAILERLITE_API_KEY` + `PUBLIC_MAILERLITE_GROUP_ID`. Como la key es secreta, la llamada debe hacerse en el servidor.

## Contexto

La landing no es de auto-enrolamiento: solo captura interesados para el release. Se necesita una lista real de newsletter (segmentable por perfil e idioma, con double opt-in), no solo emails de notificación.

## Consecuencias

- `MAILERLITE_API_KEY` (secreto, `astro:env` server) y `PUBLIC_MAILERLITE_GROUP_ID` son obligatorias; el build falla sin ellas (`validateSecrets: true`).
- El endpoint valida con zod, filtra el honeypot, rechaza orígenes cruzados y no expone detalles de MailerLite al cliente.
- Los campos personalizados `perfil` e `idioma` deben existir en MailerLite.
- Los datos quedan en MailerLite; el aviso de privacidad lo declara.
- Detalles y configuración: [FORMS.md](./FORMS.md).
