'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Flame } from 'lucide-react';
import { useSite } from './SiteProvider';
import { Icon } from './Icon';
import { Img } from './Img';
import { ProductGrid } from './ProductCard';
import type { BiText, Category, Product } from '@/lib/types';

export function SectionHead({ title, href, icon }: { title: string; href?: string; icon?: React.ReactNode }) {
  const { t } = useSite();
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2">{icon}{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-brand hover:underline flex items-center gap-1">
          {t('view_all')}<ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export function CategoryStrip({ categories, title }: { categories: Category[]; title?: BiText }) {
  const { catName, bi, t } = useSite();
  if (!categories.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
      <SectionHead title={bi(title) || t('all_categories')} />
      <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cream border border-brand/20 flex items-center justify-center group-hover:border-brand group-hover:shadow-md transition-all overflow-hidden relative">
              {c.image ? <Img src={c.image} alt={catName(c.slug, c.name)} sizes="80px" className="object-cover" /> : <Icon name={c.icon} className="w-7 h-7 text-brand" />}
            </div>
            <span className="text-xs sm:text-sm font-medium text-center text-ink leading-tight group-hover:text-brand">{catName(c.slug, c.name)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function useCountdown(endIso: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!endIso) return;
    const end = new Date(endIso).getTime();
    if (Number.isNaN(end)) return;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endIso]);
  return left;
}

export function FlashDeals({ products, endsAt, title, limit, viewAll }: { products: Product[]; endsAt: string; title?: BiText; limit: number; viewAll?: string }) {
  const { bi, t, num } = useSite();
  const left = useCountdown(endsAt);
  if (!products.length) return null;
  const parts = left === null ? null : [
    [Math.floor(left / 86400000), t('days')],
    [Math.floor((left % 86400000) / 3600000), t('hours')],
    [Math.floor((left % 3600000) / 60000), t('minutes')],
    [Math.floor((left % 60000) / 1000), t('seconds')],
  ] as [number, string][];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
      <div className="rounded-3xl border border-accent/20 bg-linear-to-br from-accent/5 to-brand/5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-2"><Flame className="w-6 h-6 text-accent" />{bi(title) || t('flash_deals_title')}</h2>
          <div className="flex items-center gap-4">
            {parts && left !== null && left > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <span className="font-medium">{t('ends_in')}</span>
                {parts.map(([n, label]) => (
                  <span key={label} className="bg-ink text-white rounded-md px-2 py-1 font-mono font-bold text-sm text-center min-w-10">
                    {num(String(n).padStart(2, '0'))}<span className="block text-[9px] font-normal text-white/70 leading-none">{label}</span>
                  </span>
                ))}
              </div>
            )}
            <Link href={viewAll || '/search?q='} className="text-sm font-semibold text-brand hover:underline flex items-center gap-1">{t('view_all_deals')}<ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
        <ProductGrid products={products.slice(0, limit)} />
      </div>
    </section>
  );
}

export function PromoBanner({ banners }: { banners: { enabled?: boolean; pill: BiText; pill2: BiText; title: BiText; subtitle: BiText; cta_text: BiText; cta_link: string; image: string; caption: BiText }[] }) {
  const { bi } = useSite();
  const list = banners.filter((b) => b.enabled !== false);
  if (!list.length) return null;
  return (
    <>
      {list.map((b, i) => (
        <section key={i} className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
          <div className="rounded-3xl bg-linear-to-r from-ink to-stone-800 text-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 sm:p-10">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {bi(b.pill) && <span className="bg-accent text-xs font-bold px-3 py-1 rounded-full">{bi(b.pill)}</span>}
                  {bi(b.pill2) && <span className="bg-white/15 text-xs font-semibold px-3 py-1 rounded-full">{bi(b.pill2)}</span>}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{bi(b.title)}</h2>
                {bi(b.subtitle) && <p className="text-white/75 text-sm sm:text-base">{bi(b.subtitle)}</p>}
                {b.cta_link && bi(b.cta_text) && (
                  <Link href={b.cta_link} className="inline-flex items-center gap-2 bg-brand hover:opacity-90 font-semibold px-6 py-3 rounded-full">{bi(b.cta_text)}<ChevronRight className="w-4 h-4" /></Link>
                )}
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5">
                <Img src={b.image} alt={bi(b.title)} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                {bi(b.caption) && <span className="absolute bottom-3 left-3 bg-white text-ink text-sm font-bold px-3 py-1.5 rounded-xl">{bi(b.caption)}</span>}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export function FeaturedTabs({ products, tabs, title, limit, viewAll }: { products: Product[]; tabs: { label: BiText; categories: string[] }[]; title?: BiText; limit: number; viewAll?: string }) {
  const { bi } = useSite();
  const [active, setActive] = useState(0);
  if (!products.length) return null;
  const tab = tabs[active];
  const shown = (tab && tab.categories.length ? products.filter((p) => tab.categories.includes(p.categorySlug)) : products).slice(0, limit);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
      <SectionHead title={bi(title)} href={viewAll} />
      {tabs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5" role="tablist">
          {tabs.map((tb, i) => (
            <button key={i} role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${i === active ? 'bg-brand text-white border-brand' : 'bg-white text-stone-700 border-stone-200 hover:border-brand'}`}>
              {bi(tb.label)}
            </button>
          ))}
        </div>
      )}
      {shown.length ? <ProductGrid products={shown} /> : <p className="text-sm text-stone-500 py-8 text-center">—</p>}
    </section>
  );
}

export function CategoryProducts({ products, title, slug, limit }: { products: Product[]; title?: BiText; slug: string; limit: number }) {
  const { bi, catName } = useSite();
  if (!products.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
      <SectionHead title={bi(title) || catName(slug)} href={`/category/${slug}`} />
      <ProductGrid products={products.slice(0, limit)} />
    </section>
  );
}

export function TrustBar({ features }: { features: { icon: string; title: BiText; desc: BiText }[] }) {
  const { bi } = useSite();
  if (!features.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 bg-cream border border-brand/15 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0"><Icon name={f.icon} className="w-5 h-5 text-brand" /></div>
            <div>
              <h3 className="text-sm font-bold text-ink">{bi(f.title)}</h3>
              {bi(f.desc) && <p className="text-xs text-stone-500 mt-0.5">{bi(f.desc)}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
