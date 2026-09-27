// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  BF_ID,
  compareInventory,
  deriveSurfaces,
  extractMarkers,
  inventorySchema,
  kindForField,
  loadInventory,
  requiresMarker,
  walkContent,
} from '../scripts/bsi-lib.mjs';
import { bf } from '../src/lib/bsi';

describe('BSI inventory (binflow/surface-inventory.yaml)', () => {
  const inventory = loadInventory();
  const { rows, errors } = deriveSurfaces();

  it('matches the Binflow inventory schema (version 1)', () => {
    const result = inventorySchema.safeParse(inventory);
    expect(result.success, JSON.stringify(result.error?.issues.slice(0, 3))).toBe(true);
  });

  it('has identical surfaces in every locale', () => {
    expect(errors).toEqual([]);
  });

  it('is in sync with the content (run `pnpm bsi:sync` if this fails)', () => {
    expect(compareInventory(inventory, rows)).toEqual([]);
  });

  it('declares containers for every section and the minimal home set', () => {
    const ids = new Set(inventory.surfaces.map((row: { bf_id: string }) => row.bf_id));
    for (const id of [
      'home.hero.shell',
      'home.hero.heading',
      'home.hero.subheading',
      'home.hero.submit_label',
      'home.waitlist.shell',
      'shared.nav.shell',
      'shared.footer.shell',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('keeps CTAs, links and form labels out of copy kinds', () => {
    for (const row of inventory.surfaces) {
      const field = row.bf_id.split('.')[2];
      if (/(label|href|placeholder)$|^cta_/u.test(field)) expect(row.kind, row.bf_id).toBe('chrome_denied');
      if (row.kind === 'chrome_denied') expect(row.deny_reason, row.bf_id).toBeTruthy();
    }
  });
});

describe('BSI rules', () => {
  it('derives kinds from contract field names', () => {
    expect(kindForField('heading')).toBe('style_target');
    expect(kindForField('subheading')).toBe('copy');
    expect(kindForField('instagram_description')).toBe('copy');
    expect(kindForField('cta_label')).toBe('chrome_denied');
    expect(kindForField('creators_cta_label')).toBe('chrome_denied');
    expect(kindForField('secondary_cta_href')).toBe('chrome_denied');
    expect(kindForField('email_placeholder')).toBe('chrome_denied');
    expect(kindForField('visual_alt')).toBe('chrome_denied');
    expect(kindForField('lang_aria_label')).toBe('chrome_denied');
  });

  it('builds bf_ids from stable list ids, not positions', () => {
    const walked = walkContent({
      problem: { heading: 'H', items: [{ id: 'generic', title: 'T', description: 'D' }] },
      audiences: { items: [{ id: 'creators', points: [{ id: 'daily', text: 'X' }] }] },
    });
    expect(walked.map((w: { bf_id: string }) => w.bf_id)).toEqual([
      'home.problem.heading',
      'home.problem.generic_title',
      'home.problem.generic_description',
      'home.audiences.creators_daily_text',
    ]);
    expect(walked[1].yamlPath).toBe('problem.items[id=generic].title');
  });

  it('rejects list items without ids', () => {
    expect(() => walkContent({ faq: { items: [{ question: 'Q' }] } })).toThrow(/stable string "id"/);
  });

  it('exempts head-only and attribute-valued rows from markers', () => {
    expect(requiresMarker({ bf_id: 'home.meta.title', section: 'meta', kind: 'copy' })).toBe(false);
    expect(requiresMarker({ bf_id: 'home.hero.secondary_cta_href', section: 'hero', kind: 'chrome_denied' })).toBe(false);
    expect(requiresMarker({ bf_id: 'home.hero.heading', section: 'hero', kind: 'style_target' })).toBe(true);
  });

  it('bf() emits only static data-bf-* attributes', () => {
    expect(bf('home.hero.heading', 'style_target')).toEqual({
      'data-bf-id': 'home.hero.heading',
      'data-bf-kind': 'style_target',
      'data-bf-section': 'hero',
    });
    expect(bf('home.hero.background', 'image', 'background')['data-bf-presentation']).toBe('background');
    expect(() => bf('Home.Hero', 'copy')).toThrow(/Invalid bf_id/);
    expect(BF_ID.test('shared.nav.how_label')).toBe(true);
  });

  it('extracts markers from rendered HTML', () => {
    const html =
      '<h1 class="x" data-bf-id="home.hero.heading" data-bf-kind="style_target" data-bf-section="hero">Hi</h1>' +
      '<div data-bf-id="home.hero.background" data-bf-kind="image" data-bf-section="hero" data-bf-presentation="background"></div>';
    expect(extractMarkers(html)).toEqual([
      { bf_id: 'home.hero.heading', kind: 'style_target', section: 'hero', presentation: undefined },
      { bf_id: 'home.hero.background', kind: 'image', section: 'hero', presentation: 'background' },
    ]);
  });
});
