// Adapted from Webbin's src/lib/i18n.ts, with Spanish at the root ("/")
// and English under "/en/" (ADR-005).
export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const htmlLang: Record<Locale, string> = { es: 'es-MX', en: 'en' };
export const ogLocale: Record<Locale, string> = { es: 'es_MX', en: 'en_US' };

// Localized in-page anchors. Nav hrefs in src/content/home/{locale}.yaml
// must point at these ids (enforced by tests/i18n.test.ts).
export const sectionAnchors = {
  es: {
    problem: 'problema',
    whatis: 'que-es-bin-hive',
    how: 'como-funciona',
    hives: 'colmenas',
    workers: 'obreras',
    benefits: 'beneficios',
    audiences: 'para-quien',
    numbers: 'numeros',
    trust: 'control',
    faq: 'preguntas',
    waitlist: 'lista-de-espera',
  },
  en: {
    problem: 'problem',
    whatis: 'what-is-bin-hive',
    how: 'how-it-works',
    hives: 'hives',
    workers: 'workers',
    benefits: 'benefits',
    audiences: 'who-its-for',
    numbers: 'numbers',
    trust: 'control',
    faq: 'faq',
    waitlist: 'waitlist',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type SectionKey = keyof (typeof sectionAnchors)['es'];

// Pages that exist in both locales, keyed by their Spanish (root) path.
const pairedPaths: Record<string, string> = {
  '/': '/en/',
  '/privacidad/': '/en/privacy/',
};

export function normalizeLocale(locale?: string): Locale {
  return locale?.toLowerCase().startsWith('en') ? 'en' : defaultLocale;
}

function withTrailingSlash(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return path.endsWith('/') ? path : `${path}/`;
}

export function localeFromPath(pathname: string): Locale {
  const path = withTrailingSlash(pathname);
  return path === '/en/' || path.startsWith('/en/') ? 'en' : 'es';
}

/** Returns the equivalent path of `pathname` in `locale`. */
export function localizedPath(pathname: string, locale: Locale): string {
  const path = withTrailingSlash(pathname);
  const esPath =
    Object.entries(pairedPaths).find(([, en]) => en === path)?.[0] ??
    (path.startsWith('/en/') ? path.slice(3) : path);

  if (locale === 'es') return esPath;
  return pairedPaths[esPath] ?? (esPath === '/' ? '/en/' : `/en${esPath}`);
}
