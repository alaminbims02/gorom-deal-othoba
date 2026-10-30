import 'server-only';

export const WC_URL = (process.env.WC_URL || '').trim().replace(/\/+$/, '');
export const WC_KEY = process.env.WC_KEY || '';
export const WC_SECRET = process.env.WC_SECRET || '';
export const HAS_WP = WC_URL.length > 0;

export function siteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}
