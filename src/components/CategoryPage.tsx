import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  Star, 
  ArrowUpDown,
  X,
  Flame,
  ShieldCheck,
  Search,
  Check,
  ChevronDown,
  Layers,
  HelpCircle,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  Truck,
  RotateCcw,
  BadgeCheck,
  Info
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/products';

interface CategoryPageProps {
  categoryId: string;
  categoryName?: string;
  allProducts: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectCategory: (id: string) => void;
  onGoHome: () => void;
  lang: 'bn' | 'en';
}

// Subcategory showcase top row
const SUBCATEGORIES_LIST = [
  { id: 'all', name: 'সকল ইলেকট্রনিক্স', nameEn: 'All Electronics', icon: '⚡', img: '/src/assets/images/hero_ecommerce_showcase_1793335872034.jpg' },
  { id: 'kitchen-appliances', name: 'কিচেন অ্যাপ্লায়েন্স', nameEn: 'Kitchen Appliances', icon: '🍳', img: '/src/assets/images/product_smart_airfryer_1793335872086.jpg' },
  { id: 'cookware', name: 'কুকওয়্যার ও প্যান', nameEn: 'Cookware Sets', icon: '🍲', img: '/src/assets/images/kitchen_granite_cookware_1793337110405.jpg' },
  { id: 'smartwatch', name: 'স্মার্টওয়াচ', nameEn: 'Smartwatches', icon: '⌚', img: '/src/assets/images/gadget_smartwatch_tws_1793337109838.jpg' },
  { id: 'audio', name: 'অডিও ও ইয়ারবাডস', nameEn: 'Audio & Earbuds', icon: '🎧', img: '/src/assets/images/hero_ecommerce_showcase_1793335872034.jpg' },
  { id: 'power-charging', name: 'পাওয়ার ও চার্জিং', nameEn: 'Power & Charging', icon: '🔋', img: '/src/assets/images/gadget_fast_powerbank_1793337111858.jpg' },
];

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  allProducts,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  onSelectCategory,
  onGoHome,
  lang,
}) => {
  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [flashDealOnly, setFlashDealOnly] = useState<boolean>(false);
  const [warrantyOnly, setWarrantyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active Category Meta
  const currentCategory = CATEGORIES.find(c => c.id === categoryId) || {
    id: categoryId,
    name: categoryId === 'electronics-store' ? 'ইলেকট্রনিক্স ও কিচেন গ্যাজেট স্টোর' : 'কিচেন ও ইলেকট্রনিক্স স্টোর',
    nameEn: categoryId === 'electronics-store' ? 'Electronics & Kitchen Gadget Store' : 'Kitchen & Electronics Store',
    iconName: 'LayoutGrid',
    itemCount: allProducts.length,
  };

  // Base Products belonging to this category
  const categoryBaseProducts = useMemo(() => {
    if (categoryId === 'all' || categoryId === 'electronics-store') return allProducts;
    return allProducts.filter(p => {
      if (categoryId === 'kitchen-appliances') return p.category === 'kitchen-appliances';
      if (categoryId === 'cookware') return p.category === 'cookware';
      if (categoryId === 'gadgets') return p.category === 'gadgets';
      if (categoryId === 'audio') return p.category === 'audio';
      if (categoryId === 'smartwatch') return p.category === 'smartwatch';
      if (categoryId === 'power-charging') return p.category === 'power-charging';
      return p.category === categoryId;
    });
  }, [categoryId, allProducts]);

  // Available brands in this catalog
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    categoryBaseProducts.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [categoryBaseProducts]);

  // Filtered Brands for sidebar search
  const filteredAvailableBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    return availableBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [availableBrands, brandSearch]);

  // Apply All Facet Filters
  const filteredProducts = useMemo(() => {
    let result = categoryBaseProducts.filter(p => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchStock = !inStockOnly || p.inStock;
      const matchFlash = !flashDealOnly || p.isFlashDeal;
      const matchWarranty = !warrantyOnly || Boolean(p.warranty && p.warranty.length > 0);
      const matchRating = selectedRatings.length === 0 || selectedRatings.some(r => Math.floor(p.rating) >= r);
      const matchDiscount = selectedDiscounts.length === 0 || selectedDiscounts.some(d => p.discountPercent >= d);
      return matchBrand && matchPrice && matchStock && matchFlash && matchWarranty && matchRating && matchDiscount;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => b.discountPercent - a.discountPercent);
    }

    return result;
  }, [categoryBaseProducts, selectedBrands, minPrice, maxPrice, inStockOnly, flashDealOnly, warrantyOnly, selectedRatings, selectedDiscounts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleBrand = (b: string) => {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
    setCurrentPage(1);
  };

  const toggleDiscount = (d: number) => {
    setSelectedDiscounts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    setCurrentPage(1);
  };

  const toggleRating = (r: number) => {
    setSelectedRatings(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setBrandSearch('');
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setMinPrice(500);
    setMaxPrice(10000);
    setInStockOnly(false);
    setFlashDealOnly(false);
    setWarrantyOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    selectedBrands.length > 0 || 
    selectedDiscounts.length > 0 || 
    selectedRatings.length > 0 || 
    inStockOnly || 
    flashDealOnly || 
    warrantyOnly || 
    minPrice > 500 || 
    maxPrice < 10000;

  return (
    <div className="bg-white text-[#252525]">
      
      {/* 1. Breadcrumb Row */}
      <div className="border-b border-stone-200 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-stone-500 gap-1.5 flex-wrap">
            <button 
              onClick={onGoHome}
              className="hover:text-[#F36B0B] transition-colors cursor-pointer font-medium"
            >
              {lang === 'bn' ? 'হোম' : 'Home'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button 
              onClick={() => onSelectCategory('electronics-store')}
              className={`hover:text-[#F36B0B] transition-colors cursor-pointer ${
                categoryId === 'electronics-store' || categoryId === 'all' ? 'font-bold text-[#F36B0B]' : 'text-stone-500'
              }`}
            >
              {lang === 'bn' ? 'ইলেকট্রনিক্স স্টোর' : 'Electronics Store'}
            </button>
            {categoryId !== 'electronics-store' && categoryId !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[#252525] font-bold">
                  {lang === 'bn' ? currentCategory.name : currentCategory.nameEn}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-20 space-y-6">
        
        {/* 2. Category Hero Banner for Electronics Store */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#252525] via-[#353535] to-[#F36B0B] text-white p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-orange-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#F36B0B]" />
              <span>{lang === 'bn' ? 'গরম ডিল ইলেকট্রনিক্স ও কিচেন হাব' : 'Gorom Deal Electronics & Kitchen Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {lang === 'bn' ? 'ইলেকট্রনিক্স ও স্মার্ট কিচেন স্টোর' : 'Electronics & Smart Kitchen Store'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              {lang === 'bn' 
                ? 'ভিশন, আরএফএল ও প্রিমিয়াম গ্যাজেট ব্র্যান্ডের ১০০% আসল কিচেন অ্যাপ্লায়েন্স, এয়ার ফ্রায়ার, ব্লেন্ডার, স্মার্টওয়াচ ও অডিও ডিভাইস। অফিসিয়াল ওয়ারেন্টি ও সারা দেশে ক্যাশ অন ডেলিভারি।'
                : 'Explore 100% genuine kitchen appliances, air fryers, heavy duty blenders, smartwatches, and audio gadgets with official manufacturer warranty and nationwide cash on delivery.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-stone-200">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#F36B0B]" /> ১০০% অথেনটিক পণ্য</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#F36B0B]" /> সারা দেশে ক্যাশ অন ডেলিভারি</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-[#F36B0B]" /> ৭ দিনের সহজ রিটার্ন</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
            <Zap className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* 3. Subcategories Circular Row */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F36B0B]" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                {lang === 'bn' ? 'জনপ্রিয় সাব-ক্যাটাগরি সমূহ' : 'Popular Subcategories'}
              </h3>
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              {filteredProducts.length} {lang === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1">
            {SUBCATEGORIES_LIST.map((sub) => {
              const isSelected = categoryId === sub.id || (sub.id === 'all' && (categoryId === 'all' || categoryId === 'electronics-store'));
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectCategory(sub.id)}
                  className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
                  style={{ width: '96px' }}
                >
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1.5 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                    isSelected 
                      ? 'border-2 border-[#F36B0B] bg-[#FFF8F1] shadow-md ring-2 ring-[#F36B0B]/20 scale-105' 
                      : 'border border-stone-200 bg-stone-50 group-hover:border-[#F36B0B] group-hover:bg-[#FFF8F1]'
                  }`}>
                    <img
                      src={sub.img}
                      alt={sub.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className={`text-[11px] text-center line-clamp-1 leading-tight font-medium ${
                    isSelected ? 'text-[#F36B0B] font-bold' : 'text-stone-700 group-hover:text-[#F36B0B]'
                  }`}>
                    {lang === 'bn' ? sub.name : sub.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Main Catalog Section (Left Facet Filter Sidebar + Right Product Grid/List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Multi-Facet Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 text-xs">
            
            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-5 shadow-xs sticky top-20">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#F36B0B]" />
                  <span>{lang === 'bn' ? 'ফিল্টার (Filters)' : 'Filters'}</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[#E93825] hover:underline font-semibold cursor-pointer"
                  >
                    {lang === 'bn' ? 'সব মুছুন' : 'Reset All'}
                  </button>
                )}
              </div>

              {/* Facet 1: Categories Tree */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>Categories (ক্যাটাগরি)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        categoryId === cat.id 
                          ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold' 
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{lang === 'bn' ? cat.name : cat.nameEn}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({cat.itemCount})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facet 2: Price Filter (Min/Max Input + Range Slider) */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex justify-between items-center">
                  <span>Price (বাজেট রেঞ্জ)</span>
                  <span className="font-mono text-[#F36B0B] font-bold">৳{minPrice} - ৳{maxPrice}</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500">Min (৳)</span>
                    <input 
                      type="number"
                      min="500"
                      max={maxPrice - 200}
                      step="100"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(500, Number(e.target.value)))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs font-mono outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500">Max (৳)</span>
                    <input 
                      type="number"
                      min={minPrice + 200}
                      max="10000"
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(10000, Number(e.target.value)))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs font-mono outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#F36B0B] cursor-pointer"
                />
              </div>

              {/* Facet 3: Brands List with Search Box */}
              {availableBrands.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                    <span>Brand (ব্র্যান্ড)</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </h4>

                  {/* Brand quick search */}
                  <div className="relative mb-1.5">
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-stone-50 border border-stone-200 rounded-md outline-none focus:border-[#F36B0B]"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredAvailableBrands.map(b => (
                      <label key={b} className="flex items-center gap-2 text-stone-700 hover:text-stone-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="rounded accent-[#F36B0B]"
                        />
                        <span className="truncate">{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Facet 4: Discount Percentages */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>Discount (মূল্যছাড়)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1.5">
                  {[30, 25, 20].map(disc => (
                    <label key={disc} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(disc)}
                        onChange={() => toggleDiscount(disc)}
                        className="rounded accent-[#F36B0B]"
                      />
                      <span>{disc}% or more off</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facet 5: Customer Ratings */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>Rating (রেটিং)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1.5">
                  {[5, 4].map(starCount => (
                    <label key={starCount} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(starCount)}
                        onChange={() => toggleRating(starCount)}
                        className="rounded accent-[#F36B0B]"
                      />
                      <div className="flex items-center text-amber-400">
                        {[...Array(starCount)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                        <span className="text-[10px] text-stone-500 ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facet 6: Quick Toggles (Flash deals, Stock, Official Warranty) */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flashDealOnly}
                    onChange={(e) => setFlashDealOnly(e.target.checked)}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span className="font-semibold flex items-center gap-1 text-[#E93825]">
                    <Flame className="w-3.5 h-3.5 fill-[#E93825]" />
                    {lang === 'bn' ? 'গরম ডিল (Flash Deals)' : 'Flash Deals Only'}
                  </span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span>{lang === 'bn' ? 'স্টকে বিদ্যমান (In Stock)' : 'In Stock Only'}</span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warrantyOnly}
                    onChange={(e) => setWarrantyOnly(e.target.checked)}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span>{lang === 'bn' ? 'অফিসিয়াল ওয়ারেন্টি সহ' : 'Official Warranty'}</span>
                </label>
              </div>

            </div>

          </aside>

          {/* Right Main Product Section */}
          <section className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-800 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#F36B0B]" />
                <span>{lang === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#E93825]" />}
              </button>

              {/* Result Count Status */}
              <div className="text-stone-600 font-medium">
                <span>Showing </span>
                <span className="font-bold text-stone-900 font-mono">
                  {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </span>
                <span> of </span>
                <span className="font-bold text-stone-900 font-mono">{filteredProducts.length}</span>
                <span> Products</span>
              </div>

              {/* View Switcher & Sort By Dropdown */}
              <div className="flex items-center gap-3">
                {/* Grid / List View Toggle */}
                <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'grid' ? 'bg-[#F36B0B] text-white' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'list' ? 'bg-[#F36B0B] text-white' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items Per Page */}
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-stone-500">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={16}>16</option>
                  </select>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2.5 py-1">
                  <ArrowUpDown className="w-3 h-3 text-stone-400 mr-1.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent outline-none text-xs text-stone-800 font-semibold cursor-pointer"
                  >
                    <option value="featured">Featured (জনপ্রিয়)</option>
                    <option value="price-asc">Price: Low to High (কম থেকে বেশি)</option>
                    <option value="price-desc">Price: High to Low (বেশি থেকে কম)</option>
                    <option value="rating">Top Customer Rating (সেরা রেটিং)</option>
                    <option value="discount">Biggest Discount (সর্বোচ্চ ছাড়)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-stone-500 font-medium">Active:</span>
                {selectedBrands.map(b => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF8F1] border border-orange-200 text-[#F36B0B] font-semibold cursor-pointer"
                  >
                    <span>{b}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {flashDealOnly && (
                  <button
                    onClick={() => setFlashDealOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[#E93825] font-semibold cursor-pointer"
                  >
                    <span>গরম ডিল</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <span>ইন স্টক</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {warrantyOnly && (
                  <button
                    onClick={() => setWarrantyOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold cursor-pointer"
                  >
                    <span>অফিসিয়াল ওয়ারেন্টি</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-stone-400 hover:text-stone-700 underline font-medium cursor-pointer ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Listing (Strictly NO Add to Cart / Buy Now on card, clicks open PDP directly) */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-stone-50 rounded-3xl border border-stone-200/80">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Search className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-base font-bold text-stone-800">
                  {lang === 'bn' ? 'এই ফিল্টারে কোনো পণ্য মেলেনি' : 'No products matched your filters'}
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {lang === 'bn' ? 'অনুগ্রহ করে বাজেট বাড়িয়ে ফিল্টার রিসেট করে দেখুন।' : 'Try resetting your filters to explore all items.'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#F36B0B] text-white text-xs font-bold rounded-xl hover:bg-[#de5f07] transition-colors cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View (4 Columns) */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paginatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelectProduct={onSelectProduct}
                    onToggleWishlist={onToggleWishlist}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              /* List View (Detailed rows, NO buy button, click opens PDP) */
              <div className="space-y-4">
                {paginatedProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white rounded-2xl border border-stone-200 hover:border-[#F36B0B] transition-all p-4 flex flex-col sm:flex-row gap-5 group cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="w-full sm:w-48 h-48 bg-[#FFF8F1] rounded-xl flex items-center justify-center p-3 relative shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                      {product.discountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-[#E93825] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
                          <span className="font-semibold text-[#F36B0B]">{product.brand}</span>
                          <span>•</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">ইন স্টক</span>
                          {product.warranty && (
                            <>
                              <span>•</span>
                              <span className="text-stone-600 text-[10px]">{product.warranty}</span>
                            </>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-stone-900 group-hover:text-[#F36B0B] transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-[#F36B0B] font-mono">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-stone-400 line-through font-mono">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-[#F36B0B] group-hover:underline flex items-center gap-1">
                          <span>বিস্তারিত দেখুন</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 pt-6 text-xs text-stone-600">
                <div>
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 cursor-pointer font-medium"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg font-bold font-mono transition-colors cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-[#F36B0B] text-white shadow-xs'
                          : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 cursor-pointer font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </section>

        </div>

        {/* 5. Comprehensive Bottom SEO Article, Price Table & FAQ */}
        <section className="mt-16 pt-10 border-t border-stone-200 text-stone-700 space-y-8 text-xs sm:text-sm leading-relaxed w-full">
          
          <div className="space-y-3 w-full">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#252525] tracking-tight">
              {lang === 'bn' 
                ? 'বাংলাদেশে কিচেন অ্যাপ্লায়েন্স ও ইলেকট্রনিক্স গ্যাজেটস অনলাইন শপিং - Gorom Deal'
                : 'Buy Kitchen Appliances & Electronics Online in Bangladesh at Gorom Deal'}
            </h2>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base w-full">
              {lang === 'bn'
                ? 'রান্নাঘরকে আধুনিক ও সময়সাশ্রয়ী করতে মানসম্মত কিচেন অ্যাপ্লায়েন্সের কোনো বিকল্প নেই। আমাদের কালেকশনে পাবেন ভিশন (Vision) ডিজিটাল এয়ার ফ্রায়ার, ১০০০ ওয়াট পিওর কপার মোটর ব্লেন্ডার ও গ্রাইন্ডার, আরএফএল ৭-পিস মার্বেল কোটিং নন-স্টিক কুকওয়্যার সেট, দ্রুত ফুটন্ত কর্ডলেস ইলেকট্রিক কেটলি এবং ২২০০ ওয়াটের বিদ্যুৎ সাশ্রয়ী ডিজিটাল ইনডাকশন কুকার। এছাড়া তরুণ প্রজন্মের জন্য রয়েছে টাইটানিয়াম অ্যামোলেড কলিং স্মার্টওয়াচ, ৬৫ ওয়াট ফাস্ট ল্যাপটপ পাওয়ার ব্যাংক ও অ্যাক্টিভ নয়েজ ক্যানসেলিং (ANC) স্টুডিও অডিও হেডফোন। সকল পণ্যে রয়েছে অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি এবং সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।'
                : 'Shopping for authentic kitchen appliances and tech gadgets in Bangladesh is now seamless. Discover energy efficient air fryers, 1000W commercial blenders, granite cookware sets, AMOLED calling smartwatches, and fast GaN powerbanks with official warranty and reliable doorstep cash on delivery.'}
            </p>
          </div>

          {/* Price Table in BD */}
          <div className="space-y-3 w-full">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#F36B0B]" />
              <span>ইলেকট্রনিক্স ও কিচেন গ্যাজেটসের বর্তমান বাজারদর (Price List in Bangladesh 2026)</span>
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl w-full shadow-2xs bg-white">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="bg-[#FFF8F1] text-stone-900 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5 sm:p-4">পণ্যের নাম (Product Name)</th>
                    <th className="p-3.5 sm:p-4">ক্যাটাগরি</th>
                    <th className="p-3.5 sm:p-4">ব্র্যান্ড</th>
                    <th className="p-3.5 sm:p-4">ওয়ারেন্টি</th>
                    <th className="p-3.5 sm:p-4 font-mono text-right">অফার মূল্য (Price BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">ভিশন ডিজিটাল টাচ এয়ার ফ্রায়ার ও ওভেন (৫.৫ লিটার)</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">কিচেন অ্যাপ্লায়েন্স</td>
                    <td className="p-3.5 sm:p-4 font-medium">Vision Electronics</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর অফিসিয়াল</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳৪,৯৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">স্মার্ট হেভি-ডিউটি কপার ব্লেন্ডার ও গ্রাইন্ডার (১০০০ ওয়াট)</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">কিচেন অ্যাপ্লায়েন্স</td>
                    <td className="p-3.5 sm:p-4 font-medium">Vision Electronics</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">২ বছর মোটর</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳৩,৬৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">আরএফএল প্রিমিয়াম গ্রানাইট মার্বেল কুকওয়্যার সেট (৭ পিস)</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">কুকওয়্যার ও প্যান</td>
                    <td className="p-3.5 sm:p-4 font-medium">RFL Houseware</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর কোটিং</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳৪,৩৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">টাইটানিয়াম অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ প্রো</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">স্মার্ট গ্যাজেটস</td>
                    <td className="p-3.5 sm:p-4 font-medium">Vision Tech</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর রিপ্লেসমেন্ট</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳২,৮৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">৬৫ ওয়াট গ্যান আল্ট্রা-ফাস্ট ২০,০০০ এমএএইচ ল্যাপটপ পাওয়ার ব্যাংক</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">পাওয়ার ও চার্জিং</td>
                    <td className="p-3.5 sm:p-4 font-medium">Nexus Tech</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর সার্ভিস</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳২,৯৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">ওয়্যারলেস এক্টিভ নয়েজ ক্যানসেলিং স্টুডিও হেডফোন প্রো ম্যাক্স</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">অডিও ও হেডফোন</td>
                    <td className="p-3.5 sm:p-4 font-medium">Acoustic Sound</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">৬ মাস রিপ্লেসমেন্ট</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳৩,৪৫০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">ভিশন কর্ডলেস স্টেইনলেস স্টিল র‍্যাপিড ইলেকট্রিক কেটলি (১.৮ লিটার)</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">কিচেন অ্যাপ্লায়েন্স</td>
                    <td className="p-3.5 sm:p-4 font-medium">Vision Electronics</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর সার্ভিস</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳১,৩৯০</td>
                  </tr>
                  <tr className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-stone-900">স্মার্ট ডিজিটাল টাচ ইনডাকশন কুকার (২২০০ ওয়াট)</td>
                    <td className="p-3.5 sm:p-4 text-stone-500">কিচেন অ্যাপ্লায়েন্স</td>
                    <td className="p-3.5 sm:p-4 font-medium">Vision Electronics</td>
                    <td className="p-3.5 sm:p-4 text-stone-600">১ বছর সার্ভিস</td>
                    <td className="p-3.5 sm:p-4 font-mono text-right font-bold text-[#F36B0B]">৳৩,৪৫০</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Value Propositions / Why buy from Gorom Deal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
              <h3 className="font-bold text-stone-900 text-sm">
                কেন গরম ডিলে কিচেন ও গ্যাজেটস কিনবেন?
              </h3>
              <ul className="space-y-2 text-stone-600 list-disc pl-4">
                <li><strong>১০০% আসল ব্র্যান্ড পণ্য:</strong> সরাসরি প্রাণ-আরএফএল ও অনুমোদিত অফিশিয়াল ডিস্ট্রিবিউটর থেকে সংগৃহীত।</li>
                <li><strong>ক্যাশ অন ডেলিভারি (COD):</strong> পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধের সুবিধা।</li>
                <li><strong>দ্রুততম ডেলিভারি:</strong> ঢাকা সিটির ভিতরে ২৪-৪৮ ঘণ্টা এবং জেলা সদরে ২-৩ দিনের মধ্যে হোম ডেলিভারি।</li>
                <li><strong>সহজ ওয়ারেন্টি সাপোর্ট:</strong> যে কোনো সমস্যায় আমাদের হটলাইনে যোগাযোগ করে ঝামেলামুক্ত সার্ভিস।</li>
              </ul>
            </div>

            <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
              <h3 className="font-bold text-stone-900 text-sm">
                কিচেন আইটেম ও গ্যাজেট কেনার আগে যা খেয়াল রাখবেন
              </h3>
              <ul className="space-y-2 text-stone-600 list-disc pl-4">
                <li><strong>মোটরের পাওয়ার ও উপাদান:</strong> ব্লেন্ডার কেনার সময় ১০০% পিওর কপার ওয়াইন্ডিং মোটর ও ওয়াটেজ যাচাই করুন।</li>
                <li><strong>নন-স্টিক মেটেরিয়াল:</strong> কুকওয়্যারের কোটিং যেন PFOA ও ক্যাডমিয়াম মুক্ত এবং ফুড-গ্রেড মার্বেল কোটিং হয়।</li>
                <li><strong>অটো কাট-অফ সেফটি:</strong> কেটলি ও ইনডাকশন কুকারে ওভারহিট প্রোটেকশন ফিচার নিশ্চিত করুন।</li>
              </ul>
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ Accordion) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#F36B0B]" />
              <span>সাধারণ জিজ্ঞাসা (FAQ - Frequently Asked Questions)</span>
            </h3>
            
            <div className="space-y-2">
              {[
                {
                  q: 'পণ্য হাতে পেয়ে কি দেখে নেওয়া যাবে?',
                  a: 'হ্যাঁ, আমাদের ক্যাশ অন ডেলিভারি সার্ভিসে ডেলিভারি পার্সনের সামনে পার্সেলটি খুলে মূল পণ্য সঠিক আছে কিনা যাচাই করে নিতে পারবেন।'
                },
                {
                  q: 'ডেলিভারি চার্জ কত এবং কতদিন সময় লাগে?',
                  a: 'ঢাকা সিটির ভেতরে ডেলিভারি চার্জ মাত্র ৬০ টাকা (২৪-৪৮ ঘণ্টা)। ঢাকার বাইরে সারা বাংলাদেশে ডেলিভারি চার্জ ১২০ টাকা (২-৩ কার্যদিবস)।'
                },
                {
                  q: 'ওয়ারেন্টি দাবি করতে হলে কি করতে হবে?',
                  a: 'পণ্যের সাথে থাকা অফিশিয়াল ওয়ারেন্টি কার্ড এবং চালানের কপি সংরক্ষণ করুন। প্রয়োজনে আমাদের হটলাইন (09613-737726) এ কল দিলে প্রতিনিধি সমাধান করে দেবেন।'
                },
                {
                  q: 'পণ্য ত্রুটিপূর্ণ হলে পরিবর্তন (Replacement) করার নিয়ম কি?',
                  a: 'পণ্য পাওয়ার পর কোনো প্রকার টেকনিক্যাল বা ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে আমাদের জানালে সম্পূর্ণ ফ্রিতে পরিবর্তন করে দেওয়া হবে।'
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-stone-800 flex items-center justify-between hover:bg-stone-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-3.5 pt-0 text-stone-600 bg-stone-50/50 border-t border-stone-100 text-xs">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div onClick={() => setMobileFilterOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-12">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-bold text-base text-[#252525] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#F36B0B]" />
                  <span>Filters</span>
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 text-xs custom-scrollbar">
                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider">Categories</h4>
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { onSelectCategory(cat.id); setMobileFilterOpen(false); }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex justify-between cursor-pointer ${
                          categoryId === cat.id ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold' : 'text-stone-600'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="font-mono">({cat.itemCount})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex justify-between font-bold">
                    <span>Budget:</span>
                    <span className="text-[#F36B0B] font-mono">৳{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#F36B0B]"
                  />
                </div>

                {/* Brands */}
                {availableBrands.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider">Brands</h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {availableBrands.map(b => (
                        <label key={b} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b)}
                            onChange={() => toggleBrand(b)}
                            className="rounded accent-[#F36B0B]"
                          />
                          <span>{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#F36B0B] text-white font-bold rounded-xl cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
