export declare const MAILERLITE_ACCOUNT_ENV: 'PUBLIC_MAILERLITE_ACCOUNT_ID';
export declare const MAILERLITE_FORM_ENV: 'PUBLIC_MAILERLITE_FORM_ID';
export declare function isValidMailerLiteId(value: unknown): value is string;
export declare function mailerLiteAction(accountId?: string, formId?: string): string;
export declare function requireMailerLiteConfig(
  accountId: string | undefined,
  formId: string | undefined,
): { accountId: string; formId: string };
