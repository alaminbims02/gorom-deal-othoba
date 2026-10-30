'use client';

import Link from 'next/link';
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import { useSite } from './SiteProvider';
import { Img } from './Img';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import type { Product } from '@/lib/types';

export function ProductCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const { lang, t, money, num, catName } = useSite();
  const addToCart = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.items.some((x) => x.id === p.id));
  const name = lang === 'en' ? p.nameEn || p.name : p.name;
  const hasOptions = p.options.length > 0;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 hover:border-brand/50 hover:shadow-lg transition-all flex flex-col overflow-hidden relative">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square bg-stone-50 overflow-hidden" aria-label={name}>
        <Img src={p.image} alt={name} priority={priority} className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
        {p.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            -{num(p.discountPercent)}%
          </span>
        )}
        {p.badge && (
          <span className="absolute bottom-2 left-2 bg-ink/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">{p.badge}</span>
        )}
        {!p.inStock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-bold text-stone-600">{t('out_of_stock')}</span>
        )}
      </Link>
      <button
        onClick={() => toggleWish(p)}
        aria-pressed={wished}
        aria-label={t('wishlist')}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center hover:text-accent"
      >
        <Heart className={`w-4 h-4 ${wished ? 'fill-accent text-accent' : ''}`} />
      </button>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[11px] text-stone-400 uppercase tracking-wide truncate">
          {[p.brand, catName(p.categorySlug, p.categoryName)].filter(Boolean).join(' · ')}
        </p>
        <Link href={`/product/${p.slug}`} className="mt-1 text-sm font-semibold text-ink leading-snug line-clamp-2 hover:text-brand min-h-10">
          {name}
        </Link>
        {p.ratingCount > 0 && (
          <p className="mt-1 text-xs text-stone-500">★ {num(p.ratingAverage.toFixed(1))} ({num(p.ratingCount)})</p>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="font-mono">
            <div className="text-base sm:text-lg font-bold text-brand leading-none">{money(p.price)}</div>
            {p.originalPrice > p.price && <div className="text-xs text-stone-400 line-through mt-1">{money(p.originalPrice)}</div>}
          </div>
          {p.inStock && !hasOptions ? (
            <button
              onClick={() => addToCart({ id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn, image: p.image, price: p.price, originalPrice: p.originalPrice, variant: '' })}
              className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center hover:opacity-90 shrink-0"
              aria-label={t('add_to_cart')}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <Link href={`/product/${p.slug}`} className="w-9 h-9 rounded-full bg-mist text-stone-700 flex items-center justify-center hover:bg-brand hover:text-white shrink-0" aria-label={t('view_details')}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
