import React, { useState, useMemo, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import {
  ChevronRight,
  SlidersHorizontal,
  Star,
  ArrowUpDown,
  X,
  Flame,
  ShieldCheck,
  Search,
  ChevronDown,
  Layers,
  HelpCircle,
  LayoutGrid,
  List,
  Truck,
  RotateCcw,
  BadgeCheck,
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { DynamicIcon } from './DynamicIcon';

interface CategoryPageProps {
  categoryId: string;
  categoryName?: string;
  allProducts: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectCategory: (id: string) => void;
  onGoHome: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  allProducts,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  onSelectCategory,
  onGoHome,
}) => {
  const { lang, t, tx, settings, faqs, categoryList: CATEGORIES } = useSite();
  const catalog = settings.catalog;

  // Price bounds come from WordPress but always widen to fit real product prices.
  const prices = allProducts.map((p) => p.price);
  const step = 100;
  const PMIN = Math.max(0, Math.min(catalog.priceMin, prices.length ? Math.floor(Math.min(...prices) / step) * step : catalog.priceMin));
  const PMAX = Math.max(catalog.priceMax, prices.length ? Math.ceil(Math.max(...prices) / step) * step : catalog.priceMax);

  const SUBCATEGORIES_LIST = CATEGORIES.map((c) =>
    c.id === 'all' ? { ...c, name: catalog.allCategoryStripLabel.bn, nameEn: catalog.allCategoryStripLabel.en } : c,
  );
  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(PMIN);
  const [maxPrice, setMaxPrice] = useState<number>(PMAX);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [flashDealOnly, setFlashDealOnly] = useState<boolean>(false);
  const [warrantyOnly, setWarrantyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(catalog.perPageOptions[0] || 8);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Reset pagination when category switches
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  // Active Category Meta
  const currentCategory = CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    name: categoryId === 'electronics-store' ? catalog.storeCategoryLabel.bn : catalog.allCategoryLabel.bn,
    nameEn: categoryId === 'electronics-store' ? catalog.storeCategoryLabel.en : catalog.allCategoryLabel.en,
    image: '',
    iconName: 'LayoutGrid',
    itemCount: allProducts.length,
  };

  // Base Products belonging to this category
  const categoryBaseProducts = useMemo(() => {
    if (categoryId === 'all' || categoryId === 'electronics-store') return allProducts;
    return allProducts.filter((p) => p.category === categoryId);
  }, [categoryId, allProducts]);

  // Available brands in this catalog
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    categoryBaseProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [categoryBaseProducts]);

  // Filtered Brands for sidebar search
  const filteredAvailableBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    return availableBrands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [availableBrands, brandSearch]);

  // Apply All Facet Filters
  const filteredProducts = useMemo(() => {
    const result = categoryBaseProducts.filter((p) => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchStock = !inStockOnly || p.inStock;
      const matchFlash = !flashDealOnly || p.isFlashDeal;
      const matchWarranty = !warrantyOnly || Boolean(p.warranty && p.warranty.length > 0);
      const matchRating = selectedRatings.length === 0 || selectedRatings.some((r) => Math.floor(p.rating) >= r);
      const matchDiscount = selectedDiscounts.length === 0 || selectedDiscounts.some((d) => p.discountPercent >= d);
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
  }, [
    categoryBaseProducts,
    selectedBrands,
    minPrice,
    maxPrice,
    inStockOnly,
    flashDealOnly,
    warrantyOnly,
    selectedRatings,
    selectedDiscounts,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
    setCurrentPage(1);
  };

  const toggleDiscount = (d: number) => {
    setSelectedDiscounts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
    setCurrentPage(1);
  };

  const toggleRating = (r: number) => {
    setSelectedRatings((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setBrandSearch('');
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setMinPrice(PMIN);
    setMaxPrice(PMAX);
    setInStockOnly(false);
    setFlashDealOnly(false);
    setWarrantyOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedDiscounts.length +
    selectedRatings.length +
    (inStockOnly ? 1 : 0) +
    (flashDealOnly ? 1 : 0) +
    (warrantyOnly ? 1 : 0) +
    (minPrice > PMIN || maxPrice < PMAX ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Price guide table rows are generated from the live product catalog.
  const priceTableItems = categoryBaseProducts.map((p) => ({
    id: p.id,
    name: lang === 'bn' ? p.name : p.nameEn,
    category: lang === 'bn' ? p.categoryNameBn : p.categoryNameEn,
    brand: p.brand,
    warranty: (lang === 'en' && p.warrantyEn) || p.warranty,
    price: `৳${p.price.toLocaleString()}`,
  }));
  const quickDiscount = catalog.discountOptions[catalog.discountOptions.length - 1] || 20;

  return (
    <div className="bg-white text-[#252525] overflow-x-hidden">
      {/* 1. Breadcrumb Row */}
      <div className="border-b border-stone-200 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <nav aria-label="Breadcrumb" className="flex items-center text-[11px] sm:text-xs text-stone-500 gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={onGoHome}
              className="hover:text-[#F36B0B] transition-colors cursor-pointer font-medium shrink-0"
            >
              {t('app.home')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <button
              onClick={() => onSelectCategory('electronics-store')}
              className={`hover:text-[#F36B0B] transition-colors cursor-pointer shrink-0 ${
                categoryId === 'electronics-store' || categoryId === 'all' ? 'font-bold text-[#F36B0B]' : 'text-stone-500'
              }`}
            >
              {t('categoryPage.catalog')}
            </button>
            {categoryId !== 'electronics-store' && categoryId !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="text-[#252525] font-bold truncate">
                  {lang === 'bn' ? currentCategory.name : currentCategory.nameEn}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-24 sm:pb-14 space-y-4 sm:space-y-6">
        {/* 2. Category Hero Banner (Compact on mobile so products appear fast) */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-[#252525] via-[#323232] to-[#b54800] text-white p-3.5 sm:p-7 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-2.5">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-300">
              <span className="w-4 h-0.5 bg-[#F36B0B]" aria-hidden="true" />
              <span>{tx(catalog.kicker)}</span>
            </div>
            <h1 className="text-lg sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {categoryId === 'all' || categoryId === 'electronics-store'
                ? tx(catalog.storeTitle)
                : lang === 'bn'
                ? currentCategory.name
                : currentCategory.nameEn}
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              {tx(currentCategory.description) || tx(catalog.storeDescription)}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 sm:pt-1.5 text-[10px] sm:text-[11px] text-stone-200">
              {catalog.heroBadges.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  <DynamicIcon name={b.icon} className="w-3.5 h-3.5 text-[#F36B0B] shrink-0" />
                  <span>{tx(b.label)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Subcategories Horizontal Strip */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 p-2.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-stone-100 mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F36B0B]" />
              <h2 className="text-xs sm:text-sm font-bold text-stone-900">
                {t('categoryPage.browse_categories')}
              </h2>
            </div>
            <span className="text-[11px] text-stone-500 tabular-nums">
              {filteredProducts.length} {t('categoryPage.items')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {SUBCATEGORIES_LIST.map((sub) => {
              const isSelected =
                categoryId === sub.id ||
                (sub.id === 'all' && (categoryId === 'all' || categoryId === 'electronics-store'));
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectCategory(sub.id)}
                  className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0 group cursor-pointer focus:outline-none w-[72px] sm:w-[92px]"
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-[#F36B0B] ring-2 ring-[#F36B0B]/20 scale-105'
                        : 'border border-stone-200 group-hover:border-[#F36B0B]'
                    }`}
                  >
                    <img
                      src={sub.image}
                      alt={lang === 'bn' ? sub.name : sub.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] text-center line-clamp-1 leading-tight font-medium w-full ${
                      isSelected ? 'text-[#F36B0B] font-bold' : 'text-stone-700 group-hover:text-[#F36B0B]'
                    }`}
                  >
                    {lang === 'bn' ? sub.name : sub.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Main Catalog Section (Left Facet Filter Sidebar + Right Product Grid/List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Multi-Facet Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 text-xs">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-5 shadow-xs sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#F36B0B]" />
                  <span>{t('categoryPage.filters')}</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[#E93825] hover:underline font-semibold cursor-pointer"
                  >
                    {t('categoryPage.reset_all')}
                  </button>
                )}
              </div>

              {/* Facet 1: Categories Tree */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>{t('categoryPage.categories')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
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
                      <span className="text-[10px] text-stone-400">({cat.itemCount})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facet 2: Price Filter */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex justify-between items-center">
                  <span>{t('categoryPage.price_range')}</span>
                  <span className="font-mono text-[#F36B0B] font-bold">
                    ৳{minPrice} - ৳{maxPrice}
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500">Min (৳)</span>
                    <input
                      type="number"
                      min={PMIN}
                      max={maxPrice - 200}
                      step="100"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(PMIN, Number(e.target.value)))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs font-mono outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500">Max (৳)</span>
                    <input
                      type="number"
                      min={minPrice + 200}
                      max={PMAX}
                      step="100"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(PMAX, Number(e.target.value)))}
                      className="w-full px-2 py-1 border border-stone-200 rounded-md text-xs font-mono outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={PMIN}
                  max={PMAX}
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#F36B0B] cursor-pointer"
                />
              </div>

              {/* Facet 3: Brands */}
              {availableBrands.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                    <span>{t('categoryPage.brand')}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </h4>

                  <div className="relative mb-1.5">
                    <input
                      type="text"
                      placeholder={t('categoryPage.search_brands')}
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full px-2.5 py-1 text-[11px] bg-stone-50 border border-stone-200 rounded-md outline-none focus:border-[#F36B0B]"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {filteredAvailableBrands.map((b) => (
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

              {/* Facet 4: Discount */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>{t('categoryPage.discount')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1.5">
                  {catalog.discountOptions.map((disc) => (
                    <label key={disc} className="flex items-center gap-2 text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(disc)}
                        onChange={() => toggleDiscount(disc)}
                        className="rounded accent-[#F36B0B]"
                      />
                      <span>{t('categoryPage.or_more_off', [disc])}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facet 5: Rating */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100 flex justify-between items-center">
                  <span>{t('categoryPage.rating')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </h4>
                <div className="space-y-1.5">
                  {[5, 4].map((starCount) => (
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
                        <span className="text-[10px] text-stone-500 ml-1">{t('categoryPage.and_up')}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facet 6: Quick Toggles */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flashDealOnly}
                    onChange={(e) => { setFlashDealOnly(e.target.checked); setCurrentPage(1); }}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span className="font-semibold flex items-center gap-1 text-[#E93825]">
                    <Flame className="w-3.5 h-3.5 fill-[#E93825]" />
                    {t('categoryPage.flash_deals_only')}
                  </span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span>{t('categoryPage.in_stock_only')}</span>
                </label>

                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warrantyOnly}
                    onChange={(e) => { setWarrantyOnly(e.target.checked); setCurrentPage(1); }}
                    className="rounded accent-[#F36B0B]"
                  />
                  <span>{t('categoryPage.official_warranty')}</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Main Product Section */}
          <section className="lg:col-span-9 min-w-0 space-y-3.5 sm:space-y-5">
            {/* Responsive Filter & Sort Toolbar */}
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-2.5 sm:p-3.5 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3 text-xs">
              {/* Row 1 on Mobile: Filter Button + Sort Dropdown + Grid/List Toggle */}
              <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:order-2">
                {/* Mobile Filter Drawer Trigger */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-stone-300 rounded-lg font-bold text-stone-800 shadow-2xs cursor-pointer shrink-0 min-h-[38px]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#F36B0B]" />
                  <span>{t('categoryPage.filters_2')}</span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#F36B0B] text-white text-[10px] font-bold rounded-full leading-tight">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end min-w-0">
                  {/* Items Per Page (Desktop/Tablet) */}
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-stone-500">{t('categoryPage.show')}</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer"
                    >
                      {catalog.perPageOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 flex-1 sm:flex-initial min-w-0 max-w-[200px] sm:max-w-none min-h-[38px]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount')}
                      aria-label={t('categoryPage.sort_products')}
                      className="bg-transparent outline-none text-xs text-stone-800 font-semibold cursor-pointer w-full truncate"
                    >
                      <option value="featured">{t('categoryPage.sort_featured')}</option>
                      <option value="price-asc">{t('categoryPage.price_low_to_high')}</option>
                      <option value="price-desc">{t('categoryPage.price_high_to_low')}</option>
                      <option value="rating">{t('categoryPage.top_rated')}</option>
                      <option value="discount">{t('categoryPage.best_discount')}</option>
                    </select>
                  </div>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 shrink-0 min-h-[38px]">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        viewMode === 'grid' ? 'bg-[#F36B0B] text-white' : 'text-stone-500 hover:text-stone-800'
                      }`}
                      title="Grid View"
                      aria-label="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        viewMode === 'list' ? 'bg-[#F36B0B] text-white' : 'text-stone-500 hover:text-stone-800'
                      }`}
                      title="List View"
                      aria-label="List View"
                    >
                      <List className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Count Status */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-600 font-medium sm:order-1 pt-1 sm:pt-0 border-t border-stone-200/70 sm:border-t-0">
                <div>
                  {t('categoryPage.showing')}
                  <span className="font-bold text-stone-900 tabular-nums">
                    {filteredProducts.length > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}-
                    {Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length)}
                  </span>
                  {t('categoryPage.of')}
                  <span className="font-bold text-stone-900 tabular-nums">{filteredProducts.length}</span>
                  {t('categoryPage.products')}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="sm:hidden text-[11px] font-semibold text-[#E93825] underline cursor-pointer"
                  >
                    {t('categoryPage.reset')}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Quick-Filter Strip (1-tap horizontal filters for thumb ergonomics) */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                onClick={() => { setFlashDealOnly(!flashDealOnly); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                  flashDealOnly
                    ? 'bg-[#FFF8F1] border-[#F36B0B] text-[#E93825]'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#E93825]" />
                <span>{t('categoryPage.flash_deals')}</span>
              </button>

              <button
                onClick={() => { setInStockOnly(!inStockOnly); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  inStockOnly
                    ? 'bg-[#FFF8F1] border-[#F36B0B] text-[#F36B0B] font-semibold'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                {t('categoryPage.in_stock')}
              </button>

              <button
                onClick={() => { setWarrantyOnly(!warrantyOnly); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  warrantyOnly
                    ? 'bg-[#FFF8F1] border-[#F36B0B] text-[#F36B0B] font-semibold'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                {t('categoryPage.warranty')}
              </button>

              <button
                onClick={() => toggleDiscount(quickDiscount)}
                className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedDiscounts.includes(quickDiscount)
                    ? 'bg-[#FFF8F1] border-[#F36B0B] text-[#F36B0B] font-semibold'
                    : 'bg-white border-stone-200 text-stone-700'
                }`}
              >
                {t('categoryPage.chip_discount', [quickDiscount])}
              </button>
            </div>

            {/* Active Filter Removal Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <span className="text-stone-500 font-medium">{t('categoryPage.active')}</span>
                {selectedBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8F1] border border-orange-200 text-[#F36B0B] font-semibold cursor-pointer"
                  >
                    <span>{b}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedDiscounts.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDiscount(d)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8F1] border border-orange-200 text-[#F36B0B] font-semibold cursor-pointer"
                  >
                    <span>{d}%+ ছাড়</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedRatings.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleRating(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold cursor-pointer"
                  >
                    <span>{r}★+</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {(minPrice > PMIN || maxPrice < PMAX) && (
                  <button
                    onClick={() => { setMinPrice(PMIN); setMaxPrice(PMAX); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 font-semibold cursor-pointer font-mono"
                  >
                    <span>৳{minPrice}-৳{maxPrice}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {flashDealOnly && (
                  <button
                    onClick={() => setFlashDealOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-[#E93825] font-semibold cursor-pointer"
                  >
                    <span>{t('categoryPage.chip_flash')}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {inStockOnly && (
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <span>{t('categoryPage.chip_in_stock')}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {warrantyOnly && (
                  <button
                    onClick={() => setWarrantyOnly(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold cursor-pointer"
                  >
                    <span>{t('categoryPage.chip_warranty')}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer ml-1"
                >
                  {t('categoryPage.clear_all')}
                </button>
              </div>
            )}

            {/* Product Listing */}
            {filteredProducts.length === 0 ? (
              <div className="py-14 sm:py-20 px-4 text-center space-y-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Search className="w-7 h-7 sm:w-8 sm:h-8 opacity-60" />
                </div>
                <p className="text-sm sm:text-base font-bold text-stone-800">
                  {t('categoryPage.no_products_matched_your_filters')}
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {t('categoryPage.try_resetting_your_filters_to_explore')}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#F36B0B] text-white text-xs font-bold rounded-xl hover:bg-[#de5f07] transition-colors cursor-pointer"
                >
                  {t('categoryPage.reset_filters')}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View (2 Cols Mobile, 4 Cols Desktop) */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelectProduct={onSelectProduct}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            ) : (
              /* List View (Compact horizontal row on mobile, rich row on desktop) */
              <div className="space-y-3 sm:space-y-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 hover:border-[#F36B0B] transition-all p-2.5 sm:p-4 flex flex-row gap-3 sm:gap-5 group cursor-pointer shadow-xs hover:shadow-md items-stretch"
                  >
                    <div className="w-24 h-24 sm:w-44 sm:h-44 aspect-square bg-[#FBFBFB] rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden relative shrink-0 self-center sm:self-auto">
                      <img
                        src={product.image}
                        alt={lang === 'bn' ? product.name : product.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform"
                      />
                      {product.discountPercent > 0 && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#E93825] text-white text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5 sm:space-y-2">
                      <div>
                        <div className="flex items-center flex-wrap gap-1.5 text-stone-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                          <span className="font-semibold text-[#F36B0B] truncate">{product.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium">{t('categoryPage.in_stock_2')}</span>
                          {product.warranty && (
                            <span className="hidden sm:inline text-stone-500">· {(lang === 'en' && product.warrantyEn) || product.warranty}</span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-base font-bold text-stone-900 group-hover:text-[#F36B0B] transition-colors line-clamp-2 leading-snug">
                          {lang === 'bn' ? product.name : product.nameEn}
                        </h4>
                        <p className="hidden sm:block text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {lang === 'bn' ? product.description : product.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-sm sm:text-xl font-extrabold text-[#F36B0B] font-mono tabular-nums">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] sm:text-xs text-stone-400 line-through font-mono tabular-nums">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] sm:text-xs font-semibold text-[#F36B0B] group-hover:underline flex items-center gap-0.5 shrink-0">
                          <span>{t('categoryPage.details')}</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 pt-5 text-xs text-stone-600">
                <div className="tabular-nums">
                  {t('categoryPage.page_of', [safeCurrentPage, totalPages])}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 cursor-pointer font-medium min-h-[38px]"
                  >
                    {t('categoryPage.prev')}
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                        safeCurrentPage === i + 1
                          ? 'bg-[#F36B0B] text-white shadow-xs'
                          : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-40 cursor-pointer font-medium min-h-[38px]"
                  >
                    {t('categoryPage.next')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 5. Bottom SEO Article, Price Guide & FAQ (all managed in WordPress > Gorom Deal > Settings > Catalog Page) */}
        <section className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-stone-200 text-stone-700 space-y-6 sm:space-y-8 text-xs sm:text-sm leading-relaxed w-full">
          {(tx(catalog.seoTitle) || tx(catalog.seoText)) && (
            <div className="space-y-2.5 sm:space-y-3 w-full">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#252525] tracking-tight">{tx(catalog.seoTitle)}</h2>
              <p className="text-stone-600 leading-relaxed text-xs sm:text-base w-full whitespace-pre-line">{tx(catalog.seoText)}</p>
            </div>
          )}

          {/* Price List (built live from products): Card list on mobile, full table on sm+ */}
          {catalog.showPriceTable && priceTableItems.length > 0 && (
            <div className="space-y-3 w-full">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#F36B0B] shrink-0" />
                <span>{tx(catalog.priceTableTitle)}</span>
              </h3>

              <div className="sm:hidden border border-stone-200 rounded-xl bg-white divide-y divide-stone-100">
                {priceTableItems.map((row) => (
                  <div key={row.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-stone-900 leading-snug">{row.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {row.brand} · {row.warranty}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold text-[#F36B0B] shrink-0">{row.price}</span>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto border border-stone-200 rounded-xl w-full shadow-2xs bg-white">
                <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                  <thead className="bg-[#FFF8F1] text-stone-900 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3.5 sm:p-4">{t('categoryPage.price_table_name')}</th>
                      <th className="p-3.5 sm:p-4">{t('categoryPage.price_table_category')}</th>
                      <th className="p-3.5 sm:p-4">{t('categoryPage.price_table_brand')}</th>
                      <th className="p-3.5 sm:p-4">{t('categoryPage.price_table_warranty')}</th>
                      <th className="p-3.5 sm:p-4 font-mono text-right">{t('categoryPage.price_table_price')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {priceTableItems.map((row) => (
                      <tr key={row.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3.5 sm:p-4 font-semibold text-stone-900">{row.name}</td>
                        <td className="p-3.5 sm:p-4 text-stone-500">{row.category}</td>
                        <td className="p-3.5 sm:p-4 font-medium">{row.brand}</td>
                        <td className="p-3.5 sm:p-4 text-stone-600">{row.warranty}</td>
                        <td className="p-3.5 sm:p-4 font-mono tabular-nums text-right font-bold text-[#F36B0B]">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Value Propositions & Buying Guide */}
          {(catalog.whyBuy.length > 0 || catalog.guide.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { title: catalog.whyBuyTitle, items: catalog.whyBuy },
                { title: catalog.guideTitle, items: catalog.guide },
              ]
                .filter((block) => block.items.length > 0)
                .map((block, bi) => (
                  <div key={bi} className="space-y-2.5 sm:space-y-3 bg-stone-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-stone-200/80">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{tx(block.title)}</h3>
                    <ul className="space-y-2 text-stone-600 list-disc pl-4 text-xs sm:text-sm">
                      {block.items.map((item, ii) => (
                        <li key={ii}>
                          <strong>{tx(item.title)}</strong> {tx(item.text)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}

          {/* FAQ Accordion (Gorom Deal > FAQs) */}
          {faqs.length > 0 && (
            <div className="space-y-3 pt-1">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#F36B0B] shrink-0" />
                <span>{tx(catalog.faqTitle)}</span>
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={faq.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-xs sm:text-sm text-stone-800 flex items-center justify-between gap-3 hover:bg-stone-50 cursor-pointer"
                    >
                      <span>{tx(faq.q)}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="p-3.5 pt-2 text-stone-600 bg-stone-50/50 border-t border-stone-100 text-xs leading-relaxed whitespace-pre-line">
                        {tx(faq.a)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div onClick={() => setMobileFilterOpen(false)} className="absolute inset-0 bg-black/55" />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-[88vw] max-w-sm h-full bg-white shadow-2xl flex flex-col p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-bold text-base text-[#252525] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#F36B0B]" />
                  <span>{t('categoryPage.filters_3')}</span>
                </h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-[#E93825] font-semibold cursor-pointer"
                    >
                      {t('categoryPage.reset_2')}
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 text-xs custom-scrollbar pr-1">
                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                    {t('categoryPage.categories')}
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { onSelectCategory(cat.id); setMobileFilterOpen(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg text-left flex justify-between items-center cursor-pointer ${
                          categoryId === cat.id ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span>{lang === 'bn' ? cat.name : cat.nameEn}</span>
                        <span className="text-[11px] text-stone-400">({cat.itemCount})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-2.5 pt-3 border-t border-stone-100">
                  <div className="flex justify-between font-bold">
                    <span>{t('categoryPage.budget')}</span>
                    <span className="text-[#F36B0B] font-mono tabular-nums">
                      ৳{minPrice} - ৳{maxPrice}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-500">Min (৳)</span>
                      <input
                        type="number"
                        min={PMIN}
                        max={maxPrice - 200}
                        step="100"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.max(PMIN, Number(e.target.value)))}
                        className="w-full px-2.5 py-2 border border-stone-200 rounded-lg text-xs font-mono outline-none focus:border-[#F36B0B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-500">Max (৳)</span>
                      <input
                        type="number"
                        min={minPrice + 200}
                        max={PMAX}
                        step="100"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.min(PMAX, Number(e.target.value)))}
                        className="w-full px-2.5 py-2 border border-stone-200 rounded-lg text-xs font-mono outline-none focus:border-[#F36B0B]"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={PMIN}
                    max={PMAX}
                    step="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#F36B0B]"
                  />
                </div>

                {/* Brands */}
                {availableBrands.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-stone-100">
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      {t('categoryPage.brands')}
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {availableBrands.map((b) => (
                        <label key={b} className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b)}
                            onChange={() => toggleBrand(b)}
                            className="w-4 h-4 rounded accent-[#F36B0B]"
                          />
                          <span>{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discount Percentages */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                    {t('categoryPage.discount')}
                  </h4>
                  <div className="space-y-1">
                    {catalog.discountOptions.map((disc) => (
                      <label key={disc} className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDiscounts.includes(disc)}
                          onChange={() => toggleDiscount(disc)}
                          className="w-4 h-4 rounded accent-[#F36B0B]"
                        />
                        <span>{t('categoryPage.or_more_off', [disc])}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer Ratings */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                    {t('categoryPage.rating_2')}
                  </h4>
                  <div className="space-y-1">
                    {[5, 4].map((starCount) => (
                      <label key={starCount} className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(starCount)}
                          onChange={() => toggleRating(starCount)}
                          className="w-4 h-4 rounded accent-[#F36B0B]"
                        />
                        <div className="flex items-center text-amber-400">
                          {[...Array(starCount)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                          <span className="text-[11px] text-stone-500 ml-1">{t('categoryPage.and_up')}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Toggles */}
                <div className="space-y-1 pt-3 border-t border-stone-100">
                  <label className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flashDealOnly}
                      onChange={(e) => { setFlashDealOnly(e.target.checked); setCurrentPage(1); }}
                      className="w-4 h-4 rounded accent-[#F36B0B]"
                    />
                    <span className="font-semibold flex items-center gap-1 text-[#E93825]">
                      <Flame className="w-3.5 h-3.5 fill-[#E93825]" />
                      {t('categoryPage.flash_deals_only')}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                      className="w-4 h-4 rounded accent-[#F36B0B]"
                    />
                    <span>{t('categoryPage.in_stock_only_2')}</span>
                  </label>

                  <label className="flex items-center gap-2.5 py-1.5 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={warrantyOnly}
                      onChange={(e) => { setWarrantyOnly(e.target.checked); setCurrentPage(1); }}
                      className="w-4 h-4 rounded accent-[#F36B0B]"
                    />
                    <span>{t('categoryPage.official_warranty')}</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl cursor-pointer transition-colors"
                >
                  {t('categoryPage.show_products', [filteredProducts.length])}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
