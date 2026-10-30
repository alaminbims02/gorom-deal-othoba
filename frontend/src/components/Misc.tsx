'use client';

import { useSite } from './SiteProvider';
import { EmptyState } from './EmptyState';
import { ProductGrid } from './ProductCard';
import { useWishlist } from '@/store/wishlist';
import type { BiText, Product } from '@/lib/types';

export function PageContent({ title, content }: { title: BiText; content: BiText }) {
  const { bi } = useSite();
  const html = bi(content);
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink mb-6">{bi(title)}</h1>
      {html ? <div className="gd-prose text-stone-700" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </article>
  );
}

export function SearchResults({ q, products }: { q: string; products: Product[] }) {
  const { t, num } = useSite();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-1">{t('search_title')}</h1>
      {q ? <p className="text-sm text-stone-500 mb-6">{t('search_results_for', { q, n: num(products.length) })}</p> : <p className="text-sm text-stone-500 mb-6">{t('search_hint')}</p>}
      {products.length ? <ProductGrid products={products} /> : q ? <EmptyState title={t('search_empty')} hint={t('no_products_hint')} /> : null}
    </div>
  );
}

export function WishlistView() {
  const { t } = useSite();
  const items = useWishlist((s) => s.items);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-6">{t('wishlist')}</h1>
      {items.length ? <ProductGrid products={items} /> : <EmptyState title={t('wishlist_empty')} hint={t('cart_empty_hint')} />}
    </div>
  );
}

export function NotFoundView() {
  const { t } = useSite();
  return <EmptyState title={t('page_not_found')} hint={t('no_data_hint')} />;
}
