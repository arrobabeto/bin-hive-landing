// Site-wide constants that are configuration, not copy (not BSI surfaces).
export const SITE_NAME = 'Bin Hive';
export const SITE_URL = 'https://binhive.arrobabeto.com';
export const THEME_COLOR = '#ffc21a';

/** On-demand Vercel function that subscribes to MailerLite (ADR-004). */
export const WAITLIST_ENDPOINT = '/api/waitlist.json';

export const ORGANIZATION = {
  name: 'Arrobabeto Media',
  founder: 'Alberto (@arrobabeto)',
  url: 'https://webbin.com.mx',
};

// Outbound profiles (rel="me" + schema.org sameAs).
export const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/arrobabeto_dev/' },
  { id: 'webbin', label: 'webbin.com.mx', href: 'https://webbin.com.mx' },
] as const;
