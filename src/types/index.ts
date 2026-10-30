export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  city?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  brand: string;
  category: 'kitchen-appliances' | 'cookware' | 'gadgets' | 'audio' | 'power-charging' | 'smartwatch';
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
  soldPercent?: number;
  description: string;
  descriptionEn: string;
  features: string[];
  specifications: Record<string, string>;
  warranty: string;
  sku: string;
  variants?: ProductVariant[];
  reviews: ProductReview[];
  badge?: string;
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
  itemCount: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  deliveryArea: 'inside-dhaka' | 'outside-dhaka';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
}
