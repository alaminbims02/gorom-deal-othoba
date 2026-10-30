import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLang, getAllProducts, getSettings, seoTitle } from '@/lib/api';
import { getProductBySlug } from '@/lib/woo';
import { slim } from '@/lib/product';
import { siteUrl } from '@/lib/env';
import { safeJsonLd } from '@/lib/sanitize';
import { ProductView } from '@/components/ProductView';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const all = await getAllProducts();
  return all.slice(0, 50).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProductBySlug(decodeURIComponent(slug)), getSettings()]);
  if (!p) return { title: 'Not found', robots: { index: false } };
  const lang = defaultLang(settings);
  const name = lang === 'en' ? p.nameEn || p.name : p.name;
  const desc = (lang === 'en' ? p.descriptionEn : p.description).replace(/\s+/g, ' ').slice(0, 160) || undefined;
  return {
    title: seoTitle(settings, name),
    description: desc,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: 'website', title: name, description: desc, images: p.image ? [p.image] : undefined },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const [p, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!p) notFound();
  const lang = defaultLang(settings);
  const all = await getAllProducts();
  const related = all.filter((x) => x.categorySlug === p.categorySlug && x.id !== p.id).slice(0, 4).map(slim);

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: lang === 'en' ? p.nameEn || p.name : p.name,
    description: (lang === 'en' ? p.descriptionEn : p.description) || undefined,
    image: p.images.length ? p.images : undefined,
    sku: p.sku || undefined,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    url: `${siteUrl()}/product/${p.slug}`,
    offers: {
      '@type': 'Offer',
      price: p.price.toFixed(2),
      priceCurrency: settings.meta?.currency || 'BDT',
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteUrl()}/product/${p.slug}`,
    },
  };
  // রেটিং শুধু WooCommerce-এ আসল রিভিউ থাকলে
  if (p.ratingCount > 0) ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: p.ratingAverage, reviewCount: p.ratingCount };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(ld) }} />
      <ProductView product={p} related={related} />
    </>
  );
}
