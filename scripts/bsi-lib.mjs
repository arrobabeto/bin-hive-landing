// Binflow Surface Inventory (BSI) — shared rules for this repo (astro-repo).
// Used by scripts/sync-bsi.mjs, scripts/check-bsi.mjs and tests/bsi-inventory.test.ts.
//
// The landing copy lives in src/content/home/{locale}.yaml. Every string field
// there is a surface; its bf_id and kind are derived deterministically so the
// inventory, the YAML and the rendered data-bf-* markers can be cross-checked.
// Contract: docs/BSI.md (Binflow docs/guides/BSI + stacks/astro-repo.md).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { z } from 'zod';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const INVENTORY_PATH = 'binflow/surface-inventory.yaml';
export const PROJECT_KEY = 'bin-hive-landing';
export const LOCALES = ['es', 'en'];
export const SAMPLE_LOCALE = 'es';
export const CONTENT_PATH = 'src/content/home/{locale}.yaml';
export const PUBLICATION_TARGET = 'github_content';

export const KINDS = [
  'copy',
  'style_target',
  'image',
  'chrome_denied',
  'catalog_bound',
  'video',
  'overlay',
  'container',
];

/** YAML section → component that renders it (container shell owner). */
export const SECTION_COMPONENTS = {
  nav: 'src/components/layout/Header.astro',
  hero: 'src/components/home/Hero.astro',
  problem: 'src/components/home/Problem.astro',
  whatis: 'src/components/home/WhatIs.astro',
  how: 'src/components/home/HowItWorks.astro',
  hives: 'src/components/home/Hives.astro',
  workers: 'src/components/home/Workers.astro',
  benefits: 'src/components/home/Benefits.astro',
  audiences: 'src/components/home/Audiences.astro',
  numbers: 'src/components/home/Numbers.astro',
  trust: 'src/components/home/Trust.astro',
  faq: 'src/components/home/Faq.astro',
  waitlist: 'src/components/home/FinalCta.astro',
  footer: 'src/components/layout/Footer.astro',
};

/** Sections rendered in the shared chrome (Header/Footer) use area `shared`. */
export const SHARED_SECTIONS = new Set(['nav', 'footer']);

/** Sections that only render into <head> (no markers possible). */
export const HEAD_SECTIONS = new Set(['meta']);

const CHROME_FIELD =
  /(^|_)(label|href|placeholder|url)$|^(cta|link|nav|menu|aria)_|(_|^)aria_label$|_alt$/u;

// Values rendered as HTML attributes of an element that already carries the
// marker of a sibling field (href of a link, placeholder of an input, alt/aria
// of a visual, JS-only state labels). They get inventory rows but no marker.
const ATTRIBUTE_FIELD = /(^|_)(href|placeholder|url)$|_alt$|aria_label$|^submitting_label$/u;

export const BF_ID = /^[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/u;

export function kindForField(field) {
  if (field === 'heading') return 'style_target';
  if (CHROME_FIELD.test(field)) return 'chrome_denied';
  return 'copy';
}

export function isAttributeField(field) {
  return ATTRIBUTE_FIELD.test(field);
}

function areaFor(section) {
  return SHARED_SECTIONS.has(section) ? 'shared' : 'home';
}

function contentLocator(yamlPath) {
  return `github:${CONTENT_PATH}#${yamlPath}`;
}

/**
 * Walks one locale's content object and returns every string surface:
 * { bf_id, area, section, field, yamlPath, value }.
 * Lists must be arrays of objects with a stable `id`.
 */
export function walkContent(content) {
  const out = [];

  const visit = (section, prefix, pathPrefix, value) => {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'id') continue;
      const field = prefix ? `${prefix}_${key}` : key;
      const yamlPath = `${pathPrefix}.${key}`;

      if (typeof child === 'string') {
        out.push({ section, field, yamlPath, value: child });
      } else if (Array.isArray(child)) {
        for (const item of child) {
          if (typeof item !== 'object' || item === null || typeof item.id !== 'string') {
            throw new Error(`[bsi] ${yamlPath}: list items need a stable string "id"`);
          }
          const itemPrefix = prefix ? `${prefix}_${item.id}` : item.id;
          visit(section, itemPrefix, `${yamlPath}[id=${item.id}]`, item);
        }
      } else if (child && typeof child === 'object') {
        visit(section, field, yamlPath, child);
      }
    }
  };

  for (const [section, value] of Object.entries(content)) {
    visit(section, '', section, value);
  }

  return out.map((entry) => ({
    ...entry,
    area: areaFor(entry.section),
    bf_id: `${areaFor(entry.section)}.${entry.section}.${entry.field}`,
  }));
}

export function loadContent(locale) {
  return parse(readFileSync(new URL(`../src/content/home/${locale}.yaml`, import.meta.url), 'utf8'));
}

export function loadInventory() {
  return parse(readFileSync(new URL(`../${INVENTORY_PATH}`, import.meta.url), 'utf8'));
}

/**
 * Derives the full expected inventory (rows without hand-tuned notes) from the
 * content files. Returns { rows, errors }.
 */
export function deriveSurfaces(contentByLocale = Object.fromEntries(LOCALES.map((l) => [l, loadContent(l)]))) {
  const errors = [];
  const walked = Object.fromEntries(
    Object.entries(contentByLocale).map(([locale, content]) => [locale, walkContent(content)]),
  );

  const sampleEntries = walked[SAMPLE_LOCALE];
  const ids = new Set(sampleEntries.map((e) => e.bf_id));
  for (const locale of LOCALES) {
    const localeIds = new Set(walked[locale].map((e) => e.bf_id));
    for (const bfId of ids) if (!localeIds.has(bfId)) errors.push(`${bfId} missing in ${locale}.yaml`);
    for (const bfId of localeIds) if (!ids.has(bfId)) errors.push(`${bfId} only exists in ${locale}.yaml`);
  }

  const rows = [];

  // Container shells: one per rendered section.
  for (const [section, component] of Object.entries(SECTION_COMPONENTS)) {
    rows.push({
      bf_id: `${areaFor(section)}.${section}.shell`,
      kind: 'container',
      area: areaFor(section),
      section,
      path: component,
      locator: `github:${component}#shell`,
      locales: [...LOCALES],
      publication_target: PUBLICATION_TARGET,
      sample: '',
    });
  }

  // Social preview image (head-only). Its alt is the sibling meta.og_image_alt.
  rows.push({
    bf_id: 'home.meta.og_image',
    kind: 'image',
    area: 'home',
    section: 'meta',
    path: 'public/og/og-{locale}.png',
    locator: 'github:public/og/og-{locale}.png',
    locales: [...LOCALES],
    publication_target: PUBLICATION_TARGET,
    presentation: 'img',
    sample: 'public/og/og-es.png',
    alt_locator: contentLocator('meta.og_image_alt'),
  });

  for (const entry of sampleEntries) {
    // The OG alt travels as alt_locator of home.meta.og_image.
    if (entry.bf_id === 'home.meta.og_image_alt') continue;

    const kind = kindForField(entry.field);
    const row = {
      bf_id: entry.bf_id,
      kind,
      area: entry.area,
      section: entry.section,
      path: CONTENT_PATH,
      locator: contentLocator(entry.yamlPath),
      locales: [...LOCALES],
      publication_target: PUBLICATION_TARGET,
      sample: entry.value,
    };
    if (kind === 'chrome_denied') {
      row.deny_reason = entry.field.endsWith('href')
        ? 'Link target — UI chrome, not edit_text'
        : /_alt$|aria_label$/u.test(entry.field)
          ? 'Accessibility metadata — not body copy'
          : 'CTA / form / navigation label — UI chrome, not edit_text';
    }
    if (HEAD_SECTIONS.has(entry.section)) {
      row.notes = 'Rendered in <head> (title/meta); no data-bf-* marker possible.';
    } else if (isAttributeField(entry.field)) {
      row.notes = 'Rendered as an attribute of a marked sibling element; no own marker.';
    }
    rows.push(row);
  }

  const seen = new Set();
  for (const row of rows) {
    if (!BF_ID.test(row.bf_id)) errors.push(`${row.bf_id}: invalid bf_id format`);
    if (seen.has(row.bf_id)) errors.push(`${row.bf_id}: duplicate bf_id`);
    seen.add(row.bf_id);
  }

  return { rows, errors };
}

/** True when a row must have a data-bf-id marker on both home pages. */
export function requiresMarker(row) {
  if (row.kind === 'catalog_bound') return false;
  if (HEAD_SECTIONS.has(row.section)) return false;
  const field = row.bf_id.split('.')[2];
  return !isAttributeField(field);
}

const rowSchema = z
  .object({
    bf_id: z.string().regex(BF_ID),
    kind: z.enum(KINDS),
    area: z.string().min(1),
    section: z.string().min(1),
    path: z.string().min(1),
    locator: z.string().startsWith('github:'),
    locales: z.array(z.enum(LOCALES)).min(1),
    publication_target: z.literal(PUBLICATION_TARGET),
    sample: z.string(),
    presentation: z.enum(['img', 'background', 'picture']).optional(),
    alt_locator: z.string().optional(),
    deny_reason: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()
  .superRefine((row, ctx) => {
    const [area, section] = row.bf_id.split('.');
    if (area !== row.area) ctx.addIssue({ code: 'custom', message: `area must be "${area}"` });
    if (section !== row.section) ctx.addIssue({ code: 'custom', message: `section must be "${section}"` });
    if (row.kind === 'chrome_denied' && !row.deny_reason) {
      ctx.addIssue({ code: 'custom', message: 'chrome_denied rows need a deny_reason' });
    }
    if (row.presentation && row.kind !== 'image') {
      ctx.addIssue({ code: 'custom', message: 'presentation is only valid for image rows' });
    }
  });

export const inventorySchema = z
  .object({
    version: z.literal(1),
    project_key: z.string().min(1),
    surfaces: z.array(rowSchema).min(1),
  })
  .strict();

/** Minimum length for copy samples that must be unique (substring targeting). */
export const UNIQUE_SAMPLE_MIN_LENGTH = 16;

/**
 * Compares the committed inventory with the derived one.
 * Returns a list of human-readable problems (empty = in sync).
 */
export function compareInventory(inventory, derived) {
  const problems = [];
  const parsed = inventorySchema.safeParse(inventory);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const row = issue.path[0] === 'surfaces' ? inventory.surfaces?.[issue.path[1]]?.bf_id : '';
      problems.push(`schema ${row ? `${row}: ` : ''}${issue.path.join('.')} ${issue.message}`);
    }
    return problems;
  }

  const committed = new Map(parsed.data.surfaces.map((r) => [r.bf_id, r]));
  const expected = new Map(derived.map((r) => [r.bf_id, r]));

  for (const [bfId, row] of expected) {
    const current = committed.get(bfId);
    if (!current) {
      problems.push(`${bfId}: missing from ${INVENTORY_PATH} (run pnpm bsi:sync)`);
      continue;
    }
    for (const key of ['kind', 'section', 'area', 'locator', 'path']) {
      if (current[key] !== row[key]) {
        problems.push(`${bfId}: ${key} is "${current[key]}", expected "${row[key]}"`);
      }
    }
    if (current.sample !== row.sample) {
      problems.push(`${bfId}: stale sample (run pnpm bsi:sync)`);
    }
  }
  for (const bfId of committed.keys()) {
    if (!expected.has(bfId)) {
      problems.push(
        `${bfId}: orphan row — no longer in the content. bf_ids are API contracts: ` +
          'remove it deliberately with a migration note in docs/BSI.md.',
      );
    }
  }

  const samples = new Map();
  for (const row of parsed.data.surfaces) {
    if (!['copy', 'style_target'].includes(row.kind)) continue;
    if (row.sample.length < UNIQUE_SAMPLE_MIN_LENGTH) continue;
    const other = samples.get(row.sample);
    if (other) problems.push(`${row.bf_id}: sample duplicates ${other} (samples must be unique)`);
    samples.set(row.sample, row.bf_id);
  }

  return problems;
}

/** Extracts data-bf-* markers from rendered HTML. */
export function extractMarkers(html) {
  const markers = [];
  const tagPattern = /<[a-zA-Z][^>]*\sdata-bf-id="([^"]+)"[^>]*>/gu;
  for (const match of html.matchAll(tagPattern)) {
    const tag = match[0];
    const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'u'))?.[1];
    markers.push({
      bf_id: match[1],
      kind: attr('data-bf-kind'),
      section: attr('data-bf-section'),
      presentation: attr('data-bf-presentation'),
    });
  }
  return markers;
}
