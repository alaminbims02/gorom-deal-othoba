import type { MetadataRoute } from 'next';
import { getSettings } from '@/lib/api';
import { siteUrl } from '@/lib/env';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const disallow: string[] = Array.isArray(s.seo?.robots_disallow) && s.seo.robots_disallow.length ? s.seo.robots_disallow : ['/api/', '/checkout', '/cart'];
  if (s.seo?.noindex) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: disallow.filter((p) => typeof p === 'string' && p.startsWith('/')) }, sitemap: `${siteUrl()}/sitemap.xml` };
}
