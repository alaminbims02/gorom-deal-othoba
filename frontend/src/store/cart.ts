'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  image: string;
  price: number;
  originalPrice: number;
  qty: number;
  variant: string;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  setQty: (id: number, variant: string, qty: number) => void;
  remove: (id: number, variant: string) => void;
  clear: () => void;
}

const MAX_QTY = 20;

/** কার্ট শুধু ব্রাউজারের localStorage-এ থাকে; দাম/শিপিং সার্ভার আবার হিসাব করে। শুরুতে খালি। */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((s) => {
          const i = s.lines.findIndex((l) => l.id === line.id && l.variant === line.variant);
          if (i >= 0) {
            const lines = [...s.lines];
            lines[i] = { ...lines[i], ...line, qty: Math.min(MAX_QTY, lines[i].qty + qty) };
            return { lines };
          }
          return { lines: [...s.lines, { ...line, qty: Math.min(MAX_QTY, Math.max(1, qty)) }] };
        }),
      setQty: (id, variant, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id && l.variant === variant ? { ...l, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : l)),
        })),
      remove: (id, variant) => set((s) => ({ lines: s.lines.filter((l) => !(l.id === id && l.variant === variant)) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'gd_cart_v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
export const selectSubtotal = (s: CartState) => s.lines.reduce((n, l) => n + l.qty * l.price, 0);
