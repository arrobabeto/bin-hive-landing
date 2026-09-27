import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://binhive.arrobabeto.com';
// Pages whose slug differs per locale (the sitemap i18n option only pairs
// identical paths), so their hreflang alternates are added explicitly.
const translatedPairs = [[`${SITE}/privacidad/`, `${SITE}/en/privacy/`]];

export default defineConfig({
  site: SITE,
  // Pages are prerendered; only src/pages/api/waitlist.json.ts runs on demand
  // as a Vercel function (ADR-002).
  output: 'static',
  adapter: vercel(),
  // ADR-004: builds fail without MailerLite config; the key stays server-only.
  env: {
    schema: {
      MAILERLITE_API_KEY: envField.string({ context: 'server', access: 'secret', min: 20 }),
      PUBLIC_MAILERLITE_GROUP_ID: envField.string({ context: 'server', access: 'public', min: 1 }),
    },
    validateSecrets: true,
  },
  trailingSlash: 'always',
  // Single-page landing: inline the CSS (~11 KB gzip) to avoid a
  // render-blocking request (ADR-007, Core Web Vitals).
  build: { inlineStylesheets: 'always' },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|gracias|thanks)\/?$/u.test(new URL(page).pathname),
      serialize(item) {
        const pair = translatedPairs.find((urls) => urls.includes(item.url));
        if (pair) {
          item.links = [
            { lang: 'es-MX', url: pair[0] },
            { lang: 'en', url: pair[1] },
          ];
        }
        return item;
      },
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-MX', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
