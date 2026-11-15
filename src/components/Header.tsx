import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  Truck, 
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenTrackOrder: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onGoHome: () => void;
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
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onGoHome,
  onToggleLang,
}) => {
  const { lang, t, tx, settings, categoryList: CATEGORIES } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#F3F3F3] shadow-xs">

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-2 gap-y-2 sm:gap-6">
          
          {/* Left: Mobile Hamburger Menu + Brand Image Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1 text-stone-700 hover:text-[#F36B0B] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button 
              onClick={onGoHome}
              className="flex items-center group text-left cursor-pointer select-none py-0.5"
              aria-label={t('header.home')}
            >
              <img
                src={settings.general.logo}
                alt={tx(settings.general.logoAlt)}
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
              />
            </button>
          </div>

          {/* Search Bar (Full width row 2 on mobile, inline on md+) */}
          <div className="order-3 md:order-none w-full md:w-auto md:flex-1 md:max-w-2xl relative">
            <div className="flex items-center bg-[#F3F3F3] focus-within:bg-white rounded-full border border-transparent focus-within:border-[#F36B0B] focus-within:ring-2 focus-within:ring-[#F36B0B]/15 transition-all overflow-hidden">
              <div className="pl-3.5 sm:pl-4 text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('header.search_air_fryers_blenders_gadgets')}
                className="w-full py-2 sm:py-2.5 px-2.5 sm:px-3 text-xs sm:text-sm text-[#252525] bg-transparent outline-none placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 mr-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                className="bg-[#F36B0B] hover:bg-[#e05f05] text-white px-3.5 sm:px-5 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{t('header.search')}</span>
              </button>
            </div>
          </div>

          {/* Action Icons: Account, Wishlist, Cart, Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Account Profile (Hidden on smallest phones since it's in bottom bar) */}
            <button
              onClick={onOpenAccount}
              className="hidden sm:flex items-center gap-2 p-2 sm:px-3 text-stone-700 hover:text-[#F36B0B] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer group"
              title={t('header.my_account')}
            >
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-[#FFF8F1] transition-colors">
                <User className="w-4 h-4 text-stone-700 group-hover:text-[#F36B0B]" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] text-stone-500 leading-none">{t('header.hello_sign_in')}</span>
                <span className="text-xs font-semibold text-[#252525] leading-tight">{t('app.account')}</span>
              </div>
            </button>

            {/* Cart with live badge */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FFF8F1] hover:bg-[#ffeacc] border border-[#F36B0B]/40 rounded-xl text-[#252525] transition-all cursor-pointer group shadow-xs"
              title={t('header.shopping_bag')}
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#F36B0B] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-[#E93825] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-stone-500 leading-none font-medium">{t('header.subtotal')}</span>
                <span className="text-xs font-bold text-[#F36B0B] leading-tight font-mono">
                  ৳{cartTotal.toLocaleString()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Category Navigation Bar */}
      <div className="hidden lg:block bg-white border-t border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs">
            
            {/* Left Nav items */}
            <div className="flex items-center gap-1 xl:gap-2 py-1.5 min-w-0">
              
              {/* All Categories Dropdown Trigger */}
              <div className="relative mr-2 shrink-0">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252525] text-white font-bold hover:bg-[#F36B0B] transition-colors cursor-pointer"
                >
                  <span>{t('header.all_categories')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
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
                        <span className="text-xs text-stone-400">({cat.itemCount})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 xl:gap-2 overflow-x-auto no-scrollbar">

              {settings.header.navLinks.map((link, idx) => {
                const isActive =
                  link.style === 'primary'
                    ? selectedCategory === link.target || selectedCategory === 'all'
                    : link.style !== 'deal' && selectedCategory === link.target;
                const cls =
                  link.style === 'primary'
                    ? `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#FFF8F1] text-[#F36B0B] border border-[#F36B0B]/30'
                          : 'text-stone-800 hover:text-[#F36B0B] hover:bg-stone-50'
                      }`
                    : link.style === 'deal'
                      ? 'flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[#E93825] hover:bg-red-50 transition-colors cursor-pointer shrink-0'
                      : `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#FFF8F1] text-[#F36B0B] font-bold'
                            : 'text-stone-700 hover:text-[#F36B0B] hover:bg-stone-50'
                        }`;
                return (
                  <button key={idx} onClick={() => onSelectCategory(link.target || 'all')} className={cls}>
                    <span>{tx(link.label)}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#E93825] text-white font-extrabold uppercase">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              </div>
            </div>

            {/* Right Tag & Actions */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 text-stone-500 text-[11px] font-medium py-1 shrink-0">
              <button
                onClick={onToggleLang}
                className="font-semibold text-stone-700 hover:text-[#F36B0B] transition-colors cursor-pointer px-1.5 py-0.5 border border-stone-200 rounded-md"
              >
                {t('header.text')}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {settings.header.navLinks
            .filter((link) => link.style === 'primary')
            .slice(0, 1)
            .map((link, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectCategory(link.target || 'all');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFF8F1] border border-[#F36B0B]/30 text-[#F36B0B] font-bold text-sm cursor-pointer"
              >
                <span>{t('header.electronics_kitchen_store')}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#E93825] text-white font-extrabold uppercase">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}

          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider pt-1">
            {t('header.categories')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs sm:text-sm text-left rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-[#FFF8F1] text-[#F36B0B] font-semibold border border-[#F36B0B]/30' 
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {lang === 'bn' ? cat.name : cat.nameEn}
              </button>
            ))}
          </div>

          <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <button 
              onClick={() => { onOpenTrackOrder(); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 font-semibold text-[#F36B0B] cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>{t('header.track_order')}</span>
            </button>
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 bg-stone-100 rounded-md font-semibold text-stone-800 cursor-pointer"
            >
              {t('header.text_2')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
