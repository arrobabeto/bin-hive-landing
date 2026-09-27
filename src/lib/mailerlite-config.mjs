// MailerLite embedded-form configuration (ADR-004). Mirrors Webbin's
// web3forms-config.mjs: production builds fail without real ids.
export const MAILERLITE_ACCOUNT_ENV = 'PUBLIC_MAILERLITE_ACCOUNT_ID';
export const MAILERLITE_FORM_ENV = 'PUBLIC_MAILERLITE_FORM_ID';

const PLACEHOLDER_VALUES = new Set([
  'YOUR-MAILERLITE-ACCOUNT-ID',
  'YOUR-MAILERLITE-FORM-ID',
  'YOUR_MAILERLITE_ACCOUNT_ID',
  'YOUR_MAILERLITE_FORM_ID',
  'TU_ACCOUNT_ID',
  'TU_FORM_ID',
]);

export function isValidMailerLiteId(value) {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    !PLACEHOLDER_VALUES.has(normalized.toUpperCase()) &&
    /^[A-Za-z0-9_-]+$/u.test(normalized)
  );
}

export function mailerLiteAction(accountId, formId) {
  const account = encodeURIComponent(String(accountId ?? '').trim());
  const form = encodeURIComponent(String(formId ?? '').trim());
  return `https://assets.mailerlite.com/jsonp/${account}/forms/${form}/subscribe`;
}

export function requireMailerLiteConfig(accountId, formId) {
  const missing = [];
  if (!isValidMailerLiteId(accountId)) missing.push(MAILERLITE_ACCOUNT_ENV);
  if (!isValidMailerLiteId(formId)) missing.push(MAILERLITE_FORM_ENV);

  if (missing.length > 0) {
    throw new Error(
      `[config] ${missing.join(' y ')} ${missing.length > 1 ? 'son obligatorias' : 'es obligatoria'} ` +
        'para builds de producción. Configura el formulario embebido de MailerLite en el entorno de build (ver docs/FORMS.md).',
    );
  }

  return { accountId: accountId.trim(), formId: formId.trim() };
}
