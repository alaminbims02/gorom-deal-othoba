'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Package } from 'lucide-react';
import { useSite } from './SiteProvider';
import type { TrackResult } from '@/lib/types';

const STEPS = ['received', 'confirmed', 'delivered'] as const;

export function TrackView({ initialOrder = '' }: { initialOrder?: string }) {
  const { t, lang, money, num } = useSite();
  const [order, setOrder] = useState(initialOrder);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [res, setRes] = useState<TrackResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRes(null);
    if (!order.trim() || !phone.trim()) return setError(t('required_field'));
    setLoading(true);
    try {
      const qs = new URLSearchParams({ order: order.trim(), phone: phone.replace(/[\s-]/g, ''), lang });
      const r = await fetch(`/api/track?${qs.toString()}`);
      const data = await r.json().catch(() => null);
      if (r.ok && data?.ok) setRes(data as TrackResult);
      else setError((data && typeof data.message === 'string' && data.message) || t('order_failed'));
    } catch {
      setError(t('order_failed'));
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = res ? STEPS.indexOf(res.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto mb-3"><Package className="w-7 h-7 text-brand" /></div>
        <h1 className="text-2xl font-extrabold text-ink">{t('track_title')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('track_hint')}</p>
      </div>
      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
        <input value={order} onChange={(e) => setOrder(e.target.value)} maxLength={40} placeholder={t('order_number')} aria-label={t('order_number')} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={20} placeholder={t('phone')} aria-label={t('phone')} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand" />
        <button type="submit" disabled={loading} className="w-full bg-brand text-white font-semibold py-2.5 rounded-full hover:opacity-90 disabled:opacity-60">{loading ? t('tracking') : t('track_button')}</button>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      </form>

      {res && (
        <div className="mt-6 bg-cream border border-brand/20 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div><p className="text-xs text-stone-500">{t('order_id')}</p><p className="font-mono font-bold text-lg text-brand">{res.order_ref}</p></div>
            <span className="px-3 py-1 rounded-full bg-white border border-brand/30 text-sm font-semibold">{res.status_label}</span>
          </div>

          {stepIdx >= 0 ? (
            <ol className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <li key={s} className="flex-1 flex flex-col items-center text-center gap-1.5 relative">
                  {i > 0 && <span className={`absolute top-3 right-1/2 w-full h-0.5 -z-0 ${i <= stepIdx ? 'bg-brand' : 'bg-stone-300'}`} />}
                  {i <= stepIdx ? <CheckCircle2 className="w-6 h-6 text-brand relative bg-cream rounded-full" /> : <Circle className="w-6 h-6 text-stone-300 relative bg-cream rounded-full" />}
                  <span className="text-xs font-medium">{t(`status_${s}`)}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {res.items.length > 0 && (
            <div>
              <h2 className="font-bold text-sm mb-2">{t('order_items')}</h2>
              <ul className="text-sm divide-y divide-brand/10">
                {res.items.map((it, i) => <li key={i} className="py-1.5 flex justify-between gap-3"><span>{it.name} × {num(it.qty)}</span><span className="font-mono">{money(it.total)}</span></li>)}
              </ul>
              <div className="text-sm mt-3 space-y-1">
                <div className="flex justify-between"><span>{t('shipping')}</span><span className="font-mono">{res.shipping ? money(res.shipping) : t('free')}</span></div>
                {res.discount > 0 && <div className="flex justify-between text-green-700"><span>{t('discount')}</span><span className="font-mono">-{money(res.discount)}</span></div>}
                <div className="flex justify-between font-bold text-base"><span>{t('total')}</span><span className="font-mono text-brand">{money(res.total)}</span></div>
              </div>
            </div>
          )}

          {res.updates.length > 0 && (
            <div>
              <h2 className="font-bold text-sm mb-2">{t('order_updates')}</h2>
              <ul className="space-y-2 text-sm">
                {res.updates.map((u, i) => <li key={i} className="bg-white rounded-lg px-3 py-2"><span className="text-xs text-stone-400 block">{u.date}</span>{u.text}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
