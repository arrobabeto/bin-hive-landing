// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import {
  HONEYPOT_FIELD,
  MAILERLITE_SUBSCRIBERS_URL,
  handleWaitlistRequest,
  parseWaitlistForm,
  subscribeToWaitlist,
} from '../src/lib/waitlist-server';

const CONFIG = { apiKey: 'test-api-key-0123456789', groupId: '987654321', log: () => {} };
const ORIGIN = 'https://binhive.arrobabeto.com';

function formRequest(fields: Record<string, string>, { json = true, origin = ORIGIN } = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  const headers: Record<string, string> = {};
  if (json) headers.Accept = 'application/json';
  if (origin) headers.Origin = origin;
  return new Request(`${ORIGIN}/api/waitlist.json`, { method: 'POST', body, headers });
}

const mailerLite = (status: number) => vi.fn().mockResolvedValue(new Response('{}', { status }));

describe('parseWaitlistForm', () => {
  it('normalizes and validates the input', () => {
    const form = new FormData();
    form.set('email', '  Ana@Example.COM ');
    form.set('name', ' Ana ');
    form.set('perfil', 'agencia');
    form.set('idioma', 'en');
    const parsed = parseWaitlistForm(form);
    expect(parsed.success && parsed.data).toEqual({ email: 'ana@example.com', name: 'Ana', perfil: 'agencia', idioma: 'en' });
  });

  it('defaults the language and rejects bad values', () => {
    const ok = new FormData();
    ok.set('email', 'a@b.co');
    expect(parseWaitlistForm(ok).success && parseWaitlistForm(ok).data?.idioma).toBe('es');

    const bad = new FormData();
    bad.set('email', 'not-an-email');
    expect(parseWaitlistForm(bad).success).toBe(false);

    const badProfile = new FormData();
    badProfile.set('email', 'a@b.co');
    badProfile.set('perfil', 'hacker');
    expect(parseWaitlistForm(badProfile).success).toBe(false);
  });
});

describe('subscribeToWaitlist', () => {
  it('upserts into the group with the custom fields, authenticated server-side', async () => {
    const fetchImpl = mailerLite(201);
    const result = await subscribeToWaitlist(
      { email: 'ana@example.com', name: 'Ana', perfil: 'creador', idioma: 'es' },
      { ...CONFIG, fetchImpl },
    );
    expect(result).toEqual({ success: true });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(MAILERLITE_SUBSCRIBERS_URL);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe(`Bearer ${CONFIG.apiKey}`);
    expect(JSON.parse(init.body)).toEqual({
      email: 'ana@example.com',
      fields: { idioma: 'es', name: 'Ana', perfil: 'creador' },
      groups: ['987654321'],
    });
  });

  it.each([
    [200, { success: true }],
    [422, { success: false, error: 'rejected' }],
    [429, { success: false, error: 'rate-limit' }],
    [401, { success: false, error: 'configuration' }],
    [404, { success: false, error: 'configuration' }],
    [503, { success: false, error: 'server' }],
  ])('maps MailerLite %i', async (status, expected) => {
    const result = await subscribeToWaitlist({ email: 'a@b.co', idioma: 'es' }, { ...CONFIG, fetchImpl: mailerLite(status) });
    expect(result).toEqual(expected);
  });

  it('handles network failures and missing config without leaking details', async () => {
    const log = vi.fn();
    const failing = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    expect(await subscribeToWaitlist({ email: 'a@b.co', idioma: 'es' }, { ...CONFIG, log, fetchImpl: failing })).toEqual({
      success: false,
      error: 'server',
    });
    expect(log.mock.calls[0]![0]).not.toContain(CONFIG.apiKey);
    expect(await subscribeToWaitlist({ email: 'a@b.co', idioma: 'es' }, { ...CONFIG, apiKey: '' })).toEqual({
      success: false,
      error: 'configuration',
    });
  });
});

describe('handleWaitlistRequest', () => {
  it('returns JSON for fetch clients', async () => {
    const fetchImpl = mailerLite(201);
    const res = await handleWaitlistRequest(formRequest({ email: 'ana@example.com' }), { ...CONFIG, fetchImpl });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns a 400 JSON error for invalid input without calling MailerLite', async () => {
    const fetchImpl = mailerLite(201);
    const res = await handleWaitlistRequest(formRequest({ email: 'nope' }), { ...CONFIG, fetchImpl });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'rejected' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('silently accepts honeypot submissions without calling MailerLite', async () => {
    const fetchImpl = mailerLite(201);
    const res = await handleWaitlistRequest(formRequest({ email: 'bot@spam.io', [HONEYPOT_FIELD]: 'x' }), { ...CONFIG, fetchImpl });
    expect(await res.json()).toEqual({ success: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects cross-origin posts', async () => {
    const res = await handleWaitlistRequest(formRequest({ email: 'a@b.co' }, { origin: 'https://evil.example' }), {
      ...CONFIG,
      fetchImpl: mailerLite(201),
    });
    expect(res.status).toBe(403);
  });

  it('redirects no-JS posts to the localized thank-you or error page', async () => {
    const ok = await handleWaitlistRequest(formRequest({ email: 'a@b.co', idioma: 'en' }, { json: false }), {
      ...CONFIG,
      fetchImpl: mailerLite(201),
    });
    expect(ok.status).toBe(303);
    expect(ok.headers.get('location')).toBe(`${ORIGIN}/en/thanks/`);

    const ko = await handleWaitlistRequest(formRequest({ email: 'a@b.co' }, { json: false }), {
      ...CONFIG,
      fetchImpl: mailerLite(422),
    });
    expect(ko.headers.get('location')).toBe(`${ORIGIN}/?waitlist=error#lista-de-espera`);
  });
});
