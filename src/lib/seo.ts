import type { HomeContent } from './home-schema';
import { htmlLang, localizedPath, type Locale } from './i18n';
import { ORGANIZATION, SITE_NAME, SITE_URL, SOCIAL_LINKS } from './site';

const abs = (path: string) => new URL(path, SITE_URL).toString();

export const ids = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  software: `${SITE_URL}/#software`,
};

/** schema.org @graph for a home page (Organization, WebSite, WebPage, SoftwareApplication, FAQPage). */
export function homeStructuredData(content: HomeContent, locale: Locale) {
  const pageUrl = abs(localizedPath('/', locale));
  const lang = htmlLang[locale];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ids.organization,
        name: ORGANIZATION.name,
        url: ORGANIZATION.url,
        logo: abs('/icon-512.png'),
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      },
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: abs('/'),
        name: SITE_NAME,
        inLanguage: ['es-MX', 'en'],
        publisher: { '@id': ids.organization },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.meta.title,
        description: content.meta.description,
        inLanguage: lang,
        isPartOf: { '@id': ids.website },
        about: { '@id': ids.software },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: abs(`/og/og-${locale}.png`),
          width: 1200,
          height: 630,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': ids.software,
        name: SITE_NAME,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Social media content',
        operatingSystem: 'Web',
        description: content.meta.description,
        url: pageUrl,
        inLanguage: lang,
        publisher: { '@id': ids.organization },
        featureList: content.hives.items.map((hive) => `${hive.title}: ${hive.tagline}`),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        inLanguage: lang,
        mainEntity: content.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

/** Serializes JSON-LD safely for inline <script> (same escaping as Webbin). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</gu, '\\u003c');
}
