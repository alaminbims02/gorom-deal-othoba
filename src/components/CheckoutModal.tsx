import React, { useState } from 'react';
import { X, CheckCircle, Truck, ShieldCheck, MapPin, Phone, User, CreditCard } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryArea: 'inside-dhaka' | 'outside-dhaka';
  discount: number;
  onOrderSuccess: (order: Order) => void;
  lang: 'bn' | 'en';
}

const DISTRICTS = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chattogram)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'সিলেট (Sylhet)',
  'বরিশাল (Barishal)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)',
  'কুমিল্লা (Cumilla)',
  'বগুড়া (Bogura)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryArea,
  discount,
  onOrderSuccess,
  lang,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা (Dhaka)');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= 2500;
  const deliveryCharge = isFreeDelivery ? 0 : (deliveryArea === 'inside-dhaka' ? 60 : 120);
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = 'OTH-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: [...items],
        subtotal,
        deliveryCharge,
        discount,
        total,
        deliveryArea,
        paymentMethod,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        district,
        status: 'confirmed',
      };

      setConfirmedOrder(newOrder);
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#F36B0B]" />
            <h3 className="text-base font-bold text-[#252525]">
              {confirmedOrder 
                ? (lang === 'bn' ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Order Placed Successfully!') 
                : (lang === 'bn' ? 'অর্ডার কনফার্মেশন ও শিপিং' : 'Shipping & Order Confirmation')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Order Confirmed Success Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-[#252525]">
                {lang === 'bn' ? 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে' : 'Thank You! Your Order is Confirmed'}
              </h4>
              <p className="text-xs text-stone-500">
                {lang === 'bn' ? 'অর্ডার ট্র্যাকিং আইডি:' : 'Order Tracking ID:'}{' '}
                <span className="font-bold font-mono text-[#F36B0B] text-sm bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {confirmedOrder.id}
                </span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
                <span className="font-semibold text-stone-900">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                <span className="font-semibold text-stone-900 text-right max-w-[200px] truncate">{confirmedOrder.customerAddress}, {confirmedOrder.district}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
                <span className="font-semibold uppercase text-[#F36B0B]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-[#252525]">
                <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                <span className="text-[#F36B0B] font-mono">৳{confirmedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {lang === 'bn' 
                ? 'আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি ভেরিফাই করবেন। ঢাকা সিটিতে ২৪-৪৮ ঘণ্টায় এবং সারাদেশে ৩-৪ দিনে ডেলিভারি সম্পন্ন হবে।' 
                : 'Our customer representative will call shortly to verify your order. Estimated delivery is 24-48 hours inside Dhaka.'}
            </p>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'bn' ? 'আপনার পুরো নাম *' : 'Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোঃ আল-আমিন"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>

              {/* Active Mobile Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'bn' ? 'মোবাইল নাম্বার (১১ ডিজিট) *' : 'Phone Number *'}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'bn' ? 'জেলা নির্বাচন করুন *' : 'District *'}</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:bg-white focus:border-[#F36B0B]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Detailed Delivery Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">
                  {lang === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) *' : 'Full Delivery Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, থানা, জেলা"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>

            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#F36B0B]" />
                <span>{lang === 'bn' ? 'পেমেন্ট মাধ্যম বেছে নিন:' : 'Select Payment Method:'}</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#F36B0B] bg-[#FFF8F1] ring-2 ring-[#F36B0B]/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#252525]">
                    {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                  </span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">
                    {lang === 'bn' ? 'হাতে পেয়ে পরিশোধ' : 'Pay when received'}
                  </span>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-[#E2136E] bg-pink-50 ring-2 ring-pink-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#E2136E]">বিকাশ (bKash)</span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">
                    {lang === 'bn' ? 'অনলাইন পেমেন্ট' : 'Fast Checkout'}
                  </span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-[#F7941D] bg-orange-50 ring-2 ring-orange-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#F7941D]">নগদ (Nagad)</span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">
                    {lang === 'bn' ? 'সহজ পেমেন্ট' : 'Easy Payment'}
                  </span>
                </button>
              </div>
            </div>

            {/* Price Preview */}
            <div className="bg-[#FFF8F1] p-3.5 rounded-xl border border-orange-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <ShieldCheck className="w-4 h-4 text-[#F36B0B]" />
                <span>{lang === 'bn' ? 'প্রাণ-আরএফএল সেন্টারের খাঁটি পণ্য নিরাপত্তা' : '100% Genuine Guaranteed'}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 mr-2">{lang === 'bn' ? 'মোট মূল্য:' : 'Total:'}</span>
                <span className="text-base font-bold text-[#F36B0B] font-mono">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting 
                ? (lang === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...') 
                : (lang === 'bn' ? 'অর্ডারটি কনফার্ম করুন' : 'Confirm & Place Order')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
