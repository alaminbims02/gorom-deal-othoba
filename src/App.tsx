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
import { CheckoutPage } from './components/CheckoutPage';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderTrackModal } from './components/OrderTrackModal';
import { UserAccountModal } from './components/UserAccountModal';
import { ProductCard } from './components/ProductCard';
import { Product, CartItem, Order, DeliveryArea } from './types';
import { useSite } from './context/SiteContext';
import { usePersistentState } from './hooks/usePersistentState';
import { Search, X, CheckCircle, Home, ShoppingCart, Heart, User as UserIcon, Flame } from 'lucide-react';

interface StoredCartLine {
  productId: string;
  quantity: number;
  variant?: string;
}

interface AppProps {
  onToggleLang: () => void;
}

export default function App({ onToggleLang }: AppProps) {
  const { lang, t, tx, settings, products: productsList, categories, vouchers } = useSite();

  // App state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Page Routing State
  // null = Homepage, string = Single Product Page, categoryId = Dedicated Category Page
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeCategoryView, setActiveCategoryView] = useState<string | null>(null);

  // Cart / wishlist / vouchers / orders persist in the browser; product data always
  // comes fresh from WordPress so prices & stock are never stale.
  const [cartLines, setCartLines] = usePersistentState<StoredCartLine[]>('goromdeal_cart', []);
  const [wishlistIds, setWishlistIds] = usePersistentState<string[]>('goromdeal_wishlist', []);
  const [collectedVouchers, setCollectedVouchers] = usePersistentState<string[]>('goromdeal_vouchers', []);
  const [orders, setOrders] = usePersistentState<Order[]>('goromdeal_orders', []);

  const cart: CartItem[] = useMemo(
    () =>
      cartLines
        .map((l) => {
          const product = productsList.find((p) => p.id === l.productId);
          return product ? { product, quantity: l.quantity, selectedVariant: l.variant || undefined } : null;
        })
        .filter(Boolean) as CartItem[],
    [cartLines, productsList],
  );
  const setCart = (updater: (prev: CartItem[]) => CartItem[]) => {
    setCartLines((prevLines) => {
      const prev = prevLines
        .map((l) => {
          const product = productsList.find((p) => p.id === l.productId);
          return product ? { product, quantity: l.quantity, selectedVariant: l.variant || undefined } : null;
        })
        .filter(Boolean) as CartItem[];
      return updater(prev).map((i) => ({ productId: i.product.id, quantity: i.quantity, variant: i.selectedVariant }));
    });
  };

  // Slide-over Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutPage, setIsCheckoutPage] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Checkout context
  const [checkoutDeliveryArea, setCheckoutDeliveryArea] = useState<DeliveryArea>('inside-dhaka');
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');

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

  // Dynamic Browser Title & Meta (templates managed in WordPress > Gorom Deal > Settings > SEO)
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    let title = tx(settings.seo.homeTitle);
    let desc = tx(settings.seo.homeDescription);
    if (activeProduct) {
      const vars = {
        name: lang === 'bn' ? activeProduct.name : activeProduct.nameEn,
        price: activeProduct.price.toLocaleString(),
        warranty: (lang === 'en' && activeProduct.warrantyEn) || activeProduct.warranty,
        brand: activeProduct.brand,
      };
      title = tx(settings.seo.productTitle, vars);
      desc = tx(settings.seo.productDescription, vars);
    } else if (activeCategoryView) {
      const cat = categories.find((c) => c.id === activeCategoryView);
      const category = cat
        ? lang === 'bn' ? cat.name : cat.nameEn
        : activeCategoryView === 'all'
          ? tx(settings.catalog.allCategoryLabel)
          : tx(settings.catalog.storeCategoryLabel);
      title = tx(settings.seo.categoryTitle, { category });
      desc = tx(settings.seo.categoryDescription, { category });
    }
    document.title = title;
    if (metaDesc) metaDesc.setAttribute('content', desc);
  }, [activeProduct, activeCategoryView, lang, settings, categories, tx]);

  // Cart calculations
  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  // Wishlist products
  const wishlistProducts = useMemo(() => productsList.filter((p) => wishlistIds.includes(p.id)), [wishlistIds, productsList]);

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
    showToast(t('app.added_to_your_cart', [product.name]));
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
    showToast(t('app.item_removed_from_cart'));
  };

  // Wishlist handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(t('app.removed_from_wishlist'));
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(t('app.added_to_your_wishlist'));
        return [...prev, product.id];
      }
    });
  };

  // Voucher collection handlers
  const handleCollectVoucher = (code: string) => {
    if (!collectedVouchers.includes(code)) {
      setCollectedVouchers((prev) => [...prev, code]);
      showToast(t('app.voucher_collected', [code]));
    }
  };

  const handleCollectAllVouchers = () => {
    const allCodes = vouchers.map((v) => v.code);
    setCollectedVouchers(allCodes);
    showToast(t('app.all_discount_vouchers_collected'));
  };

  // Direct Buy Now / Order Now handler (adds product & goes straight to dedicated CheckoutPage)
  const handleBuyNow = (product: Product, quantity = 1, variant?: string) => {
    handleAddToCart(product, quantity, variant);
    setIsCartOpen(false);
    setIsCheckoutPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setIsCheckoutPage(false);
    setActiveProductId(product.id);
    setActiveCategoryView(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryPage = (catId: string) => {
    setIsCheckoutPage(false);
    setSelectedCategory(catId);
    setActiveCategoryView(catId);
    setActiveProductId(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setIsCheckoutPage(false);
    setActiveProductId(null);
    setActiveCategoryView(null);
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout flow trigger
  const handleProceedToCheckout = (
    deliveryArea: 'inside-dhaka' | 'outside-dhaka',
    _discount: number,
    appliedCouponCode = ''
  ) => {
    setCheckoutDeliveryArea(deliveryArea);
    setCheckoutCouponCode(appliedCouponCode);
    setIsCartOpen(false);
    setIsCheckoutPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartLines([]);
    setCheckoutCouponCode('');
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
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#252525] overflow-x-hidden">
      
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
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim().length > 0) {
            setIsCheckoutPage(false);
            setActiveProductId(null);
            setActiveCategoryView(null);
          }
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryPage}
        onGoHome={handleGoHome}
        onToggleLang={onToggleLang}
      />

      <main className="flex-1">
        
        {/* VIEW 0: Dedicated Checkout Page (No Popup) */}
        {isCheckoutPage ? (
          <CheckoutPage
            items={cart}
            initialDeliveryArea={checkoutDeliveryArea}
            initialCouponCode={checkoutCouponCode}
            collectedVouchers={collectedVouchers}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onOrderSuccess={handleOrderSuccess}
            onBack={() => setIsCheckoutPage(false)}
            onContinueShopping={handleGoHome}
            onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          />
        ) : activeProduct ? (
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
            collectedVouchers={collectedVouchers}
            onCollectVoucher={handleCollectVoucher}
            onCollectAllVouchers={handleCollectAllVouchers}
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
          />
        ) : isSearchActive ? (
          /* VIEW 3: Active Search View */
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-200 mb-5 sm:mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-5 h-5 text-[#F36B0B] shrink-0" />
                <h2 className="text-base sm:text-xl font-bold text-[#252525] truncate">
                  {t('app.search_results_for')}{' '}
                  <span className="text-[#F36B0B]">"{searchQuery}"</span>
                </h2>
                <span className="text-xs text-stone-400 shrink-0">({filteredCatalog.length})</span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-500 hover:text-[#E93825] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('app.clear_search')}</span>
              </button>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-base text-stone-600 font-medium">
                  {t('app.no_kitchen_or_gadget_items_found')}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-5 py-2 bg-[#F36B0B] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {t('app.view_all_items')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
                {filteredCatalog.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelectProduct={handleSelectProduct}
                    onToggleWishlist={handleToggleWishlist}
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
              onSelectCategory={handleSelectCategoryPage}
            />

            {/* 2. Circular Categories Bar Slider (Clicking opens Category Page) */}
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategoryPage}
            />

            {/* 3. Hot Deals / "গরম ডিল" Section */}
            <div id="flash-deals">
              <FlashDealsSection
                products={productsList}
                wishlistIds={wishlistIds}
                onSelectProduct={handleSelectProduct}
                onToggleWishlist={handleToggleWishlist}
                onViewAll={() => handleSelectCategoryPage('all')}
              />
            </div>

            {/* 4. Promotional Banner */}
            {settings.promoBanner.enabled && (
              <PromoBanner
                onExplore={() => handleSelectCategoryPage(settings.promoBanner.target || 'all')}
              />
            )}

            {/* 5. Featured Kitchen & Gadgets Grid */}
            <div id="featured-section">
              <FeaturedProductsSection
                products={productsList}
                wishlistIds={wishlistIds}
                onSelectProduct={handleSelectProduct}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>

            {/* 6. Trust / 4 Value Propositions Bar */}
            <TrustFeaturesBar />
          </>
        )}
      </main>

      {/* 7. Charcoal Black Footer */}
      <Footer
        onSelectCategory={handleSelectCategoryPage}
      />

      {/* Mobile Sticky Bottom Navigation Bar (hidden on PDP and CheckoutPage) */}
      {!activeProduct && !isCheckoutPage && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
          <button
            onClick={handleGoHome}
            className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 cursor-pointer py-0.5 ${
              !activeProductId && !activeCategoryView ? 'text-[#F36B0B]' : 'text-stone-600 hover:text-[#F36B0B]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{t('app.home')}</span>
          </button>

          <button
            onClick={() => {
              setActiveProductId(null);
              setActiveCategoryView(null);
              setTimeout(() => {
                const el = document.getElementById('flash-deals');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 text-[#F36B0B] cursor-pointer py-0.5"
          >
            <Flame className="w-5 h-5 fill-[#F36B0B]" />
            <span className="text-[10px] font-bold truncate">{t('app.deals')}</span>
          </button>

          <button
            onClick={() => setIsWishlistOpen(true)}
            className="flex-1 min-w-0 relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#E93825] cursor-pointer py-0.5"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{t('app.wishlist')}</span>
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 right-3 bg-[#E93825] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex-1 min-w-0 relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#F36B0B] cursor-pointer py-0.5"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{t('app.cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-3 bg-[#F36B0B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsAccountOpen(true)}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 text-stone-600 hover:text-[#F36B0B] cursor-pointer py-0.5"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate">{t('app.account')}</span>
          </button>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        collectedVouchers={collectedVouchers}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Order Tracking Modal */}
      <OrderTrackModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        recentOrders={orders}
      />

      {/* User Account / Login Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        orders={orders}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />


    </div>
  );
}
