import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HONEYPOT_FIELD,
  SUCCESS_EVENT,
  WaitlistSubmissionError,
  initWaitlist,
  submitWaitlist,
} from '../src/scripts/waitlist';

const ACTION = 'http://localhost:3000/api/waitlist.json';

function buildForm(action = ACTION) {
  document.body.innerHTML = `
    <form method="post" action="${action}">
      <input name="email" value="ana@example.com" />
      <input name="${HONEYPOT_FIELD}" value="" />
      <button type="submit">Unirme</button>
      <p data-waitlist-status></p>
    </form>
    <div id="ok" tabindex="-1" hidden></div>`;
  const form = document.querySelector('form')!;
  return {
    form,
    status: document.querySelector<HTMLElement>('[data-waitlist-status]')!,
    panel: document.getElementById('ok')!,
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('submitWaitlist', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('posts the form data without the honeypot and resolves on success', async () => {
    const { form } = buildForm();
    const fetchImpl = vi.fn().mockResolvedValue(json({ success: true }));
    await submitWaitlist(form, { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(ACTION);
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body.get('email')).toBe('ana@example.com');
    expect(body.has(HONEYPOT_FIELD)).toBe(false);
  });

  it('uses the error kind reported by the endpoint', async () => {
    const { form } = buildForm();
    const fetchImpl = vi.fn().mockResolvedValue(json({ success: false, error: 'configuration' }, 503));
    await expect(submitWaitlist(form, { fetchImpl })).rejects.toMatchObject({ kind: 'configuration' });
  });

  it.each([
    [429, 'rate-limit'],
    [500, 'server'],
    [422, 'rejected'],
  ])('maps HTTP %i without a known error kind to %s', async (status, kind) => {
    const { form } = buildForm();
    const fetchImpl = vi.fn().mockResolvedValue(new Response('oops', { status }));
    await expect(submitWaitlist(form, { fetchImpl })).rejects.toMatchObject({ kind });
  });

  it('treats success:false as rejected and a bad body as invalid-response', async () => {
    const { form } = buildForm();
    await expect(
      submitWaitlist(form, { fetchImpl: vi.fn().mockResolvedValue(json({ success: false })) }),
    ).rejects.toMatchObject({ kind: 'rejected' });
    await expect(
      submitWaitlist(form, { fetchImpl: vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })) }),
    ).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('reports network failures and timeouts', async () => {
    const { form } = buildForm();
    await expect(
      submitWaitlist(form, { fetchImpl: vi.fn().mockRejectedValue(new TypeError('offline')) }),
    ).rejects.toMatchObject({ kind: 'network' });

    const hanging = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    await expect(submitWaitlist(form, { fetchImpl: hanging as unknown as typeof fetch, timeoutMs: 5 })).rejects.toMatchObject({
      kind: 'timeout',
    });
  });

  it('localizes error messages', async () => {
    const { form } = buildForm();
    const error = await submitWaitlist(form, {
      fetchImpl: vi.fn().mockResolvedValue(json({}, 429)),
      locale: 'en',
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(WaitlistSubmissionError);
    expect((error as Error).message).toMatch(/Too many attempts/);
  });
});

describe('initWaitlist', () => {
  it('shows the error, keeps the data and re-enables the button', async () => {
    const { form, status } = buildForm();
    initWaitlist({ form, statusElement: status, fetchImpl: vi.fn().mockResolvedValue(json({}, 500)) });
    form.requestSubmit();
    await flush();
    await flush();
    expect(form.dataset.submissionState).toBe('error');
    expect(status.textContent).toMatch(/no está disponible/);
    expect(form.querySelector('button')!.disabled).toBe(false);
    expect((form.elements.namedItem('email') as HTMLInputElement).value).toBe('ana@example.com');
  });

  it('reveals the success panel and emits the success event', async () => {
    const { form, status, panel } = buildForm();
    const onSuccess = vi.fn();
    document.addEventListener(SUCCESS_EVENT, onSuccess);
    initWaitlist({
      form,
      statusElement: status,
      successPanel: panel,
      fetchImpl: vi.fn().mockResolvedValue(json({ success: true })),
    });
    form.requestSubmit();
    await flush();
    await flush();
    expect(form.hidden).toBe(true);
    expect(panel.hidden).toBe(false);
    expect(document.activeElement).toBe(panel);
    expect(onSuccess).toHaveBeenCalledOnce();
    document.removeEventListener(SUCCESS_EVENT, onSuccess);
  });

  it('silently "succeeds" for bots that fill the honeypot, without sending', async () => {
    const { form, status } = buildForm();
    (form.elements.namedItem(HONEYPOT_FIELD) as HTMLInputElement).value = 'spam';
    const fetchImpl = vi.fn();
    initWaitlist({ form, statusElement: status, fetchImpl, successMessage: 'Listo' });
    form.requestSubmit();
    await flush();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(status.textContent).toBe('Listo');
  });
});
