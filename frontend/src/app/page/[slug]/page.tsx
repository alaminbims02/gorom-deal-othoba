import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLang, getPage, getPageList, getSettings, pick, seoTitle } from '@/lib/api';
import { PageContent } from '@/components/Misc';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await getPageList();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return { title: 'Not found', robots: { index: false } };
  return { title: seoTitle(settings, pick(page.title, defaultLang(settings))), alternates: { canonical: `/page/${slug}` } };
}

export default async function WpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return <PageContent title={page.title} content={page.content} />;
}
