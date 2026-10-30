import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  lang: 'bn' | 'en';
}

const SLIDES = [
  {
    id: 1,
    tagBn: 'গরম ডিল ধামাকা অফার',
    tagEn: 'Hot Flash Deals Sale',
    titleBn: 'সেরা কিচেন অ্যাপ্লায়েন্স ও হাই-টেক গ্যাজেটস',
    titleEn: 'Premium Kitchen Appliances & High-Tech Gadgets',
    subtitleBn: 'ভিশন এয়ার ফ্রায়ার, পাওয়ার ব্লেন্ডার, অ্যামোলেড স্মার্টওয়াচ ও নয়েজ ক্যানসেলিং হেডফোনে ৫০% পর্যন্ত বিশেষ ছাড়!',
    subtitleEn: 'Exclusive discounts on smart air fryers, 1000W blenders, ANC audio and smartwatches with official brand warranty.',
    ctaBn: 'অফারগুলো দেখুন',
    ctaEn: 'Explore Deals',
    badgeBn: '৫০% পর্যন্ত ছাড়',
    badgeEn: 'Up to 50% OFF',
    image: '/src/assets/images/hero_ecommerce_showcase_1793335872034.jpg',
  },
  {
    id: 2,
    tagBn: 'স্মার্ট কিচেন ও কুকওয়্যার',
    tagEn: 'Smart Kitchen Living',
    titleBn: 'আধুনিক রান্নাঘরের জন্য নন-স্টিক মার্বেল কুকওয়্যার',
    titleEn: 'Granite Non-Stick Cookware Sets & Blenders',
    subtitleBn: '৫-লেয়ার স্ক্র্যাচ-প্রুফ মার্বেল কোটিং, ইনডাকশন ফ্রেন্ডলি বেস ও হেভি ডিউটি কিচেন গ্যাজেটস।',
    subtitleEn: 'PFOA-free granite cookware and rapid kettles designed for everyday culinary excellence.',
    ctaBn: 'কিচেন কালেকশন',
    ctaEn: 'Shop Kitchen',
    badgeBn: 'নতুন স্টক',
    badgeEn: 'New Arrivals',
    image: '/src/assets/images/kitchen_granite_cookware_1793337110405.jpg',
  },
  {
    id: 3,
    tagBn: 'ফ্ল্যাগশিপ গ্যাজেটস কালেকশন',
    tagEn: 'Flagship Smart Gadgets',
    titleBn: 'টাইটানিয়াম স্মার্টওয়াচ ও ৬৫ ওয়াট গ্যান ফাস্ট চার্জার',
    titleEn: 'Titanium Smartwatches & 65W GaN Fast Power',
    subtitleBn: 'এমোলেড ডিসপ্লে, ব্লুটুথ কলিং ও ল্যাপটপ চার্জিং উপযোগী হাই-ক্যাপাসিটি পাওয়ার ব্যাংক।',
    subtitleEn: 'Ultra-bright AMOLED displays, true bass wireless earbuds, and 20000mAh laptop power banks.',
    ctaBn: 'গ্যাজেটস দেখুন',
    ctaEn: 'Shop Gadgets',
    badgeBn: '১০০% অরিজিনাল',
    badgeEn: '100% Genuine',
    image: '/src/assets/images/gadget_smartwatch_tws_1793337109838.jpg',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, lang }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFF8F1] border border-orange-100 shadow-sm transition-all">
        {/* Background Ambient Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-[#F36B0B]/10 blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-6 sm:gap-8 p-6 sm:p-10 lg:p-12 relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            
            {/* Tag Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#E93825] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs tracking-wide">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                {lang === 'bn' ? slide.tagBn : slide.tagEn}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium bg-white/80 px-2.5 py-1 rounded-full border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'bn' ? '১০০% অরিজিনাল গ্যারান্টি' : '100% Authentic'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#252525] tracking-tight leading-[1.15]">
              {lang === 'bn' ? slide.titleBn : slide.titleEn}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              {lang === 'bn' ? slide.subtitleBn : slide.subtitleEn}
            </p>

            {/* CTA and Dots Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              <button
                onClick={onShopNow}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>{lang === 'bn' ? slide.ctaBn : slide.ctaEn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Slider Dots */}
              <div className="flex items-center gap-2">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx 
                        ? 'w-7 bg-[#F36B0B]' 
                        : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Micro Value Proposition */}
            <div className="pt-2 sm:pt-4 border-t border-orange-100/80 flex items-center gap-4 sm:gap-6 text-xs text-stone-600">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F36B0B]" />
                {lang === 'bn' ? 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি' : 'Official Warranty'}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-[#F36B0B]">৳</span>
                {lang === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
              </span>
              <span className="hidden sm:inline">·</span>
              <span>{lang === 'bn' ? '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি' : '7-Day Easy Returns'}</span>
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-square max-h-[380px] rounded-2xl overflow-hidden bg-white/60 p-2 border border-orange-100 shadow-md">
              <img
                src={slide.image}
                alt={slide.titleEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl transition-all duration-700 hover:scale-105"
              />

              {/* Floating Discount Tag */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#E93825] to-[#F36B0B] text-white px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                <span>{lang === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
