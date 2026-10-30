import React from 'react';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';

interface PromoBannerProps {
  onExplore: () => void;
  lang: 'bn' | 'en';
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onExplore, lang }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFF8F1] border border-orange-100/90 shadow-sm">
        
        {/* Organic Orange Background Curved Accent (matching the wireframe shape) */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-tr from-[#E93825] to-[#F36B0B] opacity-85 blur-md" />
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-orange-200/50 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 sm:gap-8 p-6 sm:p-10 relative z-10">
          
          {/* Left Text details */}
          <div className="md:col-span-7 space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#E93825] text-white text-xs font-bold rounded-full shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                {lang === 'bn' ? 'এক্সক্লুসিভ কিচেন ও গ্যাজেট ফেস্টিভ্যাল' : 'Exclusive Kitchen & Tech Festival'}
              </span>
              <span className="text-xs text-stone-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F36B0B]" />
                {lang === 'bn' ? 'অরিজিনাল ব্র্যান্ড ওয়ারেন্টি' : 'Official Warranty'}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold text-[#252525] tracking-tight leading-snug">
              {lang === 'bn' 
                ? 'স্মার্ট কিচেন অ্যাপ্লায়েন্স ও হাই-টেক গ্যাজেটসে মেগা অফার' 
                : 'Mega Offers on Smart Kitchen Appliances & High-Tech Gadgets'}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 max-w-lg leading-relaxed">
              {lang === 'bn'
                ? 'ভিশন এয়ার ফ্রায়ার, পাওয়ারফুল ব্লেন্ডার, অ্যামোলেড স্মার্টওয়াচ ও এএনসি হেডফোনে পাচ্ছেন ৫০% পর্যন্ত বিশেষ ক্যাশব্যাক!'
                : 'Enjoy massive discounts on air fryers, marble cookware sets, AMOLED smartwatches & high-capacity 65W power banks.'}
            </p>

            <div className="pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>{lang === 'bn' ? 'কালেকশন দেখুন' : 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Product Showcase matching wireframe */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden bg-white/90 p-2 shadow-lg border border-orange-100">
              <img
                src="/src/assets/images/promo_kitchen_home_1793335872493.jpg"
                alt="Kitchenware and tech gadgets promo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-stone-200/80 text-xs font-bold text-[#252525]">
                {lang === 'bn' ? '৫০% পর্যন্ত ক্যাশব্যাক' : 'Up to 50% Cashback'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
