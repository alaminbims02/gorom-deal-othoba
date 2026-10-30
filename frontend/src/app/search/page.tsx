import type { Metadata } from 'next';
import { getAllProducts } from '@/lib/api';
import { slim } from '@/lib/product';
import { SearchResults } from '@/components/Misc';

export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, 100);
  const all = await getAllProducts();
  const needle = q.toLowerCase();
  const products = q
    ? all.filter((p) => [p.name, p.nameEn, p.brand, p.sku, p.categoryName].some((v) => v.toLowerCase().includes(needle))).map(slim)
    : [];
  return <SearchResults q={q} products={products} />;
}
