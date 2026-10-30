'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/types';

interface WishState {
  items: Product[];
  toggle: (p: Product) => void;
  has: (id: number) => boolean;
}

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) =>
        set((s) => (s.items.some((x) => x.id === p.id) ? { items: s.items.filter((x) => x.id !== p.id) } : { items: [...s.items, p] })),
      has: (id) => get().items.some((x) => x.id === id),
    }),
    { name: 'gd_wishlist_v1', storage: createJSONStorage(() => localStorage), skipHydration: true, version: 1 },
  ),
);
