// Waitlist form — progressive enhancement over a native POST to our own
// endpoint (/api/waitlist.json → MailerLite API, server-side).
// Mirrors Webbin's src/scripts/web3forms.ts contract (states, typed errors,
// timeout, aria-live status). ADR-004 · docs/FORMS.md

export type WaitlistState = 'idle' | 'submitting' | 'success' | 'error';

export type WaitlistErrorKind =
  | 'configuration'
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'rejected'
  | 'server'
  | 'invalid-response';

export type WaitlistLocale = 'es' | 'en';

export class WaitlistSubmissionError extends Error {
  kind: WaitlistErrorKind;
  status?: number;

  constructor(kind: WaitlistErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'WaitlistSubmissionError';
    this.kind = kind;
    if (status !== undefined) this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;
export const HONEYPOT_FIELD = 'website';
export const SUCCESS_EVENT = 'binhive:waitlist-success';

const MESSAGES: Record<WaitlistLocale, Record<WaitlistErrorKind, string>> = {
  es: {
    configuration: 'La lista de espera no está disponible en este momento. Intenta más tarde, por favor.',
    network: 'No pudimos conectar con el servicio. Revisa tu conexión e intenta de nuevo.',
    timeout: 'No pudimos confirmar tu registro a tiempo. Espera un momento y vuelve a intentarlo.',
    'rate-limit': 'Hubo demasiados intentos seguidos. Espera unos minutos e intenta de nuevo.',
    rejected: 'No pudimos registrarte. Revisa que tu correo esté bien escrito.',
    server: 'El servicio no está disponible en este momento. Intenta más tarde.',
    'invalid-response': 'No pudimos confirmar tu registro. Tus datos siguen aquí para reintentar.',
  },
  en: {
    configuration: "The waitlist isn't available right now. Please try again later.",
    network: "We couldn't reach the service. Check your connection and try again.",
    timeout: "We couldn't confirm your sign-up in time. Wait a moment and try again.",
    'rate-limit': 'Too many attempts in a row. Wait a few minutes and try again.',
    rejected: "We couldn't sign you up. Please check that your email is correct.",
    server: 'The service is unavailable right now. Please try again later.',
    'invalid-response': "We couldn't confirm your sign-up. Your details are still here so you can retry.",
  },
};

const SUCCESS_FALLBACK: Record<WaitlistLocale, string> = {
  es: '¡Listo, ya estás en la lista de espera!',
  en: "Done, you're on the waitlist!",
};

export function messagesFor(locale: WaitlistLocale = 'es') {
  return MESSAGES[locale];
}

const SERVER_ERROR_KINDS = new Set<WaitlistErrorKind>(['configuration', 'rate-limit', 'rejected', 'server']);

function errorFromPayload(payload: unknown, status: number, locale: WaitlistLocale): WaitlistSubmissionError {
  const messages = messagesFor(locale);
  const reported =
    typeof payload === 'object' && payload !== null && 'error' in payload ? String(payload.error) : '';
  const kind: WaitlistErrorKind = SERVER_ERROR_KINDS.has(reported as WaitlistErrorKind)
    ? (reported as WaitlistErrorKind)
    : status === 429
      ? 'rate-limit'
      : status >= 500
        ? 'server'
        : 'rejected';
  return new WaitlistSubmissionError(kind, messages[kind], status);
}

export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const trap = form.elements.namedItem(HONEYPOT_FIELD);
  return trap instanceof HTMLInputElement && trap.value.trim().length > 0;
}

interface SubmitOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  locale?: WaitlistLocale;
}

export async function submitWaitlist(
  form: HTMLFormElement,
  { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS, locale = 'es' }: SubmitOptions = {},
): Promise<void> {
  const messages = messagesFor(locale);
  const body = new FormData(form);
  body.delete(HONEYPOT_FIELD);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;
    try {
      response = await fetchImpl(form.action, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) throw new WaitlistSubmissionError('timeout', messages.timeout);
      throw new WaitlistSubmissionError('network', messages.network);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (controller.signal.aborted) throw new WaitlistSubmissionError('timeout', messages.timeout);
      if (!response.ok) throw errorFromPayload(null, response.status, locale);
      throw new WaitlistSubmissionError('invalid-response', messages['invalid-response']);
    }

    if (!response.ok) throw errorFromPayload(payload, response.status, locale);
    if (typeof payload !== 'object' || payload === null || !('success' in payload)) {
      throw new WaitlistSubmissionError('invalid-response', messages['invalid-response']);
    }
    if (payload.success !== true) throw errorFromPayload(payload, response.status, locale);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

interface InitOptions extends SubmitOptions {
  form: HTMLFormElement;
  statusElement: HTMLElement;
  /** Panel revealed on success (full form). Without it, the status shows the message. */
  successPanel?: HTMLElement | null;
  submittingLabel?: string;
  successMessage?: string;
}

export function initWaitlist({
  form,
  statusElement,
  successPanel,
  submittingLabel,
  successMessage,
  locale = 'es',
  fetchImpl,
  timeoutMs,
}: InitOptions): () => void {
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!submitButton) throw new Error('The waitlist form needs a submit button.');

  const idleLabel = submitButton.textContent?.trim() ?? '';
  const busyLabel = submittingLabel ?? (locale === 'en' ? 'Sending…' : 'Enviando…');
  let state: WaitlistState = 'idle';

  const setState = (next: WaitlistState, message = '') => {
    state = next;
    form.dataset.submissionState = next;
    form.setAttribute('aria-busy', String(next === 'submitting'));
    submitButton.disabled = next === 'submitting';
    submitButton.setAttribute('aria-disabled', String(next === 'submitting'));
    submitButton.textContent = next === 'submitting' ? busyLabel : idleLabel;
    statusElement.dataset.state = next;
    statusElement.textContent = message;
  };

  const succeed = () => {
    form.reset();
    if (successPanel) {
      setState('success', '');
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.focus();
    } else {
      setState('success', successMessage ?? SUCCESS_FALLBACK[locale]);
    }
    form.dispatchEvent(new CustomEvent(SUCCESS_EVENT, { bubbles: true }));
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (state === 'submitting') return;

    // Bots fill hidden fields: pretend it worked, send nothing.
    if (isHoneypotFilled(form)) {
      succeed();
      return;
    }

    setState('submitting', busyLabel);
    try {
      await submitWaitlist(form, { fetchImpl, timeoutMs, locale });
      succeed();
    } catch (error) {
      const message =
        error instanceof WaitlistSubmissionError ? error.message : messagesFor(locale)['invalid-response'];
      setState('error', message);
    }
  };

  setState('idle');
  form.addEventListener('submit', handleSubmit);
  return () => form.removeEventListener('submit', handleSubmit);
}

/** Wires every [data-waitlist-form] on the page. */
export function initAllWaitlists(root: Document = document): void {
  root.querySelectorAll<HTMLFormElement>('form[data-waitlist-form]').forEach((form) => {
    const statusElement = form.querySelector<HTMLElement>('[data-waitlist-status]');
    if (!statusElement) return;
    const panelId = form.dataset.successPanel;
    const locale: WaitlistLocale = form.dataset.locale === 'en' ? 'en' : 'es';
    initWaitlist({
      form,
      statusElement,
      successPanel: panelId ? root.getElementById(panelId) : null,
      submittingLabel: form.dataset.submittingLabel,
      successMessage: form.dataset.successMessage,
      locale,
    });
  });

  // Audience CTAs preselect the profile in the full form.
  root.querySelectorAll<HTMLAnchorElement>('a[data-profile]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.profile;
      const radio = root.querySelector<HTMLInputElement>(`input[name="perfil"][value="${value}"]`);
      if (radio) radio.checked = true;
    });
  });
}
