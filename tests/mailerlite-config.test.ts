// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  isValidMailerLiteId,
  mailerLiteAction,
  requireMailerLiteConfig,
} from '../src/lib/mailerlite-config.mjs';

describe('MailerLite config', () => {
  it('accepts real-looking ids and rejects placeholders', () => {
    expect(isValidMailerLiteId('123456')).toBe(true);
    expect(isValidMailerLiteId('abcDEF_12-x')).toBe(true);
    expect(isValidMailerLiteId('')).toBe(false);
    expect(isValidMailerLiteId('   ')).toBe(false);
    expect(isValidMailerLiteId(undefined)).toBe(false);
    expect(isValidMailerLiteId('your-mailerlite-form-id')).toBe(false);
    expect(isValidMailerLiteId('has spaces')).toBe(false);
    expect(isValidMailerLiteId('../evil')).toBe(false);
  });

  it('builds the embedded-form subscribe endpoint', () => {
    expect(mailerLiteAction('123', 'abc')).toBe('https://assets.mailerlite.com/jsonp/123/forms/abc/subscribe');
    expect(mailerLiteAction(undefined, undefined)).toBe('https://assets.mailerlite.com/jsonp//forms//subscribe');
  });

  it('fails production builds without real ids', () => {
    expect(() => requireMailerLiteConfig(undefined, 'abc')).toThrow(/PUBLIC_MAILERLITE_ACCOUNT_ID/);
    expect(() => requireMailerLiteConfig('123', 'your-mailerlite-form-id')).toThrow(/PUBLIC_MAILERLITE_FORM_ID/);
    expect(() => requireMailerLiteConfig('', '')).toThrow(/son obligatorias/);
    expect(requireMailerLiteConfig(' 123 ', 'abc')).toEqual({ accountId: '123', formId: 'abc' });
  });
});
