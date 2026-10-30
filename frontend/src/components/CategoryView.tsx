'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useSite } from './SiteProvider';
import { ProductGrid } from './ProductCard';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';
import type { BiText, Product } from '@/lib/types';

type Sort = 'latest' | 'price_asc' | 'price_desc' | 'discount';

export function CategoryView({ products, slug, fallbackName }: { products: Product[]; slug: string; fallbackName: string }) {
  const { settings, catName, bi, t, num } = useSite();
  const pg = settings.pages || {};
  const [sort, setSort] = useState<Sort>('latest');
  const [brands, setBrands] = useState<string[]>([]);
  const [minP, setMinP] = useState('');
  const [maxP, setMaxP] = useState('');
  const [stock, setStock] = useState(false);
  const [sale, setSale] = useState(false);
  const [flash, setFlash] = useState(false);
  const [warranty, setWarranty] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const allBrands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(), [products]);
  const list = useMemo(() => {
    const lo = parseFloat(minP);
    const hi = parseFloat(maxP);
    const out = products.filter(
      (p) =>
        (!brands.length || brands.includes(p.brand)) &&
        (Number.isNaN(lo) || p.price >= lo) &&
        (Number.isNaN(hi) || p.price <= hi) &&
        (!stock || p.inStock) &&
        (!sale || p.discountPercent > 0) &&
        (!flash || p.isFlashDeal) &&
        (!warranty || !!p.warranty),
    );
    const cmp: Record<Sort, (a: Product, b: Product) => number> = {
      latest: () => 0,
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      discount: (a, b) => b.discountPercent - a.discountPercent,
    };
    return [...out].sort(cmp[sort]);
  }, [products, brands, minP, maxP, stock, sale, flash, warranty, sort]);

  const name = catName(slug, fallbackName);
  const faq: { q: BiText; a: BiText }[] = Array.isArray(pg.faq) ? pg.faq : [];
  const points: { icon: string; text: BiText }[] = Array.isArray(pg.cat_points) ? pg.cat_points : [];
  const props: { title: BiText; items: BiText }[] = Array.isArray(pg.cat_value_props) ? pg.cat_value_props : [];
  const anyFilter = brands.length || minP || maxP || stock || sale || flash || warranty;

  const clear = () => { setBrands([]); setMinP(''); setMaxP(''); setStock(false); setSale(false); setFlash(false); setWarranty(false); };
  const check = (label: string, v: boolean, set: (b: boolean) => void) => (
    <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
      <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="accent-brand w-4 h-4" />{label}
    </label>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="rounded-3xl bg-cream border border-brand/20 p-6 sm:p-8 mb-6">
        {bi(pg.cat_banner_tag) && <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{bi(pg.cat_banner_tag)}</span>}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink">{name}</h1>
        {bi(pg.cat_banner_desc) && <p className="text-stone-600 mt-2 max-w-3xl text-sm sm:text-base">{bi(pg.cat_banner_desc)}</p>}
        {points.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-xs sm:text-sm text-stone-700">
            {points.map((p, i) => <li key={i} className="flex items-center gap-1.5"><Icon name={p.icon} className="w-4 h-4 text-brand" />{bi(p.text)}</li>)}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-500">{t('products_count', { n: num(list.length) })}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-sm"><SlidersHorizontal className="w-4 h-4" />{t('filters')}</button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-stone-500">{t('sort_by')}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="latest">{t('sort_latest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
              <option value="discount">{t('sort_discount')}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-5 bg-white border border-stone-200 rounded-2xl p-4 h-fit lg:sticky lg:top-40`}>
          <div className="flex items-center justify-between"><h2 className="font-bold text-ink">{t('filters')}</h2>{anyFilter ? <button onClick={clear} className="text-xs text-brand hover:underline">{t('clear_filters')}</button> : null}</div>
          {allBrands.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-stone-400">{t('brand')}</h3>
              {allBrands.map((b) => check(b, brands.includes(b), (v) => setBrands(v ? [...brands, b] : brands.filter((x) => x !== b))))}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-stone-400">{t('price_range')}</h3>
            <div className="flex items-center gap-2">
              <input inputMode="numeric" value={minP} onChange={(e) => setMinP(e.target.value.replace(/[^\d]/g, ''))} placeholder={t('min')} className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm" aria-label={t('min')} />
              <span className="text-stone-400">–</span>
              <input inputMode="numeric" value={maxP} onChange={(e) => setMaxP(e.target.value.replace(/[^\d]/g, ''))} placeholder={t('max')} className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm" aria-label={t('max')} />
            </div>
          </div>
          <div className="space-y-2">
            {check(t('only_in_stock'), stock, setStock)}
            {check(t('only_on_sale'), sale, setSale)}
            {check(t('only_flash'), flash, setFlash)}
            {check(t('only_warranty'), warranty, setWarranty)}
          </div>
        </aside>

        <div>
          {list.length ? <ProductGrid products={list} /> : <EmptyState title={t('no_products')} hint={t('no_products_hint')} cta={false} />}
        </div>
      </div>

      {(props.length > 0 || bi(pg.cat_article_text)) && (
        <section className="mt-12 grid gap-6">
          {bi(pg.cat_article_title) && <h2 className="text-xl font-extrabold text-ink">{bi(pg.cat_article_title)}</h2>}
          {bi(pg.cat_article_text) && <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{bi(pg.cat_article_text)}</div>}
          {props.map((p, i) => (
            <div key={i} className="bg-cream rounded-2xl p-5 border border-brand/15">
              <h3 className="font-bold text-ink mb-2">{bi(p.title)}</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700">
                {bi(p.items).split('\n').map((l) => l.trim()).filter(Boolean).map((l, k) => <li key={k}>{l}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-ink mb-4">{t('faq')}</h2>
          <div className="space-y-2">
            {faq.map((f, i) => (
              <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 font-semibold text-sm text-ink hover:bg-stone-50">
                  {bi(f.q)}<ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-stone-600">{bi(f.a)}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
