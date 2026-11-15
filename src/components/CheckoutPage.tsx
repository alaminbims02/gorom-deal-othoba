import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  CreditCard,
  Tag,
  Plus,
  Minus,
  RotateCcw,
  PackageCheck,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { createOrder, deliveryChargeFor, voucherDiscount as calcVoucher } from '../services/api';

interface CheckoutPageProps {
  items: CartItem[];
  initialDeliveryArea: 'inside-dhaka' | 'outside-dhaka';
  initialCouponCode?: string;
  collectedVouchers: string[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: Order) => void;
  onBack: () => void;
  onContinueShopping: () => void;
  onOpenTrackOrder: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  initialDeliveryArea,
  initialCouponCode = '',
  collectedVouchers,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onBack,
  onContinueShopping,
  onOpenTrackOrder,
}) => {
  const site = useSite();
  const { lang, t, tx, settings, vouchers: STORE_VOUCHERS } = site;
  const DISTRICTS = settings.delivery.districts;
  const enabledPayments = settings.payments.filter((p) => p.enabled);
  const [deliveryArea, setDeliveryArea] = useState<'inside-dhaka' | 'outside-dhaka'>(initialDeliveryArea);
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState(initialCouponCode ? initialCouponCode.toUpperCase() : '');
  const [couponError, setCouponError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(settings.delivery.defaultDistrict || DISTRICTS[0] || '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>(enabledPayments[0]?.id || 'cod');
  const [transactionId, setTransactionId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedSavedTotal, setConfirmedSavedTotal] = useState(0);

  useEffect(() => {
    setDeliveryArea(initialDeliveryArea);
  }, [initialDeliveryArea]);

  // Delivery zone follows the chosen district (Settings > Delivery > Inside-Dhaka districts).
  useEffect(() => {
    if (!district) return;
    setDeliveryArea(settings.delivery.insideDhakaDistricts.includes(district) ? 'inside-dhaka' : 'outside-dhaka');
  }, [district, settings.delivery.insideDhakaDistricts]);

  useEffect(() => {
    if (initialCouponCode) {
      setCouponCode(initialCouponCode);
      setAppliedCoupon(initialCouponCode.toUpperCase());
    }
  }, [initialCouponCode]);

  // Financial & "Deal Won" Savings Calculations
  const regularTotal = items.reduce(
    (sum, item) => sum + Math.max(item.product.originalPrice, item.product.price) * item.quantity,
    0
  );
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const catalogSavings = Math.max(0, regularTotal - subtotal);

  // Delivery charges & free shipping savings
  const {
    standard: standardDeliveryFee,
    charge: deliveryCharge,
    isFree: isFreeDelivery,
    threshold: freeThreshold,
  } = deliveryChargeFor(settings, deliveryArea, subtotal);
  const deliverySaved = isFreeDelivery ? standardDeliveryFee : 0;

  // Voucher discount calculation
  const activeVoucherObj = STORE_VOUCHERS.find((v) => v.code === appliedCoupon);
  const voucherDiscount = calcVoucher(activeVoucherObj, subtotal);

  const finalTotal = Math.max(0, subtotal + deliveryCharge - voucherDiscount);
  const totalSavings = catalogSavings + voucherDiscount + deliverySaved;
  const totalPotentialBase = regularTotal + standardDeliveryFee;
  const totalWinPercent =
    totalPotentialBase > 0 ? Math.round((totalSavings / totalPotentialBase) * 100) : 0;

  const applyVoucherCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    setCouponCode(code);
    const match = STORE_VOUCHERS.find((v) => v.code === code);
    if (!match) {
      setCouponError(
        t('checkoutPage.invalid_voucher_code_try_gorom10_goromde')
      );
      return;
    }
    if (subtotal < match.minSpend) {
      setCouponError(
        t('checkoutPage.minimum_order_required_for', [code, match.minSpend.toLocaleString()])
      );
      return;
    }
    setAppliedCoupon(code);
    setCouponError('');
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyVoucherCode(couponCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
    setCouponError('');
  };

  const selectedPayment = enabledPayments.find((p) => p.id === paymentMethod);
  const needsTrx = Boolean(selectedPayment && selectedPayment.id !== 'cod' && selectedPayment.accountNumber);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    const savedSnapshot = totalSavings;

    try {
      // WordPress re-validates prices, stock, voucher and delivery charge server-side.
      const newOrder = await createOrder(
        {
          items,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          district,
          deliveryArea,
          paymentMethod,
          couponCode: appliedCoupon || undefined,
          note: note.trim() || undefined,
          transactionId: transactionId.trim() || undefined,
        },
        site,
      );
      setConfirmedSavedTotal(savedSnapshot);
      setConfirmedOrder(newOrder);
      onOrderSuccess(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err?.message || t('common.error_try_again'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Order Confirmation Dedicated Page
  if (confirmedOrder) {
    return (
      <section className="max-w-3xl mx-auto px-3 sm:px-6 py-8 sm:py-12 pb-20">
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Top Confirmation Strip */}
          <div className="bg-[#FFF8F1] border-b border-orange-100 px-5 sm:px-8 py-6 sm:py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252525]">
              {t('checkoutPage.your_order_is_confirmed')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {t('checkoutPage.order_tracking_number')}{' '}
              <span className="font-bold text-[#F36B0B] bg-white px-2.5 py-0.5 rounded border border-orange-200">
                {confirmedOrder.id}
              </span>
            </p>

            {confirmedSavedTotal > 0 && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold mt-1">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t('checkoutPage.you_saved_a_total_of')}{' '}
                  <strong className="font-mono text-emerald-700">
                    ৳{confirmedSavedTotal.toLocaleString()}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Receipt Body */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* Customer & Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <div className="space-y-1">
                <p className="text-stone-500 text-xs">{t('checkoutPage.customer')}</p>
                <p className="font-bold text-[#252525]">{confirmedOrder.customerName}</p>
                <p className="text-stone-700">{confirmedOrder.customerPhone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-stone-500 text-xs">{t('checkoutPage.delivery_address')}</p>
                <p className="font-semibold text-[#252525]">
                  {confirmedOrder.customerAddress}, {confirmedOrder.district}
                </p>
                <p className="text-stone-600">
                  {(() => {
                    const zone = confirmedOrder.deliveryArea === 'inside-dhaka' ? settings.delivery.insideDhaka : settings.delivery.outsideDhaka;
                    return t('checkoutPage.zone_with_time', [tx(zone.name), tx(zone.time)]);
                  })()}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#252525]">
                {t('checkoutPage.ordered_items')}
              </h2>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {confirmedOrder.items.map(({ product, quantity, selectedVariant }) => (
                  <div key={`${product.id}-${selectedVariant || ''}`} className="flex items-center gap-3 p-3 bg-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 aspect-square object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#252525] truncate">
                        {lang === 'bn' ? product.name : product.nameEn}
                      </p>
                      {selectedVariant && (
                        <p className="text-[11px] text-stone-500 truncate">{selectedVariant}</p>
                      )}
                      <p className="text-xs text-stone-500 mt-0.5">
                        {t('checkoutPage.qty', [quantity])}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-[#252525] font-mono tabular-nums">
                        ৳{(product.price * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{t('checkoutPage.subtotal')}</span>
                <span className="font-semibold text-stone-900 font-mono tabular-nums">
                  ৳{confirmedOrder.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t('cartDrawer.delivery_charge')}</span>
                <span className="font-semibold font-mono tabular-nums">
                  {confirmedOrder.deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">{t('checkoutPage.free')}</span>
                  ) : (
                    `৳${confirmedOrder.deliveryCharge}`
                  )}
                </span>
              </div>
              {confirmedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{t('checkoutPage.voucher_discount')}</span>
                  <span className="font-mono tabular-nums">-৳{confirmedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#252525] pt-2 border-t border-stone-200">
                <span>
                  {confirmedOrder.paymentMethod === 'cod'
                    ? t('checkoutPage.payable_on_delivery')
                    : t('checkoutPage.total_amount')}
                </span>
                <span className="text-lg text-[#F36B0B] font-mono tabular-nums">
                  ৳{confirmedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenTrackOrder}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 hover:border-[#F36B0B] text-stone-800 font-semibold text-sm transition-colors cursor-pointer"
              >
                {t('checkoutPage.track_this_order')}
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {t('checkoutPage.continue_shopping')}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // State 2: Empty Cart at Checkout
  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFF8F1] text-[#F36B0B] flex items-center justify-center mx-auto border border-orange-100">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#252525]">
          {t('checkoutPage.your_checkout_cart_is_empty')}
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          {t('checkoutPage.add_your_favorite_kitchen_appliances_or')}
        </p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="px-7 py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
        >
          {t('checkoutPage.browse_products')}
        </button>
      </section>
    );
  }

  // State 3: Dedicated Full-Page Checkout
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-20">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FFF8F1] hover:text-[#F36B0B] text-stone-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('checkoutPage.back')}</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-[#252525] truncate">
            {t('checkoutPage.complete_your_order')}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <span className="text-[#F36B0B] font-bold">{t('checkoutPage.step_address_payment')}</span>
          <span>→</span>
          <span>{t('checkoutPage.step_confirmation')}</span>
        </div>
      </div>

      {/* Deal Advantage / Total Savings Highlight Bar */}
      {totalSavings > 0 && (
        <div className="mb-6 bg-[#FFF8F1] border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#252525]">
                {t('checkoutPage.great_deal_you_are_saving')}
                <span className="text-[#E93825] font-mono tabular-nums">
                  ৳{totalSavings.toLocaleString()}
                </span>
              </h2>
            </div>
            <p className="text-xs text-stone-600 pl-8">
              {t('checkoutPage.you_re_getting_off_standard_retail', [totalWinPercent])}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0 text-xs shrink-0">
            {catalogSavings > 0 && (
              <span className="bg-white border border-orange-200 px-2.5 py-1 rounded-lg text-stone-700 font-semibold">
                {t('checkoutPage.offer')}{' '}
                <span className="text-emerald-700 font-mono tabular-nums">৳{catalogSavings.toLocaleString()}</span>
              </span>
            )}
            {voucherDiscount > 0 && (
              <span className="bg-white border border-orange-200 px-2.5 py-1 rounded-lg text-stone-700 font-semibold">
                {t('checkoutPage.voucher')}{' '}
                <span className="text-emerald-700 font-mono tabular-nums">৳{voucherDiscount.toLocaleString()}</span>
              </span>
            )}
            {deliverySaved > 0 && (
              <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 font-semibold">
                {t('checkoutPage.free_delivery')}{' '}
                <span className="font-mono tabular-nums">৳{deliverySaved}</span>
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Cart Review + Shipping Address + Payment Method */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          {/* Block 1: Products in Order */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-[#252525] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#F36B0B]" />
                <span>
                  {t('checkoutPage.order_items', [items.reduce((s, i) => s + i.quantity, 0)])}
                </span>
              </h2>
              <span className="text-xs text-stone-500">
                {t('checkoutPage.inspect_on_delivery')}
              </span>
            </div>

            <div className="space-y-3">
              {items.map(({ product, quantity, selectedVariant }) => {
                const itemSavings = Math.max(0, product.originalPrice - product.price) * quantity;
                return (
                  <div
                    key={`${product.id}-${selectedVariant || ''}`}
                    className="flex items-start sm:items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 bg-stone-50/80 rounded-xl border border-stone-200/80"
                  >
                    <img
                      src={product.image}
                      alt={lang === 'bn' ? product.name : product.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-15 h-15 sm:w-20 sm:h-20 aspect-square object-cover rounded-lg bg-white border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#252525] line-clamp-2 leading-snug">
                        {lang === 'bn' ? product.name : product.nameEn}
                      </h3>
                      {selectedVariant && (
                        <p className="text-[11px] text-stone-500 truncate">{selectedVariant}</p>
                      )}
                      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 pt-0.5">
                        <span className="text-sm font-bold text-[#F36B0B] font-mono tabular-nums">
                          ৳{(product.price * quantity).toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                            ৳{(product.originalPrice * quantity).toLocaleString()}
                          </span>
                        )}
                        {itemSavings > 0 && (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ({t('checkoutPage.save')}{' '}
                            <span className="font-mono tabular-nums">৳{itemSavings.toLocaleString()}</span>)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center shrink-0 self-center">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="px-2 sm:px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 sm:px-2.5 text-xs font-bold text-stone-800 tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="px-2 sm:px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Block 2: Delivery Information */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[#252525] flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-[#F36B0B]" />
              <span>{t('checkoutPage.delivery_address_contact')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('checkoutPage.full_name')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('checkoutPage.e_g_tanvir_ahmed')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('checkoutPage.mobile_number')}</span>
                </label>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 focus-within:bg-white focus-within:border-[#F36B0B]">
                  <span className="px-3 py-2.5 text-xs font-semibold text-stone-500 border-r border-stone-200 bg-stone-100">
                    +88
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  {t('checkoutPage.district')}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  {t('checkoutPage.full_street_address')}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t('checkoutPage.house_road_area')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                {t('checkoutPage.delivery_note_optional')}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('checkoutPage.e_g_call_before_delivery')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
              />
            </div>
          </div>

          {/* Block 3: Payment Method */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[#252525] flex items-center gap-2 border-b border-stone-100 pb-3">
              <CreditCard className="w-4 h-4 text-[#F36B0B]" />
              <span>{t('checkoutPage.payment_method')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {enabledPayments.map((pm) => {
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active ? 'ring-1' : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                    style={active ? { borderColor: pm.color, backgroundColor: `${pm.color}12`, ['--tw-ring-color' as any]: pm.color } : undefined}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-bold" style={{ color: pm.id === 'cod' ? '#252525' : pm.color }}>
                        {tx(pm.title)}
                      </span>
                      {active && <Check className="w-4 h-4" style={{ color: pm.color }} />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">{tx(pm.description)}</p>
                  </button>
                );
              })}
            </div>

            {needsTrx && selectedPayment && (
              <div className="space-y-2 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <p className="text-xs text-stone-700">
                  {t('checkoutPage.payment_account_hint', [selectedPayment.accountNumber || ''])}
                </p>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={t('checkoutPage.transaction_id')}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl outline-none focus:border-[#F36B0B] font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Winning Summary & Voucher Box */}
        <div className="lg:col-span-5 min-w-0 lg:sticky lg:top-24 space-y-4">
          {/* Voucher / Promo Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#252525] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#F36B0B]" />
                <span>{t('checkoutPage.apply_discount_voucher')}</span>
              </h3>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] text-[#E93825] hover:underline font-semibold cursor-pointer"
                >
                  {t('checkoutPage.remove')}
                </button>
              )}
            </div>

            {/* Available / Collected Voucher Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STORE_VOUCHERS.map((v) => {
                const isApplied = appliedCoupon === v.code;
                const isCollected = collectedVouchers.includes(v.code);
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => applyVoucherCode(v.code)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isCollected
                          ? 'bg-[#FFF8F1] text-[#F36B0B] border-[#F36B0B]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#F36B0B]'
                    }`}
                  >
                    {v.code} · {tx(v.label)}
                    {isApplied ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t('checkoutPage.enter_voucher_code')}
                className="flex-1 min-w-0 px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl uppercase outline-none focus:bg-white focus:border-[#F36B0B]"
              />
              <button
                type="button"
                onClick={handleCouponSubmit}
                className="px-3.5 sm:px-4 py-2.5 bg-[#252525] hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {t('checkoutPage.apply')}
              </button>
            </div>
            {couponError && <p className="text-[11px] text-[#E93825] font-medium">{couponError}</p>}
            {appliedCoupon && voucherDiscount > 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                ✓ {t('checkoutPage.voucher_applied_extra_off', [appliedCoupon, voucherDiscount.toLocaleString()])}
              </p>
            )}
          </div>

          {/* Main Order Summary Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-[#252525] border-b border-stone-100 pb-3">
              {t('checkoutPage.order_savings_summary')}
            </h3>

            {/* Free Delivery Nudger if not yet unlocked */}
            {!isFreeDelivery ? (
              <div className="p-3 bg-[#FFF8F1] border border-orange-200/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-700">
                  <span>{t('checkoutPage.add_more_for_free_delivery')}</span>
                  <span className="font-bold text-[#F36B0B] font-mono tabular-nums">
                    ৳{(freeThreshold - subtotal).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F36B0B] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (subtotal / 2500) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t('checkoutPage.free_home_delivery_unlocked_saved', [standardDeliveryFee])}
                </span>
              </div>
            )}

            {/* Financial Rows */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              {regularTotal > subtotal && (
                <div className="flex justify-between text-stone-500">
                  <span>{t('checkoutPage.regular_retail_price')}</span>
                  <span className="line-through font-mono tabular-nums">
                    ৳{regularTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {catalogSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{t('checkoutPage.offer_markdown_savings')}</span>
                  <span className="font-mono tabular-nums">-৳{catalogSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-700 font-medium">
                <span>{t('checkoutPage.offer_subtotal')}</span>
                <span className="font-semibold text-[#252525] font-mono tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>
                    {t('checkoutPage.voucher_2', [appliedCoupon])}
                  </span>
                  <span className="font-mono tabular-nums">-৳{voucherDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-700">
                <span>{t('cartDrawer.delivery_charge')}</span>
                <span className="font-mono tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold">
                      <span className="line-through text-stone-400 mr-1.5 font-normal">
                        ৳{standardDeliveryFee}
                      </span>
                      {t('checkoutPage.free_2')}
                    </span>
                  ) : (
                    `৳${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                <span className="text-sm sm:text-base font-bold text-[#252525]">
                  {t('checkoutPage.total_payable')}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#F36B0B] font-mono tabular-nums">
                  ৳{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Net Win Recap Box */}
            {totalSavings > 0 && (
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">
                  {t('checkoutPage.total_savings_on_this_order')}
                </span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums">
                  ৳{totalSavings.toLocaleString()} ({totalWinPercent}%)
                </span>
              </div>
            )}

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting
                ? t('checkoutPage.confirming_order')
                : t('checkoutPage.confirm_place_order')}
            </button>

            {submitError && (
              <p role="alert" className="text-xs text-[#E93825] font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            {/* Concrete Zero-Risk Guarantees */}
            <div className="pt-2 space-y-2 border-t border-stone-100 text-[11px] sm:text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t('checkoutPage.open_verify_your_parcel_in_front')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#F36B0B] shrink-0" />
                <span>
                  {t('checkoutPage.7_day_free_replacement_official_brand')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
