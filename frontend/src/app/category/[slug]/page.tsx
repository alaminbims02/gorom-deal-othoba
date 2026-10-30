import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLang, getAllProducts, getCategories, getSettings, seoTitle } from '@/lib/api';
import { slim } from '@/lib/product';
import { CategoryView } from '@/components/CategoryView';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

async function load(slug: string) {
  const [cats, settings] = await Promise.all([getCategories(), getSettings()]);
  const cat = cats.find((c) => c.slug === slug);
  return { cat, settings };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { cat, settings } = await load(slug);
  if (!cat) return { title: 'Not found', robots: { index: false } };
  const lang = defaultLang(settings);
  const name = lang === 'en' ? cat.name_en || cat.name : cat.name;
  const desc = (lang === 'en' ? settings.pages?.cat_banner_desc?.en : settings.pages?.cat_banner_desc?.bn) || undefined;
  return {
    title: seoTitle(settings, name),
    description: desc,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title: name, description: desc, images: cat.image ? [cat.image] : undefined },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { cat } = await load(slug);
  if (!cat) notFound();
  const all = await getAllProducts();
  const products = all.filter((p) => p.categorySlug === slug).map(slim);
  return <CategoryView products={products} slug={slug} fallbackName={cat.name} />;
}
