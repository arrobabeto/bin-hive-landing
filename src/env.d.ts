/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_MAILERLITE_ACCOUNT_ID?: string;
  readonly PUBLIC_MAILERLITE_FORM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
