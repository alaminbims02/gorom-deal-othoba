import { Product, Category } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';

export interface WordPressSettings {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  isConfigured: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt: string | null;
  mode: 'live-wordpress' | 'demo-headless';
}

const SETTINGS_STORAGE_KEY = 'goromdeal_headless_wp_config';
const PRODUCTS_STORAGE_KEY = 'goromdeal_headless_wp_products';
const CATEGORIES_STORAGE_KEY = 'goromdeal_headless_wp_categories';

export const getStoredWpSettings = (): WordPressSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading WP settings from storage', e);
  }
  return {
    siteUrl: 'https://demo-wp.goromdeal.com',
    consumerKey: '',
    consumerSecret: '',
    isConfigured: false,
    syncIntervalMinutes: 10,
    lastSyncedAt: null,
    mode: 'demo-headless',
  };
};

export const saveWpSettings = (settings: WordPressSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving WP settings', e);
  }
};

export const getHeadlessProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading headless products', e);
  }
  return PRODUCTS;
};

export const saveHeadlessProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed saving headless products', e);
  }
};

export const getHeadlessCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading headless categories', e);
  }
  return CATEGORIES;
};

export const saveHeadlessCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed saving headless categories', e);
  }
};

/**
 * Adapter function to transform WooCommerce REST API product payload into our clean frontend Product format
 */
export const transformWooProductToAppProduct = (woo: any): Product => {
  const images = Array.isArray(woo.images) && woo.images.length > 0
    ? woo.images.map((img: any) => img.src || img)
    : ['/src/assets/images/product_smart_airfryer_1793335872086.jpg'];

  const categoryName = woo.categories?.[0]?.name || 'কিচেন অ্যাপ্লায়েন্স';
  const categorySlug = (woo.categories?.[0]?.slug || 'kitchen-appliances') as any;

  const regularPrice = parseFloat(woo.regular_price || woo.price || '0');
  const salePrice = parseFloat(woo.sale_price || woo.price || '0');
  const discount = regularPrice > salePrice && regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  // Extract specs from attributes
  const specifications: Record<string, string> = {};
  if (Array.isArray(woo.attributes)) {
    woo.attributes.forEach((attr: any) => {
      if (attr.name && attr.options) {
        specifications[attr.name] = Array.isArray(attr.options) ? attr.options.join(', ') : String(attr.options);
      }
    });
  }

  // Fallback specs if empty
  if (Object.keys(specifications).length === 0) {
    specifications['ওয়ারেন্টি'] = '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি';
    specifications['ব্র্যান্ড'] = woo.brands?.[0]?.name || 'Vision / RFL';
  }

  return {
    id: `wp-${woo.id}`,
    name: woo.name || 'নতুন কিচেন পণ্য',
    nameEn: woo.slug ? woo.slug.replace(/-/g, ' ') : woo.name || 'New Kitchen Product',
    brand: woo.brands?.[0]?.name || 'Vision Electronics',
    category: categorySlug,
    categoryNameBn: categoryName,
    categoryNameEn: woo.categories?.[0]?.name || 'Kitchen Appliances',
    price: salePrice || regularPrice || 1950,
    originalPrice: regularPrice > salePrice ? regularPrice : (salePrice ? Math.round(salePrice * 1.3) : 2600),
    discountPercent: discount || 25,
    rating: parseFloat(woo.average_rating || '4.8'),
    reviewCount: parseInt(woo.rating_count || '24', 10),
    images: images,
    image: images[0],
    inStock: woo.stock_status === 'instock' || woo.in_stock !== false,
    stockCount: woo.stock_quantity || 25,
    isFlashDeal: Boolean(woo.featured || woo.on_sale),
    soldPercent: 75,
    description: (woo.short_description || woo.description || '').replace(/<[^>]*>?/gm, '') || 'উন্নত মানের কিচেন গ্যাজেট ও অ্যাপ্লায়েন্স।',
    descriptionEn: (woo.description || woo.short_description || '').replace(/<[^>]*>?/gm, '') || 'High performance kitchen gadget with official brand warranty.',
    features: [
      '১০০% খাঁটি ও আসল পণ্য গ্যারান্টি',
      'ঢাকা ও ৬৪ জেলায় দ্রুত ক্যাশ অন ডেলিভারি',
      '১ বছরের সরাসরি ব্র্যান্ড সার্ভিস ওয়ারেন্টি',
      '৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি',
    ],
    specifications,
    warranty: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
    sku: woo.sku || `SKU-${woo.id}`,
    reviews: [
      {
        id: `rev-wp-${woo.id}-1`,
        author: 'সম্মানিত গ্রাহক',
        rating: 5,
        date: 'সম্প্রতি',
        comment: 'পণ্যটি হাতে পেয়ে খুবই সন্তুষ্ট। কোয়ালিটি অনেক ভালো। ধন্যবাদ ওথোবা গরম ডিল টিমকে।',
        verifiedPurchase: true,
        city: 'ঢাকা',
      },
    ],
  };
};

/**
 * Fetch products from live WordPress WooCommerce REST API endpoint
 * /wp-json/wc/v3/products
 */
export const fetchWordPressProducts = async (
  settings: WordPressSettings
): Promise<{ success: boolean; products?: Product[]; error?: string }> => {
  try {
    let cleanUrl = settings.siteUrl.trim().replace(/\/$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const endpoint = `${cleanUrl}/wp-json/wc/v3/products?per_page=20&consumer_key=${encodeURIComponent(
      settings.consumerKey
    )}&consumer_secret=${encodeURIComponent(settings.consumerSecret)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `WordPress API responded with status ${response.status} (${response.statusText}). Check your Site URL and WooCommerce REST Keys.`,
      };
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'Invalid response from WooCommerce API: Expected an array of products.',
      };
    }

    const mapped = data.map(transformWooProductToAppProduct);
    return {
      success: true,
      products: mapped,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'AbortError' 
        ? 'WordPress সংযোগের সময় শেষ হয়ে গেছে (Timeout)। নিশ্চিত করুন আপনার সাইটটি লাইভ আছে এবং CORS রিকোয়েস্ট অনুমতি দেয়।'
        : `সংযোগ ব্যর্থ: ${err.message || 'CORS বা নেটওয়ার্ক সমস্যা হতে পারে।'}`,
    };
  }
};
