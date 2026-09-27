import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { requireMailerLiteConfig } from './src/lib/mailerlite-config.mjs';

const SITE = 'https://binhive.arrobabeto.com';
// Pages whose slug differs per locale (the sitemap i18n option only pairs
// identical paths), so their hreflang alternates are added explicitly.
const translatedPairs = [[`${SITE}/privacidad/`, `${SITE}/en/privacy/`]];

const isBuild = process.argv.includes('build');
const modeFlagIndex = process.argv.indexOf('--mode');
const mode =
  modeFlagIndex >= 0 ? process.argv[modeFlagIndex + 1] : isBuild ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');

// ADR-004: never ship a waitlist form without real MailerLite ids.
if (isBuild && mode === 'production') {
  requireMailerLiteConfig(env.PUBLIC_MAILERLITE_ACCOUNT_ID, env.PUBLIC_MAILERLITE_FORM_ID);
}

export default defineConfig({
  site: SITE,
  output: 'static',
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
      filter: (page) => !page.includes('/404'),
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
