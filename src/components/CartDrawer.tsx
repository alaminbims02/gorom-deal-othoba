import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { deliveryChargeFor, voucherDiscount } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (deliveryArea: 'inside-dhaka' | 'outside-dhaka', couponDiscount: number, appliedCouponCode?: string) => void;
  collectedVouchers?: string[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  collectedVouchers = [],
}) => {
  const { lang, t, settings, vouchers } = useSite();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Delivery rules & free-delivery threshold come from WordPress (Settings > Delivery).
  const { charge: deliveryCharge, isFree: isFreeDelivery, threshold: freeThreshold } = deliveryChargeFor(
    settings,
    'inside-dhaka',
    subtotal,
  );

  // Voucher rules come from WordPress (Gorom Deal > Vouchers).
  const activeVoucher = couponApplied ? vouchers.find((v) => v.code === couponCode.trim().toUpperCase()) : undefined;
  const discount = voucherDiscount(activeVoucher, subtotal);

  const finalTotal = Math.max(0, subtotal + deliveryCharge - discount);

  const applyCodeDirect = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    setCouponCode(code);
    const match = vouchers.find((v) => v.code === code);
    if (match) {
      setCouponApplied(true);
      setCouponError(
        subtotal < match.minSpend ? t('checkoutPage.minimum_order_required_for', [code, match.minSpend.toLocaleString()]) : '',
      );
    } else {
      setCouponApplied(false);
      setCouponError(t('cartDrawer.invalid_code_try_gorom10_goromdeal_or'));
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCodeDirect(couponCode);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/55 transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-5 h-5 text-[#F36B0B] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#252525] truncate">
                {t('cartDrawer.shopping_cart')}
              </h2>
              <span className="bg-[#F36B0B] text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer shrink-0"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {freeThreshold > 0 && (
          <div className="bg-orange-50/60 px-4 sm:px-6 py-2.5 border-b border-orange-100 text-xs shrink-0">
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('cartDrawer.free_delivery_unlocked_for_your_order')}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between gap-2 text-stone-600">
                  <span>{t('cartDrawer.add_more_for_free_delivery')}</span>
                  <span className="font-bold text-[#F36B0B] font-mono tabular-nums shrink-0">৳{(freeThreshold - subtotal).toLocaleString()}</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F36B0B] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / Math.max(1, freeThreshold)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-[#FFF8F1] flex items-center justify-center text-[#F36B0B]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <p className="font-semibold text-stone-700">
                  {t('cartDrawer.your_cart_is_empty')}
                </p>
                <p className="text-xs text-stone-400 max-w-xs">
                  {t('cartDrawer.explore_hot_deals_and_add_items')}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-[#F36B0B] text-white text-xs font-semibold rounded-xl hover:bg-[#de5f07] transition-colors cursor-pointer"
                >
                  {t('cartDrawer.start_shopping')}
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200/80 items-center justify-between"
                >
                  {/* Thumbnail (1:1 Ratio) */}
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-15 h-15 sm:w-16 sm:h-16 aspect-square object-cover bg-white rounded-lg border border-stone-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="text-xs font-semibold text-[#252525] line-clamp-2 leading-snug">
                      {lang === 'bn' ? product.name : product.nameEn}
                    </h4>
                    <span className="text-[11px] text-stone-500">{product.brand}</span>
                    <div className="text-xs font-bold text-[#F36B0B] font-mono tabular-nums mt-0.5">
                      ৳{product.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity and Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-stone-400 hover:text-[#E93825] p-1 transition-colors cursor-pointer"
                      title={t('common.remove')}
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="px-2 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums text-stone-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="px-2 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer Details */}
          {items.length > 0 && (
            <div className="p-3.5 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              
              {/* Coupon Code Section + Collected Vouchers */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                {collectedVouchers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-stone-500">
                      {t('cartDrawer.collected')}
                    </span>
                    {collectedVouchers.map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => applyCodeDirect(code)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          couponApplied && couponCode.toUpperCase() === code
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[#FFF8F1] text-[#F36B0B] border-orange-200 hover:bg-orange-100'
                        }`}
                      >
                        {code} {couponApplied && couponCode.toUpperCase() === code ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t('cartDrawer.promo_code_gorom10')}
                      className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-stone-300 rounded-lg uppercase outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {t('cartDrawer.apply')}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-[#E93825]">{couponError}</p>}
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    ✓ {t('cartDrawer.coupon_applied', [couponCode.toUpperCase()])}
                  </p>
                )}
              </form>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-stone-200 text-stone-600">
                <div className="flex justify-between">
                  <span>{t('cartDrawer.subtotal')}</span>
                  <span className="font-semibold text-stone-900 tabular-nums font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cartDrawer.delivery_charge')}</span>
                  <span className="font-semibold tabular-nums font-mono">
                    {deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">{t('checkoutPage.free')}</span> : `৳${deliveryCharge}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t('cartDrawer.discount')}</span>
                    <span className="tabular-nums font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#252525] pt-1 border-t border-stone-300">
                  <span>{t('cartDrawer.total')}</span>
                  <span className="text-[#F36B0B] text-base tabular-nums font-mono">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onProceedToCheckout('inside-dhaka', discount, couponApplied ? couponCode.trim().toUpperCase() : '')}
                className="w-full py-3.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('cartDrawer.proceed_to_checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
