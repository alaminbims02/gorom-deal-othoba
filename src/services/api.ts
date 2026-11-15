/**
 * Headless WordPress API client.
 *
 * All storefront content comes from the "Gorom Deal Headless" WordPress plugin
 * (REST namespace: /wp-json/goromdeal/v1). Set VITE_WP_API_URL in .env, e.g.
 *   VITE_WP_API_URL="https://admin.goromdeal.com/wp-json/goromdeal/v1"
 *
 * When VITE_WP_API_URL is empty the app runs in demo mode using the bundled
 * seed.json (the same file the plugin imports as demo content).
 */
import seed from '../data/seed.json';
import type {
  CartItem,
  Category,
  DeliveryArea,
  Faq,
  HeroSlide,
  Order,
  Product,
  SiteData,
  SiteSettings,
  StoreVoucher,
} from '../types';

export const API_URL: string = (import.meta.env.VITE_WP_API_URL || '').replace(/\/+$/, '');
export const IS_LIVE = API_URL.length > 0;

const CACHE_KEY = 'goromdeal_bootstrap_v1';
const TOKEN_KEY = 'goromdeal_customer_token';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Seed data references images by bare filename; resolve them to /images/. */
export const assetUrl = (src: string | undefined | null): string => {
  if (!src) return '';
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:')) return src;
  return `${import.meta.env.BASE_URL || '/'}images/${src}`;
};

const num = (v: unknown, d = 0): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : d;
};

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 0, code = 'error') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.headers as Record<string, string>) };
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const token = getCustomerToken();
  if (token) headers['X-GD-Token'] = token;
  try {
    // Server error messages come back in the visitor's language.
    headers['X-GD-Lang'] = localStorage.getItem('goromdeal_lang') === 'en' ? 'en' : 'bn';
  } catch {
    /* ignore */
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data?.code || 'http_error');
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* normalisation (makes API + seed payloads safe for the UI)           */
/* ------------------------------------------------------------------ */

function normalizeProduct(raw: any, categories: Category[]): Product {
  const images: string[] = (Array.isArray(raw.images) ? raw.images : []).map(assetUrl).filter(Boolean);
  const price = num(raw.price);
  const originalPrice = Math.max(num(raw.originalPrice, price), price);
  const cat = categories.find((c) => c.id === raw.category);
  const discount =
    raw.discountPercent !== undefined
      ? num(raw.discountPercent)
      : originalPrice > price && originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

  return {
    id: String(raw.id),
    wpId: raw.wpId,
    name: raw.name || '',
    nameEn: raw.nameEn || raw.name || '',
    brand: raw.brand || '',
    category: raw.category || '',
    categoryNameBn: raw.categoryNameBn || cat?.name || '',
    categoryNameEn: raw.categoryNameEn || cat?.nameEn || '',
    price,
    originalPrice,
    discountPercent: discount,
    rating: num(raw.rating),
    reviewCount: num(raw.reviewCount, Array.isArray(raw.reviews) ? raw.reviews.length : 0),
    images,
    image: assetUrl(raw.image) || images[0] || '',
    inStock: raw.inStock !== false,
    stockCount: num(raw.stockCount),
    isFlashDeal: Boolean(raw.isFlashDeal),
    isFeatured: raw.isFeatured !== false,
    soldPercent: raw.soldPercent !== undefined ? num(raw.soldPercent) : undefined,
    description: raw.description || '',
    descriptionEn: raw.descriptionEn || raw.description || '',
    features: Array.isArray(raw.features) ? raw.features : [],
    featuresEn: Array.isArray(raw.featuresEn) ? raw.featuresEn : [],
    specifications: Array.isArray(raw.specifications)
      ? raw.specifications
      : Object.entries(raw.specifications || {}).map(([label, value]) => ({ label, value: String(value) })),
    warranty: raw.warranty || '',
    warrantyEn: raw.warrantyEn || '',
    sku: raw.sku || '',
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    reviews: (Array.isArray(raw.reviews) ? raw.reviews : []).map((r: any, i: number) => ({
      id: String(r.id ?? `${raw.id}-rev-${i}`),
      author: r.author || '',
      rating: Math.max(1, Math.min(5, Math.round(num(r.rating, 5)))),
      date: r.date || '',
      comment: r.comment || '',
      verifiedPurchase: Boolean(r.verifiedPurchase),
      city: r.city || '',
    })),
    badge: raw.badge || '',
    badgeEn: raw.badgeEn || '',
  };
}

function resolveSettingsImages(s: SiteSettings): SiteSettings {
  return {
    ...s,
    general: { ...s.general, logo: assetUrl(s.general.logo) },
    promoBanner: { ...s.promoBanner, image: assetUrl(s.promoBanner.image) },
    catalog: { ...s.catalog, allCategoryImage: assetUrl(s.catalog.allCategoryImage) },
  };
}

export function normalizeSiteData(raw: any, live: boolean): SiteData {
  const categories: Category[] = (raw.categories || []).map((c: any) => ({
    id: String(c.id),
    name: c.name || '',
    nameEn: c.nameEn || c.name || '',
    iconName: c.iconName || 'LayoutGrid',
    image: assetUrl(c.image),
    itemCount: 0,
    description: c.description,
  }));
  const products: Product[] = (raw.products || []).map((p: any) => normalizeProduct(p, categories));
  categories.forEach((c) => {
    c.itemCount = products.filter((p) => p.category === c.id).length;
  });

  const slides: HeroSlide[] = (raw.slides || []).map((s: any, i: number) => ({
    ...s,
    id: String(s.id ?? i + 1),
    target: s.target || '',
    image: assetUrl(s.image),
  }));
  const vouchers: StoreVoucher[] = (raw.vouchers || []).map((v: any) => ({
    ...v,
    code: String(v.code).toUpperCase(),
    amount: num(v.amount),
    minSpend: num(v.minSpend),
    maxDiscount: v.maxDiscount ? num(v.maxDiscount) : undefined,
  }));
  const faqs: Faq[] = (raw.faqs || []).map((f: any, i: number) => ({ ...f, id: String(f.id ?? i + 1) }));

  return {
    settings: resolveSettingsImages(raw.settings as SiteSettings),
    labels: raw.labels || {},
    categories,
    products,
    slides,
    vouchers,
    faqs,
    live,
  };
}

/* ------------------------------------------------------------------ */
/* bootstrap                                                           */
/* ------------------------------------------------------------------ */

export function getFallbackData(): SiteData {
  return normalizeSiteData(seed, false);
}

export function getCachedData(): SiteData | null {
  if (!IS_LIVE) return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? normalizeSiteData(JSON.parse(raw), true) : null;
  } catch {
    return null;
  }
}

/** Loads every piece of storefront content in one request. */
export async function fetchSiteData(): Promise<SiteData> {
  if (!IS_LIVE) return getFallbackData();
  const raw = await request<any>('/bootstrap');
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(raw));
  } catch {
    /* storage full / blocked */
  }
  return normalizeSiteData(raw, true);
}

/* ------------------------------------------------------------------ */
/* vouchers & delivery (UI preview; the server re-computes on order)   */
/* ------------------------------------------------------------------ */

export function voucherDiscount(v: StoreVoucher | undefined, subtotal: number): number {
  if (!v || subtotal < v.minSpend) return 0;
  let d = v.type === 'percent' ? Math.round((subtotal * v.amount) / 100) : v.amount;
  if (v.maxDiscount) d = Math.min(d, v.maxDiscount);
  return Math.max(0, Math.min(d, subtotal));
}

export function deliveryChargeFor(settings: SiteSettings, area: DeliveryArea, subtotal: number) {
  const zone = area === 'inside-dhaka' ? settings.delivery.insideDhaka : settings.delivery.outsideDhaka;
  const standard = num(zone.charge);
  const threshold = num(settings.delivery.freeThreshold);
  const isFree = threshold > 0 && subtotal >= threshold;
  return { standard, charge: isFree ? 0 : standard, isFree, threshold };
}

/* ------------------------------------------------------------------ */
/* orders                                                              */
/* ------------------------------------------------------------------ */

export interface CreateOrderInput {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  deliveryArea: DeliveryArea;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
  transactionId?: string;
}

function hydrateOrder(raw: any, products: Product[]): Order {
  const items: CartItem[] = (raw.items || []).map((it: any) => {
    const live = products.find((p) => p.id === it.productId);
    const product: Product =
      live ||
      normalizeProduct(
        {
          id: it.productId,
          name: it.name,
          nameEn: it.nameEn,
          price: it.price,
          originalPrice: it.originalPrice ?? it.price,
          images: it.image ? [it.image] : [],
        },
        [],
      );
    return { product: { ...product, price: num(it.price, product.price) }, quantity: num(it.quantity, 1), selectedVariant: it.variant || undefined };
  });
  return { ...raw, items } as Order;
}

export async function createOrder(input: CreateOrderInput, data: SiteData): Promise<Order> {
  const payload = {
    ...input,
    items: input.items.map((i) => ({ productId: i.product.id, quantity: i.quantity, variant: i.selectedVariant || '' })),
  };

  if (!IS_LIVE) {
    // Demo mode: compute locally.
    const subtotal = input.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const v = data.vouchers.find((x) => x.code === (input.couponCode || '').toUpperCase());
    const discount = voucherDiscount(v, subtotal);
    const { charge } = deliveryChargeFor(data.settings, input.deliveryArea, subtotal);
    const now = new Date().toISOString();
    return {
      id: 'GD-' + Math.floor(100000 + Math.random() * 900000),
      date: now,
      items: [...input.items],
      subtotal,
      deliveryCharge: charge,
      discount,
      total: Math.max(0, subtotal + charge - discount),
      deliveryArea: input.deliveryArea,
      paymentMethod: input.paymentMethod,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      district: input.district,
      note: input.note,
      couponCode: v?.code,
      status: 'confirmed',
      timeline: [{ status: 'confirmed', date: now }],
    };
  }

  const raw = await request<any>('/orders', { method: 'POST', body: JSON.stringify(payload) });
  return hydrateOrder(raw, data.products);
}

export async function trackOrder(query: string, data: SiteData, localOrders: Order[] = []): Promise<Order | null> {
  const q = query.trim().toUpperCase();
  const local = localOrders.find((o) => o.id.toUpperCase() === q || o.customerPhone.includes(q));
  if (!IS_LIVE) return local || null;
  try {
    const raw = await request<any>(`/orders/track?q=${encodeURIComponent(query.trim())}`);
    return hydrateOrder(raw, data.products);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* newsletter & reviews                                                */
/* ------------------------------------------------------------------ */

export async function subscribeNewsletter(email: string): Promise<void> {
  if (!IS_LIVE) return;
  await request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function submitReview(
  productId: string,
  review: { author: string; city: string; rating: number; comment: string },
): Promise<void> {
  if (!IS_LIVE) return;
  await request(`/products/${encodeURIComponent(productId)}/reviews`, { method: 'POST', body: JSON.stringify(review) });
}

/* ------------------------------------------------------------------ */
/* customer account (phone + OTP)                                      */
/* ------------------------------------------------------------------ */

export interface Customer {
  phone: string;
  name: string;
}

export function getCustomerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setCustomerToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Returns a demo OTP when the backend runs in "demo OTP" mode, otherwise undefined. */
export async function sendOtp(phone: string): Promise<{ demoCode?: string }> {
  if (!IS_LIVE) return { demoCode: '1234' };
  return request('/auth/otp', { method: 'POST', body: JSON.stringify({ phone }) });
}

export async function verifyOtp(phone: string, code: string): Promise<Customer> {
  if (!IS_LIVE) {
    if (code.length !== 4) throw new ApiError('Invalid OTP', 400, 'invalid_otp');
    return { phone, name: '' };
  }
  const res = await request<{ token: string; customer: Customer }>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
  setCustomerToken(res.token);
  return res.customer;
}

export async function getMe(): Promise<Customer | null> {
  if (!IS_LIVE || !getCustomerToken()) return null;
  try {
    return await request<Customer>('/account/me');
  } catch {
    setCustomerToken(null);
    return null;
  }
}

export async function getMyOrders(data: SiteData): Promise<Order[]> {
  if (!IS_LIVE || !getCustomerToken()) return [];
  const raw = await request<any[]>('/account/orders');
  return raw.map((o) => hydrateOrder(o, data.products));
}

export async function logout(): Promise<void> {
  if (IS_LIVE && getCustomerToken()) {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
  }
  setCustomerToken(null);
}
