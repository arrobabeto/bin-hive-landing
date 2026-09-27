// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { readFileSync } from 'node:fs';
import {
  defaultLocale,
  localeFromPath,
  localizedPath,
  locales,
  normalizeLocale,
  sectionAnchors,
} from '../src/lib/i18n';

const load = (locale: string) =>
  parse(readFileSync(new URL(`../src/content/home/${locale}.yaml`, import.meta.url), 'utf8'));

describe('i18n', () => {
  it('serves Spanish at the root and English under /en/', () => {
    expect(defaultLocale).toBe('es');
    expect(localizedPath('/', 'es')).toBe('/');
    expect(localizedPath('/', 'en')).toBe('/en/');
    expect(localizedPath('/en/', 'es')).toBe('/');
    expect(localizedPath('/en', 'en')).toBe('/en/');
  });

  it('maps the privacy pages across locales', () => {
    expect(localizedPath('/privacidad/', 'en')).toBe('/en/privacy/');
    expect(localizedPath('/en/privacy/', 'es')).toBe('/privacidad/');
    expect(localizedPath('/privacidad', 'es')).toBe('/privacidad/');
  });

  it('detects the locale from a path', () => {
    expect(localeFromPath('/')).toBe('es');
    expect(localeFromPath('/en/')).toBe('en');
    expect(localeFromPath('/en/privacy/')).toBe('en');
    expect(localeFromPath('/enciclopedia/')).toBe('es');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('es-MX')).toBe('es');
    expect(normalizeLocale(undefined)).toBe('es');
  });

  it.each(locales)('nav and CTA anchors in %s.yaml point at real sections', (locale) => {
    const content = load(locale);
    const anchors = new Set(Object.values(sectionAnchors[locale]).map((id) => `#${id}`));
    for (const link of content.nav.links) expect(anchors).toContain(link.href);
    expect(anchors).toContain(content.nav.cta_href);
    expect(anchors).toContain(content.hero.secondary_cta_href);
    expect(content.nav.cta_href).toBe(`#${sectionAnchors[locale].waitlist}`);
  });

  it('keeps privacy links pointing at the localized privacy page', () => {
    expect(load('es').waitlist.privacy_link_href).toBe(localizedPath('/privacidad/', 'es'));
    expect(load('en').waitlist.privacy_link_href).toBe(localizedPath('/privacidad/', 'en'));
    expect(load('en').footer.privacy_href).toBe('/en/privacy/');
  });
});
