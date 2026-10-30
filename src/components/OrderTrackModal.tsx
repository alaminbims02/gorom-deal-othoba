import React, { useState } from 'react';
import { X, Search, Truck, CheckCircle2, Clock, PackageCheck, MapPin } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders: Order[];
  lang: 'bn' | 'en';
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({
  isOpen,
  onClose,
  recentOrders,
  lang,
}) => {
  const [trackInput, setTrackInput] = useState(recentOrders[0]?.id || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(recentOrders[0] || null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackInput.trim().toUpperCase();
    const found = recentOrders.find(
      (o) => o.id.toUpperCase() === query || o.customerPhone.includes(query)
    );

    if (found) {
      setSearchedOrder(found);
      setNotFound(false);
    } else {
      // Create a simulated live sample for demo tracking if customer tests
      if (query.startsWith('OTH-') || query.length >= 6) {
        setSearchedOrder({
          id: query,
          date: 'আজ (Today)',
          items: [],
          subtotal: 3200,
          deliveryCharge: 60,
          discount: 0,
          total: 3260,
          deliveryArea: 'inside-dhaka',
          paymentMethod: 'cod',
          customerName: 'সম্মানিত গ্রাহক (Valued Customer)',
          customerPhone: '017XXXXXXXX',
          customerAddress: 'ঢাকা, বাংলাদেশ',
          district: 'ঢাকা',
          status: 'shipped',
        });
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }
  };

  const steps = [
    { titleBn: 'অর্ডার গৃহীত হয়েছে', titleEn: 'Order Placed', time: '10:30 AM', done: true, icon: CheckCircle2 },
    { titleBn: 'ওয়্যারহাউজে প্যাকিং সম্পন্ন', titleEn: 'Packed & Verified', time: '02:15 PM', done: true, icon: PackageCheck },
    { titleBn: 'ডেলিভারি রাইডারের কাছে হস্তান্তর', titleEn: 'Out for Delivery', time: '04:00 PM', done: true, icon: Truck },
    { titleBn: 'হোম ডেলিভারি ও রিসিভড', titleEn: 'Delivered', time: 'আগামীকাল', done: false, icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#F36B0B]" />
            <h3 className="text-base font-bold text-[#252525]">
              {lang === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Live Order Tracking'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Tracking Input Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              {lang === 'bn' ? 'আপনার অর্ডার ট্র্যাকিং আইডি বা মোবাইল নাম্বার দিন:' : 'Enter Order ID or Mobile Number:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="যেমন: OTH-849201"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none focus:bg-white focus:border-[#F36B0B]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ট্র্যাক' : 'Track'}
              </button>
            </div>
            {notFound && (
              <p className="text-xs text-[#E93825]">
                {lang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি দিন।' : 'Order not found. Please check your ID.'}
              </p>
            )}
          </form>

          {/* Tracking Result Progression */}
          {searchedOrder && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs">
                <div>
                  <span className="text-stone-500">{lang === 'bn' ? 'অর্ডার নং:' : 'Order ID:'}</span>{' '}
                  <span className="font-bold text-[#F36B0B] font-mono">{searchedOrder.id}</span>
                </div>
                <div className="text-stone-500 font-medium">
                  {lang === 'bn' ? 'স্ট্যাটাস: ডেলিভারির পথে' : 'Status: In Transit'}
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {steps.map((st, i) => {
                  const Icon = st.icon;
                  return (
                    <div key={i} className="relative flex items-start justify-between">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                        st.done ? 'bg-[#F36B0B] text-white' : 'bg-stone-300 text-stone-500'
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>

                      <div className="pl-2">
                        <p className={`text-xs font-bold leading-none ${st.done ? 'text-stone-900' : 'text-stone-400'}`}>
                          {lang === 'bn' ? st.titleBn : st.titleEn}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-1">
                          {st.done ? (lang === 'bn' ? 'সফলভাবে সম্পন্ন' : 'Completed') : (lang === 'bn' ? 'প্রক্রিয়াধীন' : 'Pending')}
                        </p>
                      </div>

                      <span className="text-[11px] font-mono text-stone-400">
                        {st.time}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rider / Hub Contact */}
              <div className="pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span>{lang === 'bn' ? 'ডেলিভারি পার্টনার: Gorom Deal Express' : 'Courier: Gorom Deal Express'}</span>
                <span className="font-semibold text-[#F36B0B]">📞 09613-737726</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
