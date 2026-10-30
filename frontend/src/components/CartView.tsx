'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useSite } from './SiteProvider';
import { Img } from './Img';
import { EmptyState } from './EmptyState';
import { useCart, selectSubtotal } from '@/store/cart';
import { useHydrated } from './StoreHydrator';
import { useQuote } from '@/lib/useQuote';

export function CartView() {
  const { t, lang, money, num, settings } = useSite();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const localSubtotal = useCart(selectSubtotal);
  const { quote } = useQuote(lines, '', '', lang);
  const del = settings.delivery || {};
  const subtotal = quote ? quote.subtotal : localSubtotal;
  const free = !!del.free_enabled;
  const threshold = Number(del.free_threshold) || 0;
  const remaining = quote ? quote.free_remaining : Math.max(0, threshold - subtotal);

  if (!hydrated) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-400">{t('loading')}</div>;
  if (!lines.length) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <EmptyState title={t('cart_empty')} hint={t('cart_empty_hint')} cta={false} />
        <div className="text-center -mt-8 pb-10"><Link href="/" className="inline-block px-5 py-2.5 rounded-full bg-brand text-white text-sm font-semibold">{t('continue_shopping')}</Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-6">{t('cart_title')}</h1>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <ul className="space-y-3">
          {lines.map((l) => {
            const q = quote?.lines.find((x) => x.id === l.id);
            const unit = q ? q.price : l.price;
            const name = lang === 'en' ? l.nameEn || l.name : l.name;
            return (
              <li key={`${l.id}|${l.variant}`} className="flex gap-3 sm:gap-4 bg-white border border-stone-200 rounded-2xl p-3 sm:p-4">
                <Link href={`/product/${l.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-stone-50 rounded-xl overflow-hidden"><Img src={l.image} alt={name} sizes="96px" className="object-contain p-2 mix-blend-multiply" /></Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${l.slug}`} className="font-semibold text-sm text-ink line-clamp-2 hover:text-brand">{name}</Link>
                  {l.variant && <p className="text-xs text-stone-500 mt-0.5">{l.variant}</p>}
                  {q && !q.in_stock && <p className="text-xs text-accent mt-0.5">{t('out_of_stock')}</p>}
                  <p className="font-mono font-bold text-brand mt-1">{money(unit)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-stone-200 rounded-full">
                      <button onClick={() => setQty(l.id, l.variant, l.qty - 1)} className="w-8 h-8 flex items-center justify-center" aria-label="-"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-7 text-center text-sm font-semibold">{num(l.qty)}</span>
                      <button onClick={() => setQty(l.id, l.variant, l.qty + 1)} className="w-8 h-8 flex items-center justify-center" aria-label="+"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => remove(l.id, l.variant)} className="text-stone-400 hover:text-accent p-1.5" aria-label={t('remove')}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="bg-cream border border-brand/20 rounded-2xl p-5 h-fit space-y-3 lg:sticky lg:top-40">
          <h2 className="font-bold text-ink">{t('order_summary')}</h2>
          <div className="flex justify-between text-sm"><span className="text-stone-600">{t('subtotal')}</span><span className="font-mono font-semibold">{money(subtotal)}</span></div>
          <p className="text-xs text-stone-500">{t('shipping_estimate_note')}</p>
          {free && threshold > 0 && remaining > 0 && <p className="text-xs font-semibold text-brand">{t('free_shipping_remaining', { n: num(Math.ceil(remaining)) })}</p>}
          {free && threshold > 0 && remaining <= 0 && <p className="text-xs font-semibold text-green-700">{t('free_delivery_over', { n: num(threshold) })} ✓</p>}
          <Link href="/checkout" className="block text-center bg-brand hover:opacity-90 text-white font-semibold py-3 rounded-full">{t('proceed_checkout')}</Link>
          <Link href="/" className="block text-center text-sm text-stone-600 hover:text-brand">{t('continue_shopping')}</Link>
        </aside>
      </div>
    </div>
  );
}
