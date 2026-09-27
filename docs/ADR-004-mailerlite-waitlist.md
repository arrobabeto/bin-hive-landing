# ADR-004: MailerLite para la lista de espera

## Estado

Aceptado (27-09-2026).

## Decisión

La lista de espera usa el **formulario embebido de MailerLite**, con fallback HTML nativo y mejora progresiva en TypeScript (`src/scripts/waitlist.ts`). Es el mismo contrato que Webbin usa con Web3Forms.

## Contexto

La landing no es de auto-enrolamiento: solo captura interesados para el release. Se necesita una lista real de newsletter (segmentable por perfil e idioma, con double opt-in), no solo emails de notificación.

## Consecuencias

- `PUBLIC_MAILERLITE_ACCOUNT_ID` y `PUBLIC_MAILERLITE_FORM_ID` son obligatorias en producción; el build falla sin ellas.
- Los datos quedan en MailerLite; el aviso de privacidad lo declara.
- Detalles y configuración: [FORMS.md](./FORMS.md).
