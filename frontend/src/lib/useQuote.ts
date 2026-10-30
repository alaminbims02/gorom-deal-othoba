'use client';

import { useEffect, useState } from 'react';
import type { CartLine } from '@/store/cart';
import type { Lang, QuoteResult } from './types';

/** সার্ভার-পুনর্গণিত দাম (কোটেশন)। ব্যর্থ হলে null — UI লোকাল অনুমান দেখায়। */
export function useQuote(lines: CartLine[], district: string, coupon: string, lang: Lang) {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify([lines.map((l) => [l.id, l.qty, l.variant]), district, coupon, lang]);

  useEffect(() => {
    if (!lines.length) {
      setQuote(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: lines.map((l) => ({ id: l.id, qty: l.qty, variant: l.variant })), district, coupon, lang }),
          signal: ctrl.signal,
        });
        setQuote(res.ok ? ((await res.json()) as QuoteResult) : null);
      } catch {
        /* aborted / offline */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, loading };
}
