'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSite } from './SiteProvider';
import { EmptyState } from './EmptyState';
import { useCart, selectSubtotal } from '@/store/cart';
import { useHydrated } from './StoreHydrator';
import { useQuote } from '@/lib/useQuote';

interface District { name_en: string; name_bn: string; zone: string }
interface Done { order_ref: string; total: number }

export function CheckoutView() {
  const { t, lang, bi, money, num, settings } = useSite();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const localSubtotal = useCart(selectSubtotal);
  const co = settings.checkout || {};
  const districts: District[] = Array.isArray(co.districts) ? co.districts : [];

  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', district: '', note: '', website: '' });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState<Done | null>(null);

  const { quote } = useQuote(lines, f.district, coupon, lang);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold text-ink">{bi(co.confirm_title) || t('order_id')}</h1>
        {bi(co.confirm_text) && <p className="text-stone-600 mt-2">{bi(co.confirm_text)}</p>}
        <div className="mt-6 bg-cream border border-brand/20 rounded-2xl p-5 inline-block text-left">
          <p className="text-sm text-stone-500">{t('order_id')}</p>
          <p className="text-2xl font-mono font-bold text-brand">{done.order_ref}</p>
          <p className="text-sm text-stone-600 mt-2">{t('total')}: <span className="font-mono font-semibold">{money(done.total)}</span></p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/track?order=${encodeURIComponent(done.order_ref)}`} className="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-semibold">{t('track_this_order')}</Link>
          <Link href="/" className="px-5 py-2.5 rounded-full border border-stone-300 text-sm font-semibold">{t('continue_shopping')}</Link>
        </div>
      </div>
    );
  }

  if (!hydrated) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-400">{t('loading')}</div>;
  if (!lines.length) return <EmptyState title={t('cart_empty')} hint={t('cart_empty_hint')} />;
  if (co.cod_enabled === false || !districts.length) return <EmptyState title={t('ordering_disabled')} hint={t('no_data_hint')} />;

  const subtotal = quote ? quote.subtotal : localSubtotal;
  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = t('required_field');
    if (!/^01[3-9]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = t('invalid_phone');
    if (f.address.trim().length < 5) e.address = t('required_field');
    if (!f.district) e.district = t('required_field');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({ id: l.id, qty: l.qty, variant: l.variant })),
          ...f,
          phone: f.phone.replace(/[\s-]/g, ''),
          coupon,
          lang,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        clear();
        setDone({ order_ref: String(data.order_ref || data.order_id), total: Number(data.total) || subtotal });
      } else {
        setServerError((data && typeof data.message === 'string' && data.message) || t('order_failed'));
      }
    } catch {
      setServerError(t('order_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const applyCoupon = () => setCoupon(couponInput.trim().toUpperCase());
  const inputCls = (k: string) => `w-full border rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 ${errors[k] ? 'border-accent' : 'border-stone-200'}`;
  const field = (k: string, label: string, el: React.ReactNode) => (
    <div><label className="block text-sm font-medium text-ink mb-1" htmlFor={`f-${k}`}>{label}</label>{el}{errors[k] && <p className="text-xs text-accent mt-1">{errors[k]}</p>}</div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-6">{t('checkout_title')}</h1>
      <form onSubmit={submit} noValidate className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-ink">{t('customer_info')}</h2>
          {field('name', t('full_name'), <input id="f-name" value={f.name} onChange={set('name')} maxLength={120} autoComplete="name" className={inputCls('name')} />)}
          {field('phone', t('phone'), <input id="f-phone" value={f.phone} onChange={set('phone')} inputMode="tel" maxLength={20} autoComplete="tel" placeholder={t('phone_hint')} className={inputCls('phone')} />)}
          {co.show_email && field('email', t('email_optional'), <input id="f-email" type="email" value={f.email} onChange={set('email')} maxLength={120} autoComplete="email" className={inputCls('email')} />)}
          {field('district', t('district'), (
            <select id="f-district" value={f.district} onChange={set('district')} className={inputCls('district')}>
              <option value="">{t('select_district')}</option>
              {districts.map((d) => <option key={d.name_en} value={d.name_en}>{lang === 'en' ? d.name_en : d.name_bn}</option>)}
            </select>
          ))}
          {field('address', t('address'), <textarea id="f-address" value={f.address} onChange={set('address')} rows={3} maxLength={400} autoComplete="street-address" className={inputCls('address')} />)}
          {co.show_note !== false && field('note', t('order_note'), <textarea id="f-note" value={f.note} onChange={set('note')} rows={2} maxLength={500} className={inputCls('note')} />)}
          {/* হানিপট — মানুষ দেখে না */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
            <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>
          </div>
          <div>
            <h2 className="font-bold text-ink mb-2">{t('payment_method')}</h2>
            <label className="flex items-start gap-3 border-2 border-brand bg-cream rounded-xl p-3">
              <input type="radio" checked readOnly className="mt-1 accent-brand" />
              <span><span className="block font-semibold text-sm">{t('cod')}</span><span className="block text-xs text-stone-500">{t('cod_hint')}</span></span>
            </label>
          </div>
        </div>

        <aside className="bg-cream border border-brand/20 rounded-2xl p-5 h-fit space-y-3 lg:sticky lg:top-40">
          <h2 className="font-bold text-ink">{t('order_summary')}</h2>
          <ul className="divide-y divide-brand/10 text-sm">
            {lines.map((l) => (
              <li key={`${l.id}|${l.variant}`} className="py-2 flex justify-between gap-3">
                <span className="text-stone-700 line-clamp-2">{lang === 'en' ? l.nameEn || l.name : l.name}{l.variant && ` (${l.variant})`} × {num(l.qty)}</span>
                <span className="font-mono shrink-0">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} maxLength={40} placeholder={t('coupon_code')} aria-label={t('coupon_code')} className="flex-1 min-w-0 border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white uppercase" />
            <button type="button" onClick={applyCoupon} className="px-4 py-2 rounded-xl bg-ink text-white text-sm font-semibold">{t('apply')}</button>
          </div>
          {quote?.coupon && <p className="text-xs text-green-700 font-semibold">{t('coupon_applied')}: {quote.coupon.code}</p>}
          {quote?.coupon_error && coupon && <p className="text-xs text-accent">{quote.coupon_error}</p>}
          <div className="space-y-1.5 text-sm pt-2 border-t border-brand/20">
            <div className="flex justify-between"><span className="text-stone-600">{t('subtotal')}</span><span className="font-mono">{money(subtotal)}</span></div>
            {quote && quote.discount > 0 && <div className="flex justify-between text-green-700"><span>{t('discount')}</span><span className="font-mono">-{money(quote.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone-600">{t('shipping')}</span><span className="font-mono">{!f.district ? '—' : quote ? (quote.shipping_free ? t('free') : money(quote.shipping)) : '…'}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-brand/20"><span>{t('total')}</span><span className="font-mono text-brand">{quote ? money(quote.total) : money(subtotal)}</span></div>
          </div>
          {serverError && <p role="alert" className="text-sm text-accent bg-white border border-accent/30 rounded-lg p-3">{serverError}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-brand hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-full">{submitting ? t('placing_order') : t('place_order')}</button>
        </aside>
      </form>
    </div>
  );
}
