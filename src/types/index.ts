export type Lang = 'bn' | 'en';

/** A bilingual text value managed from WordPress. */
export interface I18n {
  bn: string;
  en: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string; // ISO date (YYYY-MM-DD)
  comment: string;
  verifiedPurchase: boolean;
  city?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  wpId?: number;
  name: string;
  nameEn: string;
  brand: string;
  category: string;
  categoryNameBn: string;
  categoryNameEn: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  images: string[];
  image: string;
  inStock: boolean;
  stockCount: number;
  isFlashDeal: boolean;
  isFeatured: boolean;
  soldPercent?: number;
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  specifications: ProductSpec[];
  warranty: string;
  warrantyEn: string;
  sku: string;
  variants?: ProductVariant[];
  reviews: ProductReview[];
  badge?: string;
  badgeEn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  image: string;
  itemCount: number;
  description?: I18n;
}

export interface HeroSlide {
  id: string;
  target: string; // category slug, or '' for "scroll to deals"
  image: string;
  tab: I18n;
  kicker: I18n;
  title: I18n;
  subtitle: I18n;
  cta: I18n;
}

export interface StoreVoucher {
  code: string;
  title: I18n;
  label: I18n;
  type: 'percent' | 'fixed';
  amount: number;
  minSpend: number;
  maxDiscount?: number;
  validFrom?: string;
  validTo?: string;
}

export interface Faq {
  id: string;
  q: I18n;
  a: I18n;
}

export type DeliveryArea = 'inside-dhaka' | 'outside-dhaka';
export type PaymentMethodId = 'cod' | 'bkash' | 'nagad' | string;
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTimelineEntry {
  status: OrderStatus;
  date: string; // ISO datetime
}

export interface Order {
  id: string;
  date: string; // ISO datetime
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  deliveryArea: DeliveryArea;
  paymentMethod: PaymentMethodId;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  note?: string;
  couponCode?: string;
  status: OrderStatus;
  timeline?: OrderTimelineEntry[];
}

export interface NavLink {
  label: I18n;
  target: string;
  badge?: string;
  style?: 'primary' | 'normal' | 'deal';
}

export interface IconText {
  icon: string;
  title: I18n;
  text: I18n;
}

export interface DeliveryZone {
  name: I18n;
  time: I18n;
  charge: number;
}

export interface PaymentMethodSetting {
  id: PaymentMethodId;
  enabled: boolean;
  title: I18n;
  description: I18n;
  color: string;
  accountNumber?: string;
}

export interface SiteSettings {
  general: { siteName: I18n; logo: string; logoAlt: I18n; currencySymbol: string };
  seo: {
    homeTitle: I18n;
    homeDescription: I18n;
    productTitle: I18n;
    productDescription: I18n;
    categoryTitle: I18n;
    categoryDescription: I18n;
  };
  contact: { phone: string; phoneDisplay: I18n; hours: I18n; email: string; address: I18n };
  delivery: {
    insideDhaka: DeliveryZone;
    outsideDhaka: DeliveryZone;
    freeThreshold: number;
    defaultDistrict: string;
    districts: string[];
    insideDhakaDistricts: string[];
  };
  payments: PaymentMethodSetting[];
  header: { navLinks: NavLink[] };
  flashDeals: { title: I18n; endsAt: string; cycleHours: number; limit: number };
  promoBanner: { enabled: boolean; kicker: I18n; title: I18n; text: I18n; cta: I18n; image: string; target: string };
  featured: { title: I18n; limit: number; tabs: { label: I18n; categories: string[] }[] };
  trustFeatures: IconText[];
  footer: {
    about: I18n;
    columns: { title: I18n; links: { label: I18n; target: string }[] }[];
    newsletterTitle: I18n;
    newsletterText: I18n;
    copyright: I18n;
    bottomLinks: { label: I18n; url: string }[];
  };
  product: {
    trustBadges: { icon: string; title: I18n; subtitle: I18n }[];
    warrantyPolicy: I18n;
    returnTerms: I18n[];
    defaultSoldPercent: number;
    relatedLimit: number;
    allowReviews: boolean;
  };
  catalog: {
    kicker: I18n;
    storeTitle: I18n;
    storeDescription: I18n;
    heroBadges: { icon: string; label: I18n }[];
    allCategoryLabel: I18n;
    allCategoryStripLabel: I18n;
    allCategoryImage: string;
    storeCategoryLabel: I18n;
    priceMin: number;
    priceMax: number;
    discountOptions: number[];
    perPageOptions: number[];
    seoTitle: I18n;
    seoText: I18n;
    showPriceTable: boolean;
    priceTableTitle: I18n;
    whyBuyTitle: I18n;
    whyBuy: { title: I18n; text: I18n }[];
    guideTitle: I18n;
    guide: { title: I18n; text: I18n }[];
    faqTitle: I18n;
  };
  tracking: {
    courier: I18n;
    steps: { status: OrderStatus; icon: string; title: I18n }[];
    statusLabels: Record<OrderStatus, I18n>;
  };
}

export interface SiteData {
  settings: SiteSettings;
  labels: Record<string, { bn: string; en: string }>;
  categories: Category[];
  products: Product[];
  slides: HeroSlide[];
  vouchers: StoreVoucher[];
  faqs: Faq[];
  /** true when data came from the WordPress API, false when using the bundled fallback */
  live: boolean;
}
