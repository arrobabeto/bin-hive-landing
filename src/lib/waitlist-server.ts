// Server-side waitlist logic (runs only in the Vercel function behind
// src/pages/api/waitlist.json.ts). The MailerLite API key never reaches the
// browser. ADR-004 · docs/FORMS.md
import { z } from 'astro/zod';

export const MAILERLITE_SUBSCRIBERS_URL = 'https://connect.mailerlite.com/api/subscribers';
export const HONEYPOT_FIELD = 'website';
const UPSTREAM_TIMEOUT_MS = 8_000;

export type WaitlistErrorKind = 'configuration' | 'rate-limit' | 'rejected' | 'server';
export type WaitlistResult = { success: true } | { success: false; error: WaitlistErrorKind };

export const waitlistInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  name: z.string().trim().max(80).optional(),
  perfil: z.enum(['creador', 'agencia']).optional(),
  idioma: z.enum(['es', 'en']).default('es'),
});

export type WaitlistInput = z.infer<typeof waitlistInputSchema>;

export interface WaitlistConfig {
  apiKey: string;
  groupId: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  log?: (message: string) => void;
}

const blankToUndefined = (value: FormDataEntryValue | null) =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

export function parseWaitlistForm(form: FormData) {
  return waitlistInputSchema.safeParse({
    email: blankToUndefined(form.get('email')),
    name: blankToUndefined(form.get('name')),
    perfil: blankToUndefined(form.get('perfil')),
    idioma: blankToUndefined(form.get('idioma')),
  });
}

/** Upserts the subscriber into the waitlist group via the MailerLite API. */
export async function subscribeToWaitlist(input: WaitlistInput, config: WaitlistConfig): Promise<WaitlistResult> {
  const { apiKey, groupId, fetchImpl = fetch, timeoutMs = UPSTREAM_TIMEOUT_MS, log = console.error } = config;
  if (!apiKey || !groupId) return { success: false, error: 'configuration' };

  const fields: Record<string, string> = { idioma: input.idioma };
  if (input.name) fields.name = input.name;
  if (input.perfil) fields.perfil = input.perfil;

  let response: Response;
  try {
    response = await fetchImpl(MAILERLITE_SUBSCRIBERS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: input.email, fields, groups: [groupId] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    log(`[waitlist] MailerLite request failed: ${error instanceof Error ? error.name : 'unknown'}`);
    return { success: false, error: 'server' };
  }

  if (response.status === 200 || response.status === 201) return { success: true };
  if (response.status === 422) return { success: false, error: 'rejected' };
  if (response.status === 429) return { success: false, error: 'rate-limit' };
  // 401/403/404: bad key or group id — an operator problem, not the visitor's.
  log(`[waitlist] MailerLite responded ${response.status}`);
  return { success: false, error: response.status >= 500 ? 'server' : 'configuration' };
}

const STATUS_FOR: Record<WaitlistErrorKind, number> = {
  configuration: 503,
  'rate-limit': 429,
  rejected: 400,
  server: 502,
};

const REDIRECTS = {
  es: { success: '/gracias/', error: '/?waitlist=error#lista-de-espera' },
  en: { success: '/en/thanks/', error: '/en/?waitlist=error#waitlist' },
} as const;

/**
 * Handles a waitlist POST. JS clients (Accept: application/json) get JSON;
 * the native no-JS form POST gets a 303 redirect to a thank-you/error page.
 */
export async function handleWaitlistRequest(request: Request, config: WaitlistConfig): Promise<Response> {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const requestUrl = new URL(request.url);

  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) {
    return Response.json({ success: false, error: 'rejected' } satisfies WaitlistResult, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ success: false, error: 'rejected' } satisfies WaitlistResult, { status: 400 });
  }

  const locale = form.get('idioma') === 'en' ? 'en' : 'es';
  const reply = (result: WaitlistResult) => {
    if (!wantsJson) {
      const target = result.success ? REDIRECTS[locale].success : REDIRECTS[locale].error;
      return new Response(null, { status: 303, headers: { Location: new URL(target, requestUrl).toString() } });
    }
    return Response.json(result, {
      status: result.success ? 200 : STATUS_FOR[result.error],
      headers: { 'Cache-Control': 'no-store' },
    });
  };

  // Bots fill hidden fields: pretend it worked, send nothing upstream.
  if (blankToUndefined(form.get(HONEYPOT_FIELD))) return reply({ success: true });

  const parsed = parseWaitlistForm(form);
  if (!parsed.success) return reply({ success: false, error: 'rejected' });

  return reply(await subscribeToWaitlist(parsed.data, config));
}
