/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { FlashDealsSection } from './components/FlashDealsSection';
import { PromoBanner } from './components/PromoBanner';
import { FeaturedProductsSection } from './components/FeaturedProductsSection';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CategoryPage } from './components/CategoryPage';
import { TrustFeaturesBar } from './components/TrustFeaturesBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderTrackModal } from './components/OrderTrackModal';
import { UserAccountModal } from './components/UserAccountModal';
import { WordPressAdminModal } from './components/WordPressAdminModal';
import { ProductCard } from './components/ProductCard';
import { Product, CartItem, Order } from './types';
import { 
  getStoredWpSettings, 
  saveWpSettings, 
  getHeadlessProducts, 
  saveHeadlessProducts,
  WordPressSettings 
} from './services/wordpress';
import { Search, X, CheckCircle, Home, ShoppingCart, Heart, User as UserIcon, Flame, Server } from 'lucide-react';

export default function App() {
  // App state
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Page Routing State
  // null = Homepage, string = Single Product Page, categoryId = Dedicated Category Page
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeCategoryView, setActiveCategoryView] = useState<string | null>(null);

  // WordPress Headless backend state & products
  const [wpSettings, setWpSettings] = useState<WordPressSettings>(() => getStoredWpSettings());
  const [productsList, setProductsList] = useState<Product[]>(() => getHeadlessProducts());

  // Cart and wishlist state
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: productsList[0],
      quantity: 1,
      selectedVariant: 'কালার (Color): ম্যাট ব্ল্যাক (Matte Black)',
    },
  ]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(['gd-gadget-01']);
  
  // Slide-over Drawers & Full Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWpAdminOpen, setIsWpAdminOpen] = useState(false);

  // Checkout context
  const [checkoutDeliveryArea, setCheckoutDeliveryArea] = useState<'inside-dhaka' | 'outside-dhaka'>('inside-dhaka');
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Find active single product
  const activeProduct = useMemo(() => {
    if (!activeProductId) return null;
    return productsList.find((p) => p.id === activeProductId) || null;
  }, [activeProductId, productsList]);

  // Dynamic Browser Title & Meta Updates for SEO & Conversion
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (activeProduct) {
      document.title = `${activeProduct.name} - ৳${activeProduct.price.toLocaleString()} | গরম ডিল`;
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `${activeProduct.name} সেরা অফার মূল্যে ৳${activeProduct.price}। ${activeProduct.warranty} ও ক্যাশ অন ডেলিভারি সুবিধা।`
        );
      }
    } else if (activeCategoryView) {
      const categoryTitle = 
        activeCategoryView === 'electronics-store' ? 'ইলেকট্রনিক্স ও গ্যাজেট স্টোর' :
        activeCategoryView === 'kitchen-appliances' ? 'কিচেন অ্যাপ্লায়েন্স' :
        activeCategoryView === 'cookware' ? 'কুকওয়্যার ও প্যান' :
        activeCategoryView === 'smartwatch' ? 'স্মার্টওয়াচ' :
        activeCategoryView === 'audio' ? 'অডিও ও সাউন্ড' :
        activeCategoryView === 'power-charging' ? 'পাওয়ার ও চার্জিং' : 'ক্যাটালগ';

      document.title = `${categoryTitle} - Electronics Store Online in Bangladesh | গরম ডিল`;
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `বাংলাদেশে সেরা মূল্যে ${categoryTitle} কিনুন। ভিশন, আরএফএল এবং অথেনটিক গ্যাজেট ব্র্যান্ডের আসল পণ্য, অফিসিয়াল ওয়ারেন্টি ও সারা দেশে ক্যাশ অন ডেলিভারি।`
        );
      }
    } else {
      document.title = 'গরম ডিল - Gorom Deal | সেরা কিচেন অ্যাপ্লায়েন্স ও স্মার্ট গ্যাজেটস অনলাইন শপ';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'বাংলাদেশের সেরা কিচেন অ্যাপ্লায়েন্স, নন-স্টিক কুকওয়্যার ও হাই-টেক গ্যাজেটসের বিশ্বস্ত অনলাইন শপ। দ্রুত হোম ডেলিভারি ও ১০০% আসল পণ্যের গ্যারান্টি।'
        );
      }
    }
  }, [activeProduct, activeCategoryView]);

  // Cart calculations
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  // Wishlist products
  const wishlistProducts = useMemo(() => productsList.filter((p) => wishlistIds.includes(p.id)), [wishlistIds, productsList]);

  // Headless WordPress Product Mutations
  const handleSaveWpSettings = (settings: WordPressSettings) => {
    setWpSettings(settings);
    saveWpSettings(settings);
    showToast('WordPress সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  const handleAddWpProduct = (newProduct: Product) => {
    const updated = [newProduct, ...productsList];
    setProductsList(updated);
    saveHeadlessProducts(updated);
    showToast(`"${newProduct.name}" সফলভাবে যুক্ত হয়েছে!`);
  };

  const handleUpdateWpProduct = (updatedProduct: Product) => {
    const updated = productsList.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProductsList(updated);
    saveHeadlessProducts(updated);
    showToast('পণ্য সফলভাবে আপডেট হয়েছে!');
  };

  const handleDeleteWpProduct = (productId: string) => {
    const updated = productsList.filter((p) => p.id !== productId);
    setProductsList(updated);
    saveHeadlessProducts(updated);
    showToast('পণ্যটি সফলভাবে অপসারণ করা হয়েছে');
  };

  const handleBulkSync = (syncedProducts: Product[]) => {
    setProductsList(syncedProducts);
    saveHeadlessProducts(syncedProducts);
    showToast(`WordPress থেকে ${syncedProducts.length}টি পণ্য সিনক্রোনাইজ হয়েছে!`);
  };

  // Cart handlers
  const handleAddToCart = (product: Product, quantity = 1, variant?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.selectedVariant === variant);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedVariant === variant
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    showToast(lang === 'bn' ? `"${product.name}" কার্টে যুক্ত হয়েছে!` : `Added to your cart!`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast(lang === 'bn' ? 'পণ্যটি কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart');
  };

  // Wishlist handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(lang === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(lang === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Added to your wishlist!');
        return [...prev, product.id];
      }
    });
  };

  // Direct Buy Now / Order Now handler
  const handleBuyNow = (product: Product, quantity = 1, variant?: string) => {
    handleAddToCart(product, quantity, variant);
    setIsCartOpen(true);
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setActiveProductId(product.id);
    setActiveCategoryView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryPage = (catId: string) => {
    setSelectedCategory(catId);
    setActiveCategoryView(catId);
    setActiveProductId(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveProductId(null);
    setActiveCategoryView(null);
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout flow trigger
  const handleProceedToCheckout = (deliveryArea: 'inside-dhaka' | 'outside-dhaka', discount: number) => {
    setCheckoutDeliveryArea(deliveryArea);
    setCheckoutDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
  };

  // Filtered Products for Search or Custom Category View
  const filteredCatalog = useMemo(() => {
    return productsList.filter((product) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, productsList]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#252525]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#252525] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-bottom-3 duration-200 border border-stone-700">
          <CheckCircle className="w-4 h-4 text-[#F36B0B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenWordPressAdmin={() => setIsWpAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim().length > 0) {
            setActiveProductId(null);
            setActiveCategoryView(null);
          }
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryPage}
        onGoHome={handleGoHome}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
      />

      <main className="flex-1">
        
        {/* VIEW 1: Single Product Detail Page (NO POPUP, FULL DEDICATED PAGE) */}
        {activeProduct ? (
          <ProductDetailPage
            product={activeProduct}
            allProducts={productsList}
            onBack={() => {
              if (activeCategoryView) {
                setActiveProductId(null);
              } else {
                handleGoHome();
              }
            }}
            onSelectProduct={handleSelectProduct}
            isWishlisted={wishlistIds.includes(activeProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            lang={lang}
          />
        ) : activeCategoryView ? (
          /* VIEW 2: Dedicated Category Catalog Page with Brand & Price Filters */
          <CategoryPage
            categoryId={activeCategoryView}
            allProducts={productsList}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            onSelectCategory={handleSelectCategoryPage}
            onGoHome={handleGoHome}
            lang={lang}
          />
        ) : isSearchActive ? (
          /* VIEW 3: Active Search View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#F36B0B]" />
                <h2 className="text-xl font-bold text-[#252525]">
                  {lang === 'bn' ? 'অনুসন্ধানের ফলাফল:' : 'Search Results for:'}{' '}
                  <span className="text-[#F36B0B]">"{searchQuery}"</span>
                </h2>
                <span className="text-xs text-stone-400 font-mono">({filteredCatalog.length})</span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-500 hover:text-[#E93825] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear search'}</span>
              </button>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-base text-stone-600 font-medium">
                  {lang === 'bn' ? 'দুঃখিত, কোনো কিচেন আইটেম বা গ্যাজেট পাওয়া যায়নি।' : 'No kitchen or gadget items found.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-5 py-2 bg-[#F36B0B] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {lang === 'bn' ? 'সকল পণ্য দেখুন' : 'View all items'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredCatalog.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelectProduct={handleSelectProduct}
                    onToggleWishlist={handleToggleWishlist}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 4: Clean Storefront Homepage Layout */
          <>
            {/* 1. Hero Banner Carousel */}
            <HeroBanner
              onShopNow={() => {
                const el = document.getElementById('flash-deals');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              lang={lang}
            />

            {/* 2. Circular Categories Bar Slider (Clicking opens Category Page) */}
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategoryPage}
              lang={lang}
            />

            {/* 3. Hot Deals / "গরম ডিল" Section */}
            <div id="flash-deals">
              <FlashDealsSection
                products={productsList}
                wishlistIds={wishlistIds}
                onSelectProduct={handleSelectProduct}
                onToggleWishlist={handleToggleWishlist}
                onViewAll={() => handleSelectCategoryPage('all')}
                lang={lang}
              />
            </div>

            {/* 4. Promotional Banner */}
            <PromoBanner
              onExplore={() => handleSelectCategoryPage('kitchen-appliances')}
              lang={lang}
            />

            {/* 5. Featured Kitchen & Gadgets Grid */}
            <div id="featured-section">
              <FeaturedProductsSection
                products={productsList}
                wishlistIds={wishlistIds}
                onSelectProduct={handleSelectProduct}
                onToggleWishlist={handleToggleWishlist}
                lang={lang}
              />
            </div>

            {/* 6. Trust / 4 Value Propositions Bar */}
            <TrustFeaturesBar lang={lang} />
          </>
        )}
      </main>

      {/* 7. Charcoal Black Footer */}
      <Footer
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          setActiveProductId(null);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* Mobile Sticky Bottom Navigation Bar for touch UX */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={handleGoHome}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            !activeProductId ? 'text-[#F36B0B]' : 'text-stone-600 hover:text-[#F36B0B]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">{lang === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        <button
          onClick={() => {
            setActiveProductId(null);
            setTimeout(() => {
              const el = document.getElementById('flash-deals');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          className="flex flex-col items-center gap-0.5 text-[#F36B0B] cursor-pointer"
        >
          <Flame className="w-5 h-5 fill-[#F36B0B]" />
          <span className="text-[10px] font-bold">{lang === 'bn' ? 'গরম ডিল' : 'Deals'}</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#E93825] cursor-pointer"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium">{lang === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}</span>
          {wishlistIds.length > 0 && (
            <span className="absolute -top-1 right-2 bg-[#E93825] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#F36B0B] cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">{lang === 'bn' ? 'কার্ট' : 'Cart'}</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-1 bg-[#F36B0B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsAccountOpen(true)}
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#F36B0B] cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{lang === 'bn' ? 'একাউন্ট' : 'Account'}</span>
        </button>
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        lang={lang}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        deliveryArea={checkoutDeliveryArea}
        discount={checkoutDiscount}
        onOrderSuccess={handleOrderSuccess}
        lang={lang}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        lang={lang}
      />

      {/* Order Tracking Modal */}
      <OrderTrackModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        recentOrders={orders}
        lang={lang}
      />

      {/* User Account / Login Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        orders={orders}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        lang={lang}
      />

      {/* Headless WordPress & WooCommerce Admin Modal */}
      <WordPressAdminModal
        isOpen={isWpAdminOpen}
        onClose={() => setIsWpAdminOpen(false)}
        settings={wpSettings}
        onSaveSettings={handleSaveWpSettings}
        products={productsList}
        onAddProduct={handleAddWpProduct}
        onUpdateProduct={handleUpdateWpProduct}
        onDeleteProduct={handleDeleteWpProduct}
        onBulkSync={handleBulkSync}
        lang={lang}
      />

    </div>
  );
}
