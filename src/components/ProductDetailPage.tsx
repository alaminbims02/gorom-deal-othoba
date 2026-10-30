import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight, 
  ArrowLeft, 
  Zap, 
  Check, 
  Phone, 
  MapPin, 
  Share2, 
  HelpCircle,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { Product } from '../types';
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
  lang: 'bn' | 'en';
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
  lang,
}) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0] || product.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'warranty'>('desc');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize variants
  useEffect(() => {
    setSelectedImage(product.images[0] || product.image);
    setQuantity(1);
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
    .slice(0, 4);

  const selectedVariantString = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariantString);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-stone-500 mb-6 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            onClick={onBack}
            className="hover:text-[#F36B0B] transition-colors cursor-pointer font-medium"
          >
            {lang === 'bn' ? 'হোম' : 'Home'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-700 font-medium">
            {lang === 'bn' ? product.categoryNameBn : product.categoryNameEn}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#252525] font-semibold truncate max-w-[200px] sm:max-w-md">
            {lang === 'bn' ? product.name : product.nameEn}
          </span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FFF8F1] hover:text-[#F36B0B] text-stone-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সকল পণ্যে ফিরুন' : 'Back to Catalog'}</span>
        </button>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Visual Gallery & Trust Seals */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Big Featured Image Stage */}
          <div className="relative aspect-square bg-[#FBFBFB] rounded-3xl border border-stone-200/90 overflow-hidden p-6 flex items-center justify-center group shadow-xs">
            <img
              src={selectedImage}
              alt={lang === 'bn' ? product.name : product.nameEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            />

            {/* Discount Badge */}
            {product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-[#E93825] text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                -{product.discountPercent}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-sm ${
                isWishlisted
                  ? 'bg-[#E93825] text-white'
                  : 'bg-white/95 text-stone-600 hover:text-[#E93825] border border-stone-200'
              }`}
              title={isWishlisted ? 'উইশলিস্ট থেকে মুছুন' : 'উইশলিস্টে যোগ করুন'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Interactive Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden p-1 bg-stone-50 border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImage === imgUrl
                      ? 'border-[#F36B0B] ring-2 ring-[#F36B0B]/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Value Badges under Image */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-center text-xs">
            <div className="p-3 bg-[#FFF8F1] rounded-2xl border border-orange-100 flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-[#F36B0B]" />
              <span className="font-bold text-[#252525]">{lang === 'bn' ? '১০০% অরিজিনাল' : '100% Genuine'}</span>
              <span className="text-[10px] text-stone-500">{product.brand}</span>
            </div>
            <div className="p-3 bg-[#FFF8F1] rounded-2xl border border-orange-100 flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-[#F36B0B]" />
              <span className="font-bold text-[#252525]">{lang === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</span>
              <span className="text-[10px] text-stone-500">{lang === 'bn' ? '২৪-৪৮ ঘণ্টা' : '24-48 Hours'}</span>
            </div>
            <div className="p-3 bg-[#FFF8F1] rounded-2xl border border-orange-100 flex flex-col items-center gap-1">
              <RotateCcw className="w-5 h-5 text-[#F36B0B]" />
              <span className="font-bold text-[#252525]">{lang === 'bn' ? '৭ দিনের রিটার্ন' : 'Easy Returns'}</span>
              <span className="text-[10px] text-stone-500">{lang === 'bn' ? 'রিপ্লেসমেন্ট' : 'Replacement'}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-bold text-[#F36B0B] uppercase tracking-wider">{product.brand}</span>
              <span className="font-mono text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#252525] tracking-tight leading-snug">
              {lang === 'bn' ? product.name : product.nameEn}
            </h1>

            {/* Ratings, Reviews, and Stock */}
            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-900 tabular-nums">{product.rating}</span>
              </div>
              <button 
                onClick={() => setActiveTab('reviews')}
                className="text-stone-600 hover:text-[#F36B0B] underline font-medium cursor-pointer"
              >
                {product.reviewCount} {lang === 'bn' ? 'টি ভেরিফাইড রিভিউ' : 'Customer Reviews'}
              </button>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                ✓ {lang === 'bn' ? 'স্টকে আছে' : 'In Stock'} ({product.stockCount} {lang === 'bn' ? 'টি অবশিষ্ট' : 'units'})
              </span>
            </div>
          </div>

          {/* Pricing Module */}
          <div className="p-4 sm:p-5 bg-[#FFF8F1] rounded-2xl border border-orange-200/80 space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#252525] font-mono tabular-nums">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-stone-400 line-through font-mono tabular-nums">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs font-bold text-[#E93825] bg-[#E93825]/10 px-2 py-1 rounded">
                {lang === 'bn' ? 'সাশ্রয় ৳' : 'Save ৳'}
                {(product.originalPrice - product.price).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {lang === 'bn' ? '✓ ভ্যাট অন্তর্ভুক্ত · ক্যাশ অন ডেলিভারি প্রযোজ্য' : '✓ VAT included · Cash on Delivery available'}
            </p>
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
            <span className="text-xs font-bold text-stone-700">{lang === 'bn' ? 'পরিমাণ:' : 'Quantity:'}</span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-stone-900 tabular-nums font-mono">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buy Now / Order Now */}
              <button
                onClick={() => onBuyNow(product, quantity, selectedVariantString)}
                className="w-full py-4 px-6 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>{lang === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}</span>
              </button>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#252525] hover:bg-stone-800 text-white shadow-md'
                }`}
              >
                {addedAnimation ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                <span>
                  {addedAnimation 
                    ? (lang === 'bn' ? 'কার্টে যুক্ত হয়েছে!' : 'Added to Cart!') 
                    : (lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart')}
                </span>
              </button>
            </div>

            {/* Quick Share Link */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-[#F36B0B]" />
                <span>{lang === 'bn' ? 'আজ অর্ডার করলে আগামীকালের মধ্যে শিপিং' : 'Ships within 24 hours'}</span>
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-stone-600 hover:text-[#F36B0B] font-medium cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? (lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link copied!') : (lang === 'bn' ? 'শেয়ার করুন' : 'Share')}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Warranty Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#F36B0B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">{lang === 'bn' ? 'ডেলিভারি সংক্রান্ত তথ্য' : 'Delivery Information'}</p>
                <p className="text-stone-500 leading-relaxed">
                  {lang === 'bn' 
                    ? 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা (৳৬০), ঢাকার বাইরে ২-৩ দিন (৳১২০)। ২৫০০+ টাকার অর্ডারে ফ্রি ডেলিভারি!' 
                    : 'Inside Dhaka: 24-48 hrs (৳60), Outside Dhaka: 2-3 days (৳120). Free delivery over ৳2,500!'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-800">{lang === 'bn' ? 'ওয়ারেন্টি ও গ্যারান্টি' : 'Warranty & Guarantee'}</p>
                <p className="text-stone-500 leading-relaxed">
                  {product.warranty}। {lang === 'bn' ? 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা।' : 'Check parcel at doorstep upon delivery.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-stone-200 text-stone-700">
              <Phone className="w-4 h-4 text-[#F36B0B] shrink-0" />
              <span>{lang === 'bn' ? 'সরাসরি ফোনে অর্ডার করতে কল করুন:' : 'Order by phone:'} <a href="tel:09613737726" className="font-bold text-[#F36B0B]">09613-737726</a></span>
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
            {lang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            {lang === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#F36B0B] text-[#F36B0B]'
                : 'border-transparent text-stone-600 hover:text-[#252525]'
            }`}
          >
            <span>{lang === 'bn' ? 'কাস্টমার রিভিউ' : 'Reviews'}</span>
            <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
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
            {lang === 'bn' ? 'ওয়ারেন্টি ও পলিসি' : 'Warranty & Returns'}
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
                  {lang === 'bn' ? 'মূল সুবিধাসমূহ ও বৈশিষ্ট্য:' : 'Key Features & Benefits:'}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {product.features.map((feat, i) => (
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
            <div className="max-w-3xl overflow-hidden rounded-2xl border border-stone-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <tr 
                      key={key} 
                      className={idx % 2 === 0 ? 'bg-stone-50' : 'bg-white'}
                    >
                      <th className="py-3 px-4 font-semibold text-stone-700 border-b border-stone-200 w-1/3">
                        {key}
                      </th>
                      <td className="py-3 px-4 text-stone-800 border-b border-stone-200 font-mono">
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
              <div className="flex items-center gap-6 p-4 sm:p-6 bg-[#FFF8F1] rounded-2xl border border-orange-100">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#F36B0B] font-mono">
                    {product.rating}
                  </div>
                  <div className="flex text-amber-500 justify-center my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">{product.reviewCount} {lang === 'bn' ? 'টি মূল্যায়ন' : 'ratings'}</p>
                </div>

                <div className="flex-1 text-xs text-stone-600 pl-4 border-l border-orange-200/80">
                  <p className="font-bold text-stone-800 text-sm mb-1">
                    {lang === 'bn' ? '১০০% ভেরিফাইড ক্রেতার রিভিউ' : '100% Verified Buyer Reviews'}
                  </p>
                  <p className="text-stone-500">
                    {lang === 'bn' 
                      ? 'সকল রিভিউ আসল গ্রাহকদের দ্বারা পণ্য ডেলিভারি নেওয়ার পর প্রদত্ত।' 
                      : 'All reviews are submitted by authentic buyers following verified delivery.'}
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-800">{rev.author}</span>
                        {rev.city && <span className="text-[11px] text-stone-400">({rev.city})</span>}
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                            ✓ ভেরিফাইড পারচেজ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
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
            </div>
          )}

          {/* Tab 4: Warranty */}
          {activeTab === 'warranty' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{product.warranty}</span>
                </h4>
                <p className="text-xs text-emerald-800">
                  {lang === 'bn' 
                    ? 'আমাদের প্রতিটি গ্যাজেট ও কিচেন আইটেমে রয়েছে অফিসিয়াল ব্র্যান্ডের সরাসরি সার্ভিস কিংবা রিপ্লেসমেন্ট সুবিধা। কোনো ত্রুটি পরিলক্ষিত হলে ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট প্রদান করা হয়।' 
                    : 'Each kitchen appliance and gadget comes with official manufacturer replacement warranty.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-stone-800">{lang === 'bn' ? 'রিটার্ন পলিসির শর্তাবলী:' : 'Return Terms:'}</h5>
                <ul className="space-y-1.5 list-disc pl-5 text-xs text-stone-600">
                  <li>পণ্যটি অব্যবহৃত এবং মূল বক্স ও অ্যাক্সেসরিজ সহ ফেরত দিতে হবে।</li>
                  <li>ডেলিভারি ম্যানের উপস্থিতিতে পণ্য যাচাই করে রিসিভ করার সুবিধা রয়েছে।</li>
                  <li>যেকোনো অভিযোগের জন্য ডেলিভারির ২৪ ঘণ্টার মধ্যে কাস্টমার কেয়ারে কল করুন।</li>
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
              {lang === 'bn' ? 'আপনার আরও পছন্দ হতে পারে' : 'Related Products'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(relProduct => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                isWishlisted={false}
                onSelectProduct={onSelectProduct}
                onToggleWishlist={onToggleWishlist}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Purchase Bar for Conversion */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 px-4 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[11px] text-stone-500 block">{lang === 'bn' ? 'অফার মূল্য' : 'Special Price'}</span>
          <span className="text-lg font-bold text-[#F36B0B] font-mono">৳{product.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl cursor-pointer"
            title="কার্টে যোগ করুন"
          >
            <ShoppingCart className="w-5 h-5 text-stone-800" />
          </button>
          <button
            onClick={() => onBuyNow(product, quantity, selectedVariantString)}
            className="px-6 py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{lang === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}</span>
          </button>
        </div>
      </div>

    </article>
  );
};
