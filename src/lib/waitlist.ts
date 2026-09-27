import { mailerLiteAction } from './mailerlite-config.mjs';

/** MailerLite embedded-form action built from build-time public env vars. */
export function waitlistAction(): string {
  return mailerLiteAction(
    import.meta.env.PUBLIC_MAILERLITE_ACCOUNT_ID,
    import.meta.env.PUBLIC_MAILERLITE_FORM_ID,
  );
}
