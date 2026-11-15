import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { Category, I18n, Lang, SiteData } from '../types';
import { getFallbackData } from '../services/api';

type Vars = (string | number)[] | Record<string, string | number>;

export interface SiteContextValue extends SiteData {
  lang: Lang;
  /** UI label from WordPress ("UI Texts" screen). Supports {0}/{name} placeholders. */
  t: (key: string, vars?: Vars) => string;
  /** Pick the current language from a bilingual value (falls back to the other language). */
  tx: (value: I18n | string | undefined | null, vars?: Vars) => string;
  /** Format a number with the language's digits/grouping. */
  money: (n: number) => string;
  /** Format an ISO date for display. */
  date: (iso: string) => string;
  /** Categories with the virtual "all" entry first (used by nav, filters, strips). */
  categoryList: Category[];
}

const fallbackLabels = getFallbackData().labels;

const fill = (s: string, vars?: Vars) => {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => {
    const v = (vars as any)[k];
    return v === undefined || v === null ? m : String(v);
  });
};

const SiteContext = createContext<SiteContextValue | null>(null);

export const SiteProvider: React.FC<{ data: SiteData; lang: Lang; children: React.ReactNode }> = ({
  data,
  lang,
  children,
}) => {
  const t = useCallback(
    (key: string, vars?: Vars) => {
      const entry = data.labels[key] || fallbackLabels[key];
      if (!entry) return key;
      const text = entry[lang] || entry[lang === 'bn' ? 'en' : 'bn'] || '';
      return fill(text, vars);
    },
    [data.labels, lang],
  );

  const tx = useCallback(
    (value: I18n | string | undefined | null, vars?: Vars) => {
      if (!value) return '';
      if (typeof value === 'string') return fill(value, vars);
      return fill(value[lang] || value[lang === 'bn' ? 'en' : 'bn'] || '', vars);
    },
    [lang],
  );

  const money = useCallback((n: number) => Math.round(n).toLocaleString('en-US'), []);

  const date = useCallback(
    (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    [lang],
  );

  const categoryList = useMemo<Category[]>(
    () => [
      {
        id: 'all',
        name: data.settings.catalog.allCategoryLabel.bn,
        nameEn: data.settings.catalog.allCategoryLabel.en,
        iconName: 'LayoutGrid',
        image: data.settings.catalog.allCategoryImage,
        itemCount: data.products.length,
      },
      ...data.categories,
    ],
    [data.categories, data.products.length, data.settings.catalog],
  );

  const value = useMemo<SiteContextValue>(
    () => ({ ...data, lang, t, tx, money, date, categoryList }),
    [data, lang, t, tx, money, date, categoryList],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
