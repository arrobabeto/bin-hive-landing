// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { homeSchema } from '../src/lib/home-schema';
import { homeStructuredData, serializeJsonLd } from '../src/lib/seo';

const load = (locale: 'es' | 'en') =>
  homeSchema.parse(parse(readFileSync(new URL(`../src/content/home/${locale}.yaml`, import.meta.url), 'utf8')));

const focusKeyword = { es: 'agentes de ia para redes sociales', en: 'ai agents for social media' } as const;

// Banned phrases from arrobabeto-media-agents/apiario/voz-y-tono.md
const BANNED = [
  'en el mundo actual',
  'sumérgete',
  'descubre el poder de',
  'revolucionario',
  'potencia tu',
  'sin más preámbulos',
  'en conclusión',
  'es importante destacar que',
];

const allStrings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(allStrings)
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(allStrings)
        : [];

describe.each(['es', 'en'] as const)('SEO copy (%s)', (locale) => {
  const content = load(locale);
  const keyword = focusKeyword[locale];

  it('title ≤ 60 chars with the focus keyword first and the brand last', () => {
    expect(content.meta.title.length).toBeLessThanOrEqual(60);
    expect(content.meta.title.toLowerCase().startsWith(keyword)).toBe(true);
    expect(content.meta.title.endsWith('| Bin Hive')).toBe(true);
  });

  it('meta description is 120–160 chars and contains the focus keyword', () => {
    expect(content.meta.description.length).toBeGreaterThanOrEqual(120);
    expect(content.meta.description.length).toBeLessThanOrEqual(160);
    expect(content.meta.description.toLowerCase()).toContain(keyword);
  });

  it('H1, OG alt and a FAQ answer carry the focus keyword', () => {
    expect(content.hero.heading.toLowerCase()).toContain(keyword);
    expect(content.meta.og_image_alt.toLowerCase()).toContain(keyword);
    expect(content.faq.items.some((item) => item.answer.toLowerCase().includes(keyword))).toBe(true);
  });

  it('does not stuff the keyword (≤ 2.5% density across the page copy)', () => {
    const text = allStrings(content).join(' ').toLowerCase();
    const words = text.split(/\s+/u).filter(Boolean).length;
    const hits = text.split(keyword).length - 1;
    const density = (hits * keyword.split(' ').length) / words;
    expect(hits).toBeGreaterThanOrEqual(3);
    expect(density).toBeLessThanOrEqual(0.025);
  });

  it('avoids the banned AI-sounding phrases from the brand voice guide', () => {
    const text = allStrings(content).join(' ').toLowerCase();
    for (const phrase of BANNED) expect(text).not.toContain(phrase);
  });

  it('builds a JSON-LD graph with the FAQ and software entities', () => {
    const data = homeStructuredData(content, locale);
    const types = data['@graph'].map((node) => node['@type']);
    expect(types).toEqual(['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']);
    const faq = data['@graph'][4] as { mainEntity: unknown[] };
    expect(faq.mainEntity).toHaveLength(content.faq.items.length);
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
    expect(serializeJsonLd({ x: '</script>' })).not.toContain('</script>');
  });
});
