// Waitlist endpoint — the only on-demand route (Vercel function). Every page
// stays prerendered. Secrets come from astro:env at runtime. ADR-002 / ADR-004.
import type { APIRoute } from 'astro';
import { MAILERLITE_API_KEY, PUBLIC_MAILERLITE_GROUP_ID } from 'astro:env/server';
import { handleWaitlistRequest } from '../../lib/waitlist-server';

export const prerender = false;

export const POST: APIRoute = ({ request }) =>
  handleWaitlistRequest(request, { apiKey: MAILERLITE_API_KEY, groupId: PUBLIC_MAILERLITE_GROUP_ID });

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST' } });
