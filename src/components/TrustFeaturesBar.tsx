import React from 'react';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';

interface TrustFeaturesBarProps {
  lang: 'bn' | 'en';
}

export const TrustFeaturesBar: React.FC<TrustFeaturesBarProps> = ({ lang }) => {
  const features = [
    {
      icon: <Truck className="w-7 h-7 text-[#F36B0B]" />,
      titleBn: 'দ্রুত হোম ডেলিভারি',
      titleEn: 'Fast Island-Wide Shipping',
      descBn: 'ঢাকা সহ ৬৪ জেলায় দ্রুত ও নিরাপদ ডেলিভারি',
      descEn: 'Reliable delivery across all 64 districts',
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#F36B0B]" />,
      titleBn: '১০০% আসল পণ্যের গ্যারান্টি',
      titleEn: '100% Authentic Products',
      descBn: 'প্রাণ-আরএফএল ও অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি',
      descEn: 'Direct from manufacturer with official warranty',
    },
    {
      icon: <Headphones className="w-7 h-7 text-[#F36B0B]" />,
      titleBn: '২৪/৭ কাস্টমার সাপোর্ট',
      titleEn: 'Dedicated Support',
      descBn: 'যেকোনো তথ্যে কল করুন: ০৯৬১৩-৭৩৭৭২৬',
      descEn: 'Call anytime at 09613-737726',
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-[#F36B0B]" />,
      titleBn: 'সহজ ৭ দিনের রিটার্ন',
      titleEn: '7-Day Easy Returns',
      descBn: 'পণ্য অপছন্দ বা সমস্যা হলে ঝামেলামুক্ত রিটার্ন',
      descEn: 'Hassle-free replacement policy',
    },
  ];

  return (
    <div className="bg-[#FFF8F1] border-y border-orange-100/80 py-8 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#252525]">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {lang === 'bn' ? item.descBn : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
