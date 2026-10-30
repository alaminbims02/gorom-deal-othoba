'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

/** localStorage থেকে কার্ট/উইশলিস্ট ক্লায়েন্টে রিহাইড্রেট (SSR মিসম্যাচ এড়াতে) */
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useWishlist.persist.rehydrate();
  }, []);
  return null;
}

export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => {
    const check = () => setH(useCart.persist.hasHydrated());
    check();
    return useCart.persist.onFinishHydration(() => setH(true));
  }, []);
  return h;
}
