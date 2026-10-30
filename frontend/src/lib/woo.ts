import 'server-only';
import { HAS_WP, WC_KEY, WC_SECRET, WC_URL } from './env';
import { htmlToText } from './sanitize';
import type { Product } from './types';

/**
 * WooCommerce / gd/v1 ডেটা — শুধু সার্ভার থেকে। WC_KEY/WC_SECRET কখনো ব্রাউজারে যায় না।
 * WP বন্ধ/অনুপস্থিত হলে null/[] ফেরত দেয় (খালি অবস্থা দেখানো হয়, ক্র্যাশ নয়)।
 */

const REVALIDATE = 300;

interface FetchOpts {
  tags?: string[];
  revalidate?: number;
}

async function rawFetch(url: string, opts: FetchOpts, auth: boolean): Promise<Response | null> {
  if (!HAS_WP) return null;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth && WC_KEY && WC_SECRET) {
    headers.Authorization = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  }
  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: opts.revalidate ?? REVALIDATE, tags: opts.tags ?? [] },
      signal: AbortSignal.timeout(15000),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

/** পাবলিক gd/v1 এন্ডপয়েন্ট (কী লাগে না) */
export async function gdGet<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  const res = await rawFetch(`${WC_URL}/wp-json/gd/v1/${path}`, opts, false);
  if (!res) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** WooCommerce REST v3 (read-only key) */
async function wooGet(path: string, query: Record<string, string | number>, opts: FetchOpts) {
  const qs = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
  const res = await rawFetch(`${WC_URL}/wp-json/wc/v3/${path}?${qs.toString()}`, opts, true);
  if (!res) return null;
  try {
    const data = await res.json();
    return { data, totalPages: Number(res.headers.get('x-wp-totalpages') || 1) };
  } catch {
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapProduct(p: any): Product {
  const gd = p.gd || {};
  const price = parseFloat(p.price) || 0;
  const regular = parseFloat(p.regular_price) || price;
  const original = regular > price ? regular : price;
  const cat = (p.categories || []).find((c: any) => c.slug !== 'uncategorized') || {};
  const images: string[] = (p.images || []).map((i: any) => i.src).filter(Boolean);
  const name = htmlToText(p.name || '');
  const ratingCount = Number(p.rating_count) || 0;
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku || '',
    name,
    nameEn: gd.name_en || name,
    brand: gd.brand || '',
    categorySlug: cat.slug || '',
    categoryName: htmlToText(cat.name || ''),
    categoryNameEn: htmlToText(cat.name || ''),
    price,
    originalPrice: original,
    discountPercent: original > price && original > 0 ? Math.round(((original - price) / original) * 100) : 0,
    images,
    image: images[0] || '',
    inStock: p.stock_status === 'instock' || p.stock_status === 'onbackorder',
    stockCount: typeof p.stock_quantity === 'number' ? p.stock_quantity : null,
    isFlashDeal: !!gd.is_flash_deal,
    flashEnd: gd.flash_end || '',
    description: htmlToText(p.description || ''),
    descriptionEn: gd.description_en ? htmlToText(gd.description_en) : htmlToText(p.description || ''),
    features: Array.isArray(gd.features) ? gd.features : [],
    specs: Array.isArray(gd.specs) ? gd.specs : [],
    options: Array.isArray(gd.options) ? gd.options : [],
    warranty: gd.warranty || '',
    badge: gd.badge || '',
    ratingAverage: ratingCount > 0 ? parseFloat(p.average_rating) || 0 : 0,
    ratingCount,
    modified: p.date_modified_gmt ? `${p.date_modified_gmt}Z` : '',
  };
}

/** সব পাবলিশড পণ্য (সর্বোচ্চ ৩০০; ছোট/মাঝারি ক্যাটালগের জন্য যথেষ্ট) */
export async function getAllProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let page = 1; page <= 3; page++) {
    const r = await wooGet('products', { per_page: 100, page, status: 'publish', orderby: 'date', order: 'desc' }, { tags: ['products'] });
    if (!r || !Array.isArray(r.data)) break;
    out.push(...r.data.map(mapProduct));
    if (page >= r.totalPages) break;
  }
  return out;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = await wooGet('products', { slug, status: 'publish' }, { tags: ['products', `product:${slug}`] });
  if (!r || !Array.isArray(r.data) || !r.data[0]) return null;
  return mapProduct(r.data[0]);
}
