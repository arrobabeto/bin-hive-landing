import { z } from 'astro/zod';

// Shape of src/content/home/{locale}.yaml. Every list item carries a stable
// `id` (same in every locale) because it becomes part of its BSI bf_id.
const text = z.string().min(1);
const id = z.string().regex(/^[a-z0-9_]+$/u, 'ids are lowercase snake_case');
const anchor = z.string().regex(/^#[a-z0-9-]+$/u);

const titled = z.object({ id, title: text, description: text });
const bullet = z.object({ id, text });

export const homeSchema = z.object({
  meta: z.object({
    title: text.max(60),
    description: text.min(120).max(160),
    og_image_alt: text,
  }),
  nav: z.object({
    skip_label: text,
    home_aria_label: text,
    links: z.array(z.object({ id, label: text, href: anchor })).min(1),
    menu_aria_label: text,
    menu_label: text,
    menu_close_aria_label: text,
    cta_label: text,
    cta_href: anchor,
    lang_label: text,
    lang_aria_label: text,
  }),
  hero: z.object({
    eyebrow: text,
    heading: text,
    subheading: text,
    body: text,
    email_label: text,
    email_placeholder: text,
    submit_label: text,
    secondary_cta_label: text,
    secondary_cta_href: anchor,
    microcopy: text,
    privacy_note: text,
    privacy_link_label: text,
    privacy_link_href: z.string().startsWith('/'),
    visual_alt: text,
  }),
  problem: z.object({ eyebrow: text, heading: text, intro: text, items: z.array(titled).min(1) }),
  whatis: z.object({
    eyebrow: text,
    heading: text,
    body: text,
    roles: z.array(z.object({ id, name: text, role: text, description: text })).min(1),
  }),
  how: z.object({ eyebrow: text, heading: text, intro: text, steps: z.array(titled).min(1) }),
  hives: z.object({
    eyebrow: text,
    heading: text,
    intro: text,
    items: z.array(z.object({ id, title: text, tagline: text, description: text })).length(4),
  }),
  workers: z.object({
    eyebrow: text,
    heading: text,
    intro: text,
    items: z.array(z.object({ id, name: text, role: text, description: text })).min(1),
    services_heading: text,
    services: z.array(z.object({ id, name: text, description: text })).min(1),
  }),
  benefits: z.object({ eyebrow: text, heading: text, items: z.array(titled).min(1) }),
  audiences: z.object({
    eyebrow: text,
    heading: text,
    items: z
      .array(
        z.object({
          id: z.enum(['creators', 'agencies']),
          title: text,
          description: text,
          points: z.array(bullet).min(1),
          cta_label: text,
        }),
      )
      .length(2),
  }),
  numbers: z.object({
    eyebrow: text,
    heading: text,
    items: z.array(z.object({ id, value: text, caption: text })).min(1),
  }),
  trust: z.object({ eyebrow: text, heading: text, body: text, items: z.array(bullet).min(1) }),
  faq: z.object({
    eyebrow: text,
    heading: text,
    items: z.array(z.object({ id, question: text, answer: text })).min(1),
  }),
  waitlist: z.object({
    eyebrow: text,
    heading: text,
    subheading: text,
    name_label: text,
    name_placeholder: text,
    email_label: text,
    email_placeholder: text,
    profile_label: text,
    profile_creator_label: text,
    profile_agency_label: text,
    consent_label: text,
    privacy_link_label: text,
    privacy_link_href: z.string().startsWith('/'),
    submit_label: text,
    submitting_label: text,
    success_heading: text,
    success_body: text,
  }),
  footer: z.object({
    tagline: text,
    credit: text,
    privacy_label: text,
    privacy_href: z.string().startsWith('/'),
    social_heading: text,
    lang_label: text,
  }),
});

export type HomeContent = z.infer<typeof homeSchema>;
