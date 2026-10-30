import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlashDealsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onViewAll: () => void;
  lang: 'bn' | 'en';
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  onViewAll,
  lang,
}) => {
  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const flashDealProducts = products.filter((p) => p.isFlashDeal).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Row matching the wireframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 mb-6">
        
        {/* Left Title and Timer */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E93825]/10 flex items-center justify-center text-[#E93825]">
              <Flame className="w-5 h-5 fill-[#E93825]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight">
              {lang === 'bn' ? 'গরম ডিল - কিচেন ও গ্যাজেটস' : 'Flash Deals - Kitchen & Gadgets'}
            </h2>
          </div>

          <span className="hidden sm:inline text-stone-300">|</span>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-[#FFF8F1] border border-orange-200/70 px-3 py-1.5 rounded-lg">
            <span className="text-stone-500 font-medium mr-1">{lang === 'bn' ? 'অফার শেষ হতে বাকি:' : 'Ends in:'}</span>
            <span className="bg-[#E93825] text-white px-1.5 py-0.5 rounded text-xs tabular-nums font-mono">
              {formatDigit(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-[#252525] text-white px-1.5 py-0.5 rounded text-xs tabular-nums font-mono">
              {formatDigit(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-[#252525] text-white px-1.5 py-0.5 rounded text-xs tabular-nums font-mono">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Right "View All" Button */}
        <div>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#F36B0B] hover:text-[#de5f07] hover:underline cursor-pointer group"
          >
            <span>{lang === 'bn' ? 'সব ডিল দেখুন' : 'View All Deals'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4 Product Cards Grid (No Add-to-Cart button on card) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {flashDealProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.includes(product.id)}
            onSelectProduct={onSelectProduct}
            onToggleWishlist={onToggleWishlist}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
};
