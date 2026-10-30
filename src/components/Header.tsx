import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X, 
  Truck, 
  Flame, 
  Layers, 
  ChevronDown
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenTrackOrder: () => void;
  onOpenWordPressAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onGoHome: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenTrackOrder,
  onOpenWordPressAdmin,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onGoHome,
  lang,
  onToggleLang,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#F3F3F3] shadow-xs">

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Brand Logo - Styled to match wireframe "গরম ডিল" */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onGoHome}
              className="flex items-center gap-2 group text-left cursor-pointer select-none"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E93825] to-[#F36B0B] text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold tracking-tight text-[#252525]">
                    গরম<span className="text-[#F36B0B]">ডিল</span>
                  </span>
                </div>
                <span className="text-[10px] tracking-wider text-stone-500 -mt-1 font-medium">
                  {lang === 'bn' ? 'কিচেন ও গ্যাজেটসের সেরা হাট · Gorom Deal' : 'Kitchen & Gadgets · Gorom Deal'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Category Dropdown Trigger */}
          <div className="relative hidden xl:block">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FFF8F1] hover:bg-[#ffeecf] text-[#252525] border border-[#F36B0B]/30 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-4 h-4 text-[#F36B0B]" />
              <span>{lang === 'bn' ? currentCategory.name : currentCategory.nameEn}</span>
              <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                      selectedCategory === cat.id 
                        ? 'bg-[#FFF8F1] text-[#F36B0B] font-semibold' 
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{lang === 'bn' ? cat.name : cat.nameEn}</span>
                    <span className="text-xs text-stone-400 font-mono">({cat.itemCount})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-[#F3F3F3] focus-within:bg-white rounded-full border border-transparent focus-within:border-[#F36B0B] focus-within:ring-2 focus-within:ring-[#F36B0B]/15 transition-all overflow-hidden">
              <div className="pl-4 text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={lang === 'bn' ? 'এয়ার ফ্রায়ার, ব্লেন্ডার, স্মার্টওয়াচ বা গ্যাজেটস খুঁজুন...' : 'Search air fryers, blenders, gadgets...'}
                className="w-full py-2.5 px-3 text-sm text-[#252525] bg-transparent outline-none placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 mr-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                className="bg-[#F36B0B] hover:bg-[#e05f05] text-white px-5 py-2.5 font-medium text-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Profile */}
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-2 p-2 sm:px-3 text-stone-700 hover:text-[#F36B0B] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer group"
              title="আমার একাউন্ট"
            >
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-[#FFF8F1] transition-colors">
                <User className="w-4 h-4 text-stone-700 group-hover:text-[#F36B0B]" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] text-stone-500 leading-none">{lang === 'bn' ? 'হ্যালো, সাইন ইন' : 'Hello, Sign In'}</span>
                <span className="text-xs font-semibold text-[#252525] leading-tight">{lang === 'bn' ? 'একাউন্ট' : 'Account'}</span>
              </div>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-stone-700 hover:text-[#E93825] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              title="পছন্দের তালিকা"
            >
              <Heart className="w-5 h-5 text-stone-700 hover:text-[#E93825]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E93825] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart with live badge matching wireframe */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-3 py-2 bg-[#FFF8F1] hover:bg-[#ffeacc] border border-[#F36B0B]/40 rounded-xl text-[#252525] transition-all cursor-pointer group shadow-xs"
              title="শপিং ব্যাগ"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#F36B0B] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-[#E93825] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-stone-500 leading-none font-medium">{lang === 'bn' ? 'মোট মূল্য' : 'Subtotal'}</span>
                <span className="text-xs font-bold text-[#F36B0B] leading-tight font-mono">
                  ৳{cartTotal.toLocaleString()}
                </span>
              </div>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-stone-700 hover:text-[#F36B0B] rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Category Navigation Bar */}
      <div className="hidden lg:block bg-white border-t border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs">
            
            {/* Left Nav items */}
            <div className="flex items-center gap-1 xl:gap-2 py-1.5 overflow-x-auto no-scrollbar">
              
              {/* All Categories Dropdown Trigger */}
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252525] text-white font-bold hover:bg-[#F36B0B] transition-colors cursor-pointer mr-2 shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Electronics Store Primary Link */}
              <button
                onClick={() => onSelectCategory('electronics-store')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'electronics-store' || selectedCategory === 'all'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] border border-[#F36B0B]/30'
                    : 'text-stone-800 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                <span className="text-sm">⚡</span>
                <span>{lang === 'bn' ? 'ইলেকট্রনিক্স স্টোর' : 'Electronics Store'}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E93825] text-white font-extrabold uppercase">HOT</span>
              </button>

              {/* Kitchen Appliances */}
              <button
                onClick={() => onSelectCategory('kitchen-appliances')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === 'kitchen-appliances'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                    : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                🍳 {lang === 'bn' ? 'কিচেন অ্যাপ্লায়েন্স' : 'Kitchen Appliances'}
              </button>

              {/* Cookware */}
              <button
                onClick={() => onSelectCategory('cookware')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === 'cookware'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                    : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                🍲 {lang === 'bn' ? 'কুকওয়্যার ও প্যান' : 'Cookware'}
              </button>

              {/* Smartwatch */}
              <button
                onClick={() => onSelectCategory('smartwatch')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === 'smartwatch'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                    : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                ⌚ {lang === 'bn' ? 'স্মার্টওয়াচ' : 'Smartwatches'}
              </button>

              {/* Audio & Earbuds */}
              <button
                onClick={() => onSelectCategory('audio')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === 'audio'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                    : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                🎧 {lang === 'bn' ? 'অডিও ও সাউন্ড' : 'Audio & Earbuds'}
              </button>

              {/* Power & Charging */}
              <button
                onClick={() => onSelectCategory('power-charging')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === 'power-charging'
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                    : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                }`}
              >
                🔋 {lang === 'bn' ? 'পাওয়ার ও চার্জিং' : 'Power & Charging'}
              </button>

              {/* Flash Deals link */}
              <button
                onClick={() => onSelectCategory('all')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[#E93825] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              >
                <Flame className="w-3.5 h-3.5 fill-[#E93825]" />
                <span>{lang === 'bn' ? 'হট ডিল' : 'Flash Deals'}</span>
              </button>

            </div>

            {/* Right Tag & Actions */}
            <div className="hidden xl:flex items-center gap-3 text-stone-500 text-[11px] font-medium py-1">
              <button
                onClick={onOpenWordPressAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#252525] text-white hover:bg-[#F36B0B] transition-all font-semibold text-[10px] shadow-xs cursor-pointer"
                title="WordPress Backend Control"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>WP ব্যাকএন্ড</span>
              </button>

              <button
                onClick={onOpenTrackOrder}
                className="flex items-center gap-1 text-stone-700 hover:text-[#F36B0B] transition-colors font-medium cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-[#F36B0B]" />
                <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
              </button>

              <button
                onClick={onToggleLang}
                className="font-semibold text-stone-700 hover:text-[#F36B0B] transition-colors cursor-pointer px-1.5 py-0.5 border border-stone-200 rounded-md"
              >
                {lang === 'bn' ? 'EN' : 'বাং'}
              </button>

              <span className="flex items-center gap-1 text-emerald-700 font-semibold pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ১০০% আসল পণ্যের গ্যারান্টি
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            {lang === 'bn' ? 'কিচেন ও গ্যাজেট ক্যাটাগরি' : 'Categories'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-semibold border border-[#F36B0B]/30' 
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {lang === 'bn' ? cat.name : cat.nameEn}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <button 
              onClick={() => { onOpenTrackOrder(); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 font-medium text-[#F36B0B]"
            >
              <Truck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
            </button>
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 bg-stone-100 rounded-md font-semibold text-stone-800"
            >
              {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
