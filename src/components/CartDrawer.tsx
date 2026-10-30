import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (deliveryArea: 'inside-dhaka' | 'outside-dhaka', couponDiscount: number) => void;
  lang: 'bn' | 'en';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang,
}) => {
  const [deliveryArea, setDeliveryArea] = useState<'inside-dhaka' | 'outside-dhaka'>('inside-dhaka');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Free delivery threshold: 2500 BDT
  const isFreeDelivery = subtotal >= 2500;
  const baseDeliveryCharge = deliveryArea === 'inside-dhaka' ? 60 : 120;
  const deliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;

  // Coupon discount calculation
  let discount = 0;
  if (couponApplied) {
    if (couponCode.toUpperCase() === 'GOROM10') {
      discount = Math.round(subtotal * 0.1); // 10%
    } else if (couponCode.toUpperCase() === 'GOROMDEAL') {
      discount = 200; // 200 BDT
    }
  }

  const finalTotal = Math.max(0, subtotal + deliveryCharge - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'GOROM10' || code === 'GOROMDEAL') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError(lang === 'bn' ? 'অকার্যকর কুপন কোড! ট্রাই করুন: GOROM10 বা GOROMDEAL' : 'Invalid code! Try: GOROM10 or GOROMDEAL');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F36B0B]" />
              <h2 className="text-base font-bold text-[#252525]">
                {lang === 'bn' ? 'আপনার শপিং ব্যাগ' : 'Shopping Cart'}
              </h2>
              <span className="bg-[#F36B0B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-orange-50/60 px-6 py-2.5 border-b border-orange-100 text-xs">
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>🎉 {lang === 'bn' ? 'অভিনন্দন! আপনি পাচ্ছেন ফ্রি ডেলিভারি!' : 'Congrats! You unlocked FREE shipping!'}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>{lang === 'bn' ? 'ফ্রি ডেলিভারি পেতে আরও যোগ করুন:' : 'Add more for FREE delivery:'}</span>
                  <span className="font-bold text-[#F36B0B]">৳{(2500 - subtotal).toLocaleString()}</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#F36B0B] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 2500) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-[#FFF8F1] flex items-center justify-center text-[#F36B0B]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <p className="font-semibold text-stone-700">
                  {lang === 'bn' ? 'আপনার কার্ট খালি!' : 'Your cart is empty!'}
                </p>
                <p className="text-xs text-stone-400 max-w-xs">
                  {lang === 'bn' ? 'পছন্দের পণ্যগুলো বেছে নিন এবং গরম ডিলে অর্ডার করুন।' : 'Explore hot deals and add items to your cart.'}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 bg-[#F36B0B] text-white text-xs font-semibold rounded-xl hover:bg-[#de5f07] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'শপিং শুরু করুন' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 items-center justify-between"
                >
                  {/* Thumbnail */}
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-stone-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-[#252525] line-clamp-1 leading-snug">
                      {lang === 'bn' ? product.name : product.nameEn}
                    </h4>
                    <span className="text-[11px] text-stone-500">{product.brand}</span>
                    <div className="text-xs font-bold text-[#F36B0B] font-mono mt-0.5">
                      ৳{product.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity and Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-stone-400 hover:text-[#E93825] p-1 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums text-stone-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 cursor-pointer"
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
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              
              {/* Delivery Area Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  {lang === 'bn' ? 'ডেলিভারি এরিয়া নির্বাচন করুন:' : 'Select Delivery Area:'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDeliveryArea('inside-dhaka')}
                    className={`py-2 px-2.5 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                      deliveryArea === 'inside-dhaka'
                        ? 'bg-white border-[#F36B0B] text-[#F36B0B] font-semibold ring-1 ring-[#F36B0B]'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'ঢাকা সিটির ভেতরে' : 'Inside Dhaka'}</span>
                    <span className="block text-[11px] text-stone-400 font-mono">
                      {isFreeDelivery ? 'ফ্রি' : '৳৬০'}
                    </span>
                  </button>
                  <button
                    onClick={() => setDeliveryArea('outside-dhaka')}
                    className={`py-2 px-2.5 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                      deliveryArea === 'outside-dhaka'
                        ? 'bg-white border-[#F36B0B] text-[#F36B0B] font-semibold ring-1 ring-[#F36B0B]'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{lang === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</span>
                    <span className="block text-[11px] text-stone-400 font-mono">
                      {isFreeDelivery ? 'ফ্রি' : '৳১২০'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={lang === 'bn' ? 'কুপন কোড (GOROM10)' : 'Promo Code (GOROM10)'}
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase outline-none focus:border-[#F36B0B]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-[#E93825]">{couponError}</p>}
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    ✓ {lang === 'bn' ? 'কুপন সফলভাবে যুক্ত হয়েছে!' : 'Coupon applied successfully!'}
                  </p>
                )}
              </form>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-stone-200 text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-semibold text-stone-900 tabular-nums font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                  <span className="font-semibold tabular-nums font-mono">
                    {deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">ফ্রি</span> : `৳${deliveryCharge}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                    <span className="tabular-nums font-mono">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#252525] pt-1 border-t border-stone-300">
                  <span>{lang === 'bn' ? 'সর্বমোট' : 'Total'}</span>
                  <span className="text-[#F36B0B] text-base tabular-nums font-mono">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onProceedToCheckout(deliveryArea, discount)}
                className="w-full py-3.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
