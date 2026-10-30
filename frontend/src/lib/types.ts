export type Lang = 'bn' | 'en';
export interface BiText {
  bn: string;
  en: string;
}

export interface ProductSpec {
  k: string;
  v: string;
}
export interface ProductOption {
  name: string;
  options: string[];
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  nameEn: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  categoryNameEn: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  images: string[];
  image: string;
  inStock: boolean;
  stockCount: number | null;
  isFlashDeal: boolean;
  flashEnd: string;
  description: string;
  descriptionEn: string;
  features: string[];
  specs: ProductSpec[];
  options: ProductOption[];
  warranty: string;
  badge: string;
  /** শুধু WooCommerce-এ আসল রিভিউ থাকলে */
  ratingAverage: number;
  ratingCount: number;
  modified: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  name_en: string;
  icon: string;
  order: number;
  count: number;
  parent: number;
  image: string;
}

export interface MenuItem {
  id: number;
  title: BiText;
  path: string;
  external: boolean;
  target: string;
  children: MenuItem[];
}
export interface MenuData {
  header: MenuItem[];
  footer_col1: MenuItem[];
  footer_col2: MenuItem[];
  footer_policy: MenuItem[];
}

export interface HomeSection {
  index: number;
  type: string;
  title: BiText;
  category: string;
  limit: number;
  banner_index: number;
  view_all: string;
}
export interface HomeData {
  sections: HomeSection[];
  flash_ids: number[];
  flash_ends_at: string;
  featured_tabs: { label: BiText; categories: string[] }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Settings = Record<string, any>;

export interface WpPage {
  id: number;
  slug: string;
  title: BiText;
  content: BiText;
  modified: string;
}

export interface QuoteResult {
  lines: { id: number; name: string; qty: number; price: number; regular_price: number; line_total: number; in_stock: boolean }[];
  subtotal: number;
  shipping: number;
  shipping_free: boolean;
  free_remaining: number;
  discount: number;
  coupon: { code: string; discount: number } | null;
  coupon_error: string | null;
  total: number;
  currency: string;
}

export interface TrackResult {
  ok: boolean;
  order_ref: string;
  status: 'received' | 'confirmed' | 'delivered' | 'cancelled' | 'refunded';
  status_label: string;
  created_at: string;
  items: { name: string; qty: number; total: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  district: string;
  updates: { date: string; text: string }[];
}
