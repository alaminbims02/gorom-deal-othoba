import 'server-only';
import { gdGet, getAllProducts } from './woo';
import type { Category, HomeData, MenuData, Product, Settings, WpPage, Lang, BiText } from './types';
import { cleanHtml } from './sanitize';
import strings from '@/data/ui-strings.json';

export async function getSettings(): Promise<Settings> {
  return (await gdGet<Settings>('settings', { tags: ['settings'] })) || {};
}

export async function getMenu(): Promise<MenuData> {
  const m = await gdGet<MenuData>('menu', { tags: ['menu'] });
  return {
    header: m?.header || [],
    footer_col1: m?.footer_col1 || [],
    footer_col2: m?.footer_col2 || [],
    footer_policy: m?.footer_policy || [],
  };
}

export async function getCategories(): Promise<Category[]> {
  return (await gdGet<Category[]>('categories', { tags: ['categories'] })) || [];
}

export async function getHome(): Promise<HomeData | null> {
  return gdGet<HomeData>('home', { tags: ['products', 'settings'] });
}

export async function getPage(slug: string): Promise<WpPage | null> {
  const p = await gdGet<WpPage>(`page/${encodeURIComponent(slug)}`, { tags: ['pages', `page:${slug}`] });
  if (!p) return null;
  return { ...p, content: { bn: cleanHtml(p.content.bn), en: cleanHtml(p.content.en) } };
}

export async function getPageList(): Promise<{ slug: string; title: BiText; modified: string }[]> {
  return (await gdGet<{ slug: string; title: BiText; modified: string }[]>('pages', { tags: ['pages'] })) || [];
}

export { getAllProducts };

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.categorySlug === slug);
}

/* ---- সার্ভার-সাইড টেক্সট (metadata ইত্যাদির জন্য) ---- */

export function defaultLang(settings: Settings): Lang {
  return settings?.general?.default_lang === 'en' ? 'en' : 'bn';
}

export function pick(v: BiText | undefined, lang: Lang): string {
  if (!v) return '';
  return (lang === 'en' ? v.en || v.bn : v.bn || v.en) || '';
}

export function str(settings: Settings, key: string, lang: Lang): string {
  const o = settings?.strings?.[key];
  const base = (strings as Record<string, BiText>)[key];
  const v = o && (o.bn || o.en) ? o : base;
  return pick(v, lang) || key;
}

export function seoTitle(settings: Settings, title: string): string {
  const tpl: string = settings?.seo?.title_template || '%s';
  return tpl.includes('%s') ? tpl.replace('%s', title) : title;
}
