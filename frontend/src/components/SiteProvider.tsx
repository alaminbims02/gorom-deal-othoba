'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import uiStrings from '@/data/ui-strings.json';
import type { BiText, Category, Lang, MenuData, Settings } from '@/lib/types';

interface Ctx {
  settings: Settings;
  menu: MenuData;
  categories: Category[];
  lang: Lang;
  setLang: (l: Lang) => void;
  /** UI স্ট্রিং (WP "strings" ট্যাব ওভাররাইড সহ) */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** দ্বিভাষিক টেক্সট বাছাই */
  bi: (v: BiText | string | undefined | null) => string;
  /** ক্যাটাগরির নাম (বর্তমান ভাষায়) */
  catName: (slug: string, fallback?: string) => string;
  money: (n: number) => string;
  num: (n: number | string) => string;
}

const SiteCtx = createContext<Ctx | null>(null);
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function SiteProvider({
  settings,
  menu,
  categories,
  initialLang,
  children,
}: {
  settings: Settings;
  menu: MenuData;
  categories: Category[];
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('gd_lang') : null;
    if ((saved === 'bn' || saved === 'en') && saved !== initialLang) setLangState(saved);
  }, [initialLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('gd_lang', l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const overrides = (settings?.strings || {}) as Record<string, BiText>;
    const base = uiStrings as Record<string, BiText>;
    const t: Ctx['t'] = (key, vars) => {
      const o = overrides[key];
      const src = o && (o.bn || o.en) ? o : base[key];
      let s = src ? (lang === 'en' ? src.en || src.bn : src.bn || src.en) : key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };
    const bi: Ctx['bi'] = (v) => {
      if (!v) return '';
      if (typeof v === 'string') return v;
      return (lang === 'en' ? v.en || v.bn : v.bn || v.en) || '';
    };
    const num: Ctx['num'] = (n) => {
      const s = typeof n === 'number' ? n.toLocaleString('en-US') : String(n);
      return lang === 'bn' ? s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : s;
    };
    const money: Ctx['money'] = (n) => `৳${num(Math.round(n * 100) / 100)}`;
    const catName: Ctx['catName'] = (slug, fallback = '') => {
      const c = categories.find((x) => x.slug === slug);
      if (!c) return fallback;
      return lang === 'en' ? c.name_en || c.name : c.name;
    };
    return { settings, menu, categories, lang, setLang, t, bi, catName, money, num };
  }, [settings, menu, categories, lang, setLang]);

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite(): Ctx {
  const c = useContext(SiteCtx);
  if (!c) throw new Error('useSite must be used inside SiteProvider');
  return c;
}

/** সার্ভার কম্পোনেন্ট থেকে দ্বিভাষিক টেক্সট দেখাতে */
export function Bi({ v }: { v: BiText | string | undefined | null }) {
  const { bi } = useSite();
  return <>{bi(v)}</>;
}

/** UI স্ট্রিং কী দিয়ে */
export function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { t } = useSite();
  return <>{t(k, vars)}</>;
}
