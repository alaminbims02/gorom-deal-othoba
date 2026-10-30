'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSite } from './SiteProvider';
import { Img } from './Img';
import { Icon } from './Icon';
import { ProductGrid } from './ProductCard';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import type { BiText, Product } from '@/lib/types';

export function ProductView({ product: p, related }: { product: Product; related: Product[] }) {
  const { lang, t, bi, money, num, settings, catName } = useSite();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.items.some((x) => x.id === p.id));
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'desc' | 'specs' | 'features'>('desc');
  const [added, setAdded] = useState(false);

  const pg = settings.pages || {};
  const del = settings.delivery || {};
  const name = lang === 'en' ? p.nameEn || p.name : p.name;
  const desc = lang === 'en' ? p.descriptionEn || p.description : p.description || p.descriptionEn;
  const badges: { icon: string; text: BiText }[] = Array.isArray(pg.pdp_badges) ? pg.pdp_badges : [];
  const variantLabel = p.options.map((o) => sel[o.name] && `${o.name}: ${sel[o.name]}`).filter(Boolean).join(', ');
  const missing = p.options.some((o) => !sel[o.name]);
  const gallery = p.images.length ? p.images : [''];
  const save = p.originalPrice - p.price;

  const line = () => ({ id: p.id, slug: p.slug, name: p.name, nameEn: p.nameEn, image: p.image, price: p.price, originalPrice: p.originalPrice, variant: variantLabel });
  const canBuy = p.inStock && !missing;

  const tabs: [typeof tab, string, boolean][] = [
    ['desc', t('description'), !!desc],
    ['specs', t('specifications'), p.specs.length > 0],
    ['features', t('features'), p.features.length > 0],
  ];
  const visibleTabs = tabs.filter(([, , show]) => show);
  const activeTab = visibleTabs.find(([k]) => k === tab) ? tab : visibleTabs[0]?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <nav className="text-xs text-stone-500 mb-4 flex flex-wrap gap-1.5" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand">{t('home')}</Link><span>/</span>
        {p.categorySlug && <><Link href={`/category/${p.categorySlug}`} className="hover:text-brand">{catName(p.categorySlug, p.categoryName)}</Link><span>/</span></>}
        <span className="text-ink font-medium line-clamp-1">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square rounded-3xl bg-stone-50 border border-stone-200 overflow-hidden">
            <Img src={gallery[img]} alt={name} priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-6 mix-blend-multiply" />
            {p.discountPercent > 0 && <span className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1 rounded-lg">-{num(p.discountPercent)}%</span>}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`${i + 1}`} className={`relative w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden bg-stone-50 ${i === img ? 'border-brand' : 'border-stone-200'}`}>
                  <Img src={g} alt="" sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-400">{[p.brand, p.sku && `${t('sku')}: ${p.sku}`].filter(Boolean).join(' · ')}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1 leading-tight">{name}</h1>
            {p.ratingCount > 0 && <p className="text-sm text-stone-500 mt-1">★ {num(p.ratingAverage.toFixed(1))} · {t('reviews_count', { n: num(p.ratingCount) })}</p>}
          </div>

          <div className="bg-cream border border-brand/20 rounded-2xl p-4">
            <div className="flex flex-wrap items-baseline gap-3 font-mono">
              <span className="text-3xl font-extrabold text-brand">{money(p.price)}</span>
              {p.originalPrice > p.price && <span className="text-base text-stone-400 line-through">{money(p.originalPrice)}</span>}
              {save > 0 && <span className="text-xs font-semibold text-accent bg-white px-2 py-0.5 rounded-md font-sans">{t('save_amount', { n: num(Math.round(save)) })}</span>}
            </div>
            {bi(pg.pdp_price_note) && <p className="text-xs text-stone-600 mt-2">{bi(pg.pdp_price_note)}</p>}
          </div>

          <p className={`text-sm font-semibold ${p.inStock ? 'text-green-700' : 'text-accent'}`}>
            {p.inStock ? (p.stockCount !== null && p.stockCount > 0 && p.stockCount <= 5 ? t('only_n_left', { n: num(p.stockCount) }) : t('in_stock')) : t('out_of_stock')}
          </p>

          {p.options.map((o) => (
            <div key={o.name}>
              <h3 className="text-sm font-semibold text-ink mb-2">{o.name}</h3>
              <div className="flex flex-wrap gap-2">
                {o.options.map((v) => (
                  <button key={v} onClick={() => setSel({ ...sel, [o.name]: v })} aria-pressed={sel[o.name] === v} className={`px-4 py-2 rounded-lg border text-sm font-medium ${sel[o.name] === v ? 'border-brand bg-cream text-brand' : 'border-stone-200 hover:border-brand'}`}>{v}</button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-stone-200 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center" aria-label="-"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-semibold" aria-label={t('quantity')}>{num(qty)}</span>
              <button onClick={() => setQty(Math.min(20, qty + 1))} className="w-10 h-10 flex items-center justify-center" aria-label="+"><Plus className="w-4 h-4" /></button>
            </div>
            <button disabled={!canBuy} onClick={() => { add(line(), qty); setAdded(true); setTimeout(() => setAdded(false), 2000); }} className="flex-1 min-w-40 flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-brand text-brand font-semibold hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed">
              <ShoppingCart className="w-5 h-5" />{added ? t('added_to_cart') : t('add_to_cart')}
            </button>
            <button disabled={!canBuy} onClick={() => { add(line(), qty); router.push('/checkout'); }} className="flex-1 min-w-40 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              <Zap className="w-5 h-5" />{t('order_now')}
            </button>
            <button onClick={() => toggleWish(p)} aria-pressed={wished} aria-label={t('wishlist')} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:text-accent">
              <Heart className={`w-5 h-5 ${wished ? 'fill-accent text-accent' : ''}`} />
            </button>
          </div>
          {missing && p.inStock && <p className="text-xs text-accent">{p.options.map((o) => o.name).join(' / ')}</p>}

          <div className="border border-stone-200 rounded-2xl p-4 space-y-2 text-sm">
            <h3 className="font-bold text-ink">{t('delivery')}</h3>
            {del.inside_charge !== undefined && <p className="flex justify-between"><span className="text-stone-600">{t('delivery_inside')} {bi(del.inside_eta) && `(${bi(del.inside_eta)})`}</span><span className="font-mono font-semibold">{money(Number(del.inside_charge))}</span></p>}
            {del.outside_charge !== undefined && <p className="flex justify-between"><span className="text-stone-600">{t('delivery_outside')} {bi(del.outside_eta) && `(${bi(del.outside_eta)})`}</span><span className="font-mono font-semibold">{money(Number(del.outside_charge))}</span></p>}
            {del.free_enabled && <p className="text-xs text-green-700">{t('free_delivery_over', { n: num(Number(del.free_threshold)) })}</p>}
            {bi(pg.pdp_ship_note) && <p className="text-xs text-stone-500">{bi(pg.pdp_ship_note)}</p>}
            {bi(pg.pdp_delivery_info) && <p className="text-xs text-stone-500">{bi(pg.pdp_delivery_info)}</p>}
            {p.warranty && <p className="pt-2 border-t border-stone-100"><span className="font-semibold">{t('warranty')}:</span> {p.warranty}</p>}
            {bi(pg.pdp_guarantee) && <p className="text-xs text-stone-500">{bi(pg.pdp_guarantee)}</p>}
          </div>

          {badges.length > 0 && (
            <ul className="grid grid-cols-2 gap-2">
              {badges.map((b, i) => <li key={i} className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 rounded-lg px-3 py-2"><Icon name={b.icon} className="w-4 h-4 text-brand shrink-0" />{bi(b.text)}</li>)}
            </ul>
          )}
        </div>
      </div>

      {visibleTabs.length > 0 && (
        <section className="mt-10">
          <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar" role="tablist">
            {visibleTabs.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={activeTab === k} onClick={() => setTab(k)} className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${activeTab === k ? 'border-brand text-brand' : 'border-transparent text-stone-500 hover:text-ink'}`}>{label}</button>
            ))}
          </div>
          <div className="py-5">
            {activeTab === 'desc' && <p className="text-stone-700 leading-relaxed whitespace-pre-line max-w-3xl">{desc}</p>}
            {activeTab === 'specs' && (
              <table className="w-full max-w-3xl text-sm"><tbody>
                {p.specs.map((s, i) => <tr key={i} className="border-b border-stone-100"><th scope="row" className="text-left font-medium text-stone-500 py-2.5 pr-4 w-1/3">{s.k}</th><td className="py-2.5 text-ink">{s.v}</td></tr>)}
              </tbody></table>
            )}
            {activeTab === 'features' && <ul className="list-disc pl-5 space-y-1.5 text-stone-700 max-w-3xl">{p.features.map((f, i) => <li key={i}>{f}</li>)}</ul>}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-ink mb-4">{t('related_products')}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
