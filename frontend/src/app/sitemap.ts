import type { MetadataRoute } from 'next';
import { getAllProducts, getCategories, getPageList } from '@/lib/api';
import { siteUrl } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, cats, pages] = await Promise.all([getAllProducts(), getCategories(), getPageList()]);
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    ...cats.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.modified || undefined, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${base}/page/${p.slug}`, lastModified: p.modified || undefined, changeFrequency: 'monthly' as const, priority: 0.3 })),
  ];
}
