import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { 
  Heart, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Phone, 
  Share2, 
  Clock,
  Ticket,
  ShoppingBag
} from 'lucide-react';
import { Product, StoreVoucher } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { ReviewForm } from './ReviewForm';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, quantity: number, variant?: string) => void;
  onBuyNow: (p: Product, quantity: number, variant?: string) => void;
  collectedVouchers?: string[];
  onCollectVoucher?: (code: string) => void;
  onCollectAllVouchers?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  collectedVouchers = [],
  onCollectVoucher,
  onCollectAllVouchers,
}) => {
  const { lang, t, tx, date, settings, vouchers: STORE_VOUCHERS } = useSite();
  const warrantyText = (lang === 'en' && product.warrantyEn) || product.warranty;
  const features = lang === 'en' && product.featuresEn.length > 0 ? product.featuresEn : product.features;
  const { delivery, contact } = settings;
  const fmtDate = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '');
  const validity = (v: StoreVoucher) =>
    v.validFrom || v.validTo ? `${fmtDate(v.validFrom)}${v.validFrom && v.validTo ? '–' : ''}${fmtDate(v.validTo)}` : '';
  const [selectedImage, setSelectedImage] = useState(product.images[0] || product.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'warranty'>('desc');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [buyGlowActive, setBuyGlowActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize variants
  useEffect(() => {
    setSelectedImage(product.images[0] || product.image);
    setQuantity(1);
    setBuyGlowActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (product.variants && product.variants.length > 0) {
      const initial: Record<string, string> = {};
      product.variants.forEach(v => {
        initial[v.name] = v.options[0];
      });
      setSelectedVariants(initial);
    }
  }, [product]);

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, settings.product.relatedLimit || 4);

  const selectedVariantString = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariantString);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNowWithGlow = () => {
    if (buyGlowActive) return;
    setBuyGlowActive(true);
    setTimeout(() => {
      onBuyNow(product, quantity, selectedVariantString);
      setTimeout(() => setBuyGlowActive(false), 300);
    }, 420);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const allCollected = STORE_VOUCHERS.every(v => collectedVouchers.includes(v.code));

  return (
    <article className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-24 lg:pb-16">
      
      {/* Clean Back Action Bar (No Breadcrumb) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FFF8F1] hover:text-[#F36B0B] text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('productDetailPage.back_to_catalog')}</span>
        </button>

        <span className="text-[11px] sm:text-xs font-medium text-stone-600 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t('productDetailPage.official_warranty_cod')}</span>
        </span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-start">
        
        {/* Left Column: Visual Gallery & Trust Seals */}
        <div className="lg:col-span-6 min-w-0 space-y-3.5 sm:space-y-4">
          
          {/* Big Featured Image Stage (Strict 1:1 Ratio) */}
          <div className="relative aspect-square w-full bg-[#FBFBFB] rounded-2xl border border-stone-200/90 overflow-hidden flex items-center justify-center group shadow-xs">
            <img
              src={selectedImage}
              alt={lang === 'bn' ? product.name : product.nameEn}
              referrerPolicy="no-referrer"
              className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Discount Badge */}
            {product.discountPercent > 0 && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#E93825] text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                -{product.discountPercent}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-sm ${
                isWishlisted
                  ? 'bg-[#E93825] text-white'
                  : 'bg-white/95 text-stone-600 hover:text-[#E93825] border border-stone-200'
              }`}
              title={isWishlisted ? t('common.wishlist_remove') : t('common.wishlist_add')}
            >
              <Heart className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Interactive Thumbnail Gallery (1:1 Ratio) */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-18 h-18 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden bg-stone-50 border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImage === imgUrl
                      ? 'border-[#F36B0B] ring-2 ring-[#F36B0B]/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Value Badges under Image */}
          {settings.product.trustBadges.length > 0 && (
            <div
              className="grid gap-1.5 sm:gap-3 pt-1 sm:pt-2 text-center text-[11px] sm:text-xs"
              style={{ gridTemplateColumns: `repeat(${settings.product.trustBadges.length}, minmax(0, 1fr))` }}
            >
              {settings.product.trustBadges.map((b, i) => (
                <div key={i} className="p-2 sm:p-3 bg-[#FFF8F1] rounded-xl border border-orange-100 flex flex-col items-center gap-1">
                  <DynamicIcon name={b.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-[#F36B0B]" />
                  <span className="font-bold text-[#252525] leading-tight">{tx(b.title, { brand: product.brand })}</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-500 truncate max-w-full">
                    {tx(b.subtitle, { brand: product.brand })}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 min-w-0 space-y-5">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-bold text-[#F36B0B] uppercase tracking-wider">{product.brand}</span>
              <span className="text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#252525] tracking-tight leading-snug">
              {lang === 'bn' ? product.name : product.nameEn}
            </h1>

            {/* Ratings, Reviews, and Stock */}
            <div className="flex items-center gap-2.5 text-xs pt-1 flex-wrap text-stone-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-stone-900 tabular-nums">{product.rating}</span>
              </div>
              <span className="text-stone-300">|</span>
              <button 
                onClick={() => setActiveTab('reviews')}
                className="text-stone-600 hover:text-[#F36B0B] underline font-medium cursor-pointer"
              >
                {product.reviewCount} {t('productDetailPage.reviews')}
              </button>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-700 font-semibold">
                {product.inStock ? t('productDetailPage.in_stock_units', [product.stockCount]) : t('common.out_of_stock')}
              </span>
            </div>
          </div>

          {/* Pricing Module */}
          <div className="p-3.5 sm:p-5 bg-[#FFF8F1] rounded-2xl border border-orange-200/80 space-y-2.5">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#252525] font-mono tabular-nums">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm sm:text-base text-stone-400 line-through font-mono tabular-nums">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.originalPrice > product.price && (
                <span className="text-[11px] sm:text-xs font-bold text-[#E93825] bg-[#E93825]/10 px-2 py-0.5 sm:py-1 rounded font-mono tabular-nums">
                  {t('productDetailPage.save')}
                  {(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Scarcity / Sold Progress Bar */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="font-semibold text-stone-700">
                  {t('productDetailPage.only_left_in_stock', [product.stockCount])}
                </span>
                <span className="font-bold text-[#F36B0B]">
                  {product.soldPercent || settings.product.defaultSoldPercent}% {t('productDetailPage.sold')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F36B0B] to-[#E93825] rounded-full"
                  style={{ width: `${Math.min(95, product.soldPercent || settings.product.defaultSoldPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sales-Friendly Collectible Vouchers Section (Notched Ticket Design, Responsive) */}
          <div className="w-full min-w-0 bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 space-y-3 shadow-2xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Ticket className="w-4 h-4 text-[#F36B0B] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-[#252525] truncate">
                  {t('productDetailPage.vouchers')}
                </h3>
                <ChevronRight className="w-4 h-4 text-[#F36B0B] shrink-0" />
              </div>

              <button
                type="button"
                onClick={() => onCollectAllVouchers?.()}
                disabled={allCollected}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  allCollected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#FFF8F1] hover:bg-[#ffe8cf] text-[#F36B0B] border border-orange-200'
                }`}
              >
                {allCollected
                  ? (t('productDetailPage.all_collected'))
                  : (t('productDetailPage.collect_all'))}
              </button>
            </div>

            {/* Responsive Ticket Cards (Stacked full-width on < sm, horizontal scroll on sm+) */}
            <div className="grid grid-cols-1 sm:flex sm:items-stretch gap-2.5 sm:gap-3 sm:overflow-x-auto sm:no-scrollbar pb-1">
              {STORE_VOUCHERS.map((v) => {
                const isCollected = collectedVouchers.includes(v.code);
                return (
                  <div
                    key={v.code}
                    className={`relative w-full sm:w-[270px] sm:shrink-0 rounded-xl border transition-all bg-[#FFFDFB] ${
                      isCollected ? 'border-emerald-400 bg-emerald-50/20' : 'border-[#F36B0B]/60 hover:border-[#F36B0B]'
                    }`}
                  >
                    {/* Top Ticket Content */}
                    <div className="p-3 pb-2.5 flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E93825] to-[#F36B0B] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-stone-800 truncate">
                            {tx(v.title)}
                          </p>
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFF8F1] text-[#F36B0B] border border-orange-200">
                            T&amp;C
                          </span>
                        </div>
                        <div className="text-lg font-extrabold text-[#F36B0B] leading-tight mt-0.5">
                          {tx(v.label)}
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          {t('productDetailPage.min_spend', [v.minSpend.toLocaleString()])}
                          {v.maxDiscount ? t('productDetailPage.max_discount', [v.maxDiscount.toLocaleString()]) : ''}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Cutout & Dashed Divider */}
                    <div className="relative flex items-center my-0.5">
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-3.5 -ml-[1px] rounded-r-full border border-l-0 bg-white ${
                          isCollected ? 'border-emerald-400' : 'border-[#F36B0B]/60'
                        }`}
                      />
                      <div
                        className={`flex-1 border-t border-dashed mx-1 ${
                          isCollected ? 'border-emerald-300' : 'border-[#F36B0B]/40'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-3.5 -mr-[1px] rounded-l-full border border-r-0 bg-white ${
                          isCollected ? 'border-emerald-400' : 'border-[#F36B0B]/60'
                        }`}
                      />
                    </div>

                    {/* Bottom Ticket Row: Expiry & Collect CTA */}
                    <div className="px-3 py-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-stone-500">
                        <Clock className="w-3 h-3 text-[#F36B0B] shrink-0" />
                        <span>{validity(v)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onCollectVoucher?.(v.code)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isCollected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#F36B0B] hover:bg-[#de5f07] text-white shadow-xs'
                        }`}
                      >
                        {isCollected ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>{t('productDetailPage.collected')}</span>
                          </>
                        ) : (
                          <span>{t('productDetailPage.collect')}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variant Selection if available */}
          {product.variants && product.variants.map((v, i) => (
            <div key={i} className="space-y-2">
              <label className="text-xs font-bold text-stone-800">
                {v.name}: <span className="font-semibold text-[#F36B0B]">{selectedVariants[v.name]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {v.options.map(opt => {
                  const isSelected = selectedVariants[v.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                      className={`px-3.5 py-2 text-xs rounded-xl font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#F36B0B] bg-white text-[#F36B0B] ring-2 ring-[#F36B0B]/20 shadow-xs'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-bold text-stone-700">{t('productDetailPage.quantity')}</span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-stone-900 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* High-Conversion Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Buy Now / Order Now with Tactile Glow & Shimmer Animation (No Icon) */}
              <button
                type="button"
                onClick={handleBuyNowWithGlow}
                className={`relative overflow-hidden w-full py-3.5 sm:py-4 px-5 sm:px-6 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  buyGlowActive
                    ? 'bg-gradient-to-r from-[#E93825] via-[#F36B0B] to-[#ff8b2c] text-white animate-buy-glow-burst ring-4 ring-orange-400/50'
                    : 'bg-gradient-to-r from-[#F36B0B] to-[#ff7e1f] hover:from-[#e46005] hover:to-[#F36B0B] text-white shadow-[0_6px_24px_-4px_rgba(243,107,11,0.55)] hover:shadow-[0_10px_30px_-2px_rgba(243,107,11,0.75)] hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {/* Smooth Light Sweep Effect */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-buy-shimmer"
                />
                <span className="relative z-10">
                  {buyGlowActive
                    ? (t('productDetailPage.opening_checkout'))
                    : (t('productDetailPage.buy_now'))}
                </span>
              </button>

              {/* Add to Cart (No Icon) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-[#252525] hover:bg-stone-800 text-white shadow-md'
                }`}
              >
                <span>
                  {addedAnimation 
                    ? (t('productDetailPage.added_to_cart')) 
                    : (t('productDetailPage.add_to_cart'))}
                </span>
              </button>
            </div>

            {/* Quick Share Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-[#F36B0B] shrink-0" />
                <span>{t('productDetailPage.ships_within_24_hours')}</span>
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-stone-600 hover:text-[#F36B0B] font-medium cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? (t('productDetailPage.link_copied')) : (t('productDetailPage.share'))}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Warranty Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#F36B0B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">{t('productDetailPage.delivery_information')}</p>
                <p className="text-stone-500 leading-relaxed">
                  {t('productDetailPage.delivery_info', {
                    insideName: tx(delivery.insideDhaka.name),
                    insideTime: tx(delivery.insideDhaka.time),
                    insideCharge: delivery.insideDhaka.charge,
                    outsideName: tx(delivery.outsideDhaka.name),
                    outsideTime: tx(delivery.outsideDhaka.time),
                    outsideCharge: delivery.outsideDhaka.charge,
                    threshold: delivery.freeThreshold.toLocaleString(),
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">{t('productDetailPage.warranty_guarantee')}</p>
                <p className="text-stone-500 leading-relaxed">
                  {warrantyText}{warrantyText ? '। ' : ''}{t('productDetailPage.check_parcel_at_doorstep_upon_delivery')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-stone-200 text-stone-700">
              <Phone className="w-4 h-4 text-[#F36B0B] shrink-0" />
              <span>{t('productDetailPage.order_by_phone')} <a href={`tel:${contact.phone}`} className="font-bold text-[#F36B0B]">{tx(contact.phoneDisplay) || contact.phone}</a></span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Section: Description, Specifications, Reviews, Warranty */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            {t('productDetailPage.description')}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            {t('productDetailPage.specifications')}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            <span>{t('productDetailPage.reviews_2')}</span>
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
              {product.reviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'warranty'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            {t('productDetailPage.warranty_returns')}
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-6">
          
          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="space-y-6 max-w-4xl text-stone-700 leading-relaxed text-sm">
              <p className="text-base text-stone-800 leading-relaxed font-medium">
                {lang === 'bn' ? product.description : product.descriptionEn}
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-[#252525]">
                  {t('productDetailPage.key_features_benefits')}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className="w-2 h-2 rounded-full bg-[#F36B0B] shrink-0 mt-1.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications Table */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left text-[11px] sm:text-sm">
                <tbody>
                  {product.specifications.map(({ label: key, value }, idx) => (
                    <tr 
                      key={idx} 
                      className={idx % 2 === 0 ? 'bg-stone-50' : 'bg-white'}
                    >
                      <th className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-stone-700 border-b border-stone-200 w-2/5 sm:w-1/3">
                        {key}
                      </th>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-stone-800 border-b border-stone-200">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-[#FFF8F1] rounded-2xl border border-orange-100">
                <div className="flex sm:block items-center gap-3 w-full sm:w-auto text-left sm:text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#F36B0B] tabular-nums">
                    {product.rating}
                  </div>
                  <div>
                    <div className="flex text-amber-500 sm:justify-center my-0.5 sm:my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-500">{product.reviewCount} {t('productDetailPage.ratings')}</p>
                  </div>
                </div>

                <div className="flex-1 text-xs text-stone-600 pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-orange-200/80 w-full">
                  <p className="font-bold text-stone-800 text-sm mb-1">
                    {t('productDetailPage.100_verified_buyer_reviews')}
                  </p>
                  <p className="text-stone-500">
                    {t('productDetailPage.all_reviews_are_submitted_by_authentic')}
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews.map(rev => (
                  <div key={rev.id} className="p-3.5 sm:p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-stone-800">{rev.author}</span>
                        {rev.city && <span className="text-[11px] text-stone-400">({rev.city})</span>}
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                            {t('productDetailPage.verified_purchase')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">{date(rev.date)}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {settings.product.allowReviews && <ReviewForm key={product.id} productId={product.id} />}
            </div>
          )}

          {/* Tab 4: Warranty */}
          {activeTab === 'warranty' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{warrantyText}</span>
                </h4>
                <p className="text-xs text-emerald-800">
                  {tx(settings.product.warrantyPolicy)}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-stone-800">{t('productDetailPage.return_terms')}</h5>
                <ul className="space-y-1.5 list-disc pl-5 text-xs text-stone-600">
                  {settings.product.returnTerms.map((term, i) => (
                    <li key={i}>{tx(term)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Kitchen & Gadgets Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#252525]">
              {t('productDetailPage.related_products')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
            {relatedProducts.map(relProduct => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                isWishlisted={false}
                onSelectProduct={onSelectProduct}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Purchase Bar for Conversion */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-3 flex items-center justify-between gap-2 shadow-2xl">
        <div className="min-w-0 shrink-0">
          <span className="text-[10px] sm:text-[11px] text-stone-500 block leading-none">{t('productDetailPage.special_price')}</span>
          <span className="text-sm sm:text-lg font-bold text-[#F36B0B] font-mono tabular-nums">৳{product.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-2.5 py-2.5 sm:px-4 sm:py-3 font-bold text-[11px] sm:text-xs rounded-xl cursor-pointer transition-all active:scale-95 whitespace-nowrap ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-[#252525] hover:bg-stone-800 text-white'
            }`}
          >
            {addedAnimation
              ? (t('productDetailPage.added'))
              : (t('productDetailPage.add_to_cart'))}
          </button>
          <button
            type="button"
            onClick={handleBuyNowWithGlow}
            className={`relative overflow-hidden px-3.5 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 whitespace-nowrap ${
              buyGlowActive
                ? 'bg-gradient-to-r from-[#E93825] via-[#F36B0B] to-[#ff8b2c] text-white animate-buy-glow-burst ring-4 ring-orange-400/50'
                : 'bg-gradient-to-r from-[#F36B0B] to-[#ff7e1f] text-white shadow-[0_4px_18px_rgba(243,107,11,0.5)] active:scale-95'
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-buy-shimmer"
            />
            <span className="relative z-10">
              {buyGlowActive
                ? (t('productDetailPage.opening'))
                : (t('productDetailPage.buy_now'))}
            </span>
          </button>
        </div>
      </div>

    </article>
  );
};
