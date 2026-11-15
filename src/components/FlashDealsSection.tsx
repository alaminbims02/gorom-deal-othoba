import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { Flame, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlashDealsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onViewAll: () => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  onViewAll,
}) => {
  const { t, tx, settings } = useSite();
  // Countdown to the deal end time set in WordPress. If no end time is set (or it has
  // passed), the timer loops over a rolling window of `cycleHours`.
  const computeLeft = () => {
    const now = Date.now();
    const cycleMs = Math.max(1, settings.flashDeals.cycleHours || 12) * 3600_000;
    const end = settings.flashDeals.endsAt ? new Date(settings.flashDeals.endsAt).getTime() : NaN;
    let ms = Number.isFinite(end) && end > now ? end - now : cycleMs - (now % cycleMs);
    const hours = Math.floor(ms / 3600_000);
    ms -= hours * 3600_000;
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms - minutes * 60_000) / 1000);
    return { hours, minutes, seconds };
  };
  const [timeLeft, setTimeLeft] = useState(computeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(computeLeft()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.flashDeals.endsAt, settings.flashDeals.cycleHours]);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const flashDealProducts = products.filter((p) => p.isFlashDeal).slice(0, settings.flashDeals.limit || 4);
  if (flashDealProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
      {/* Header Row matching the wireframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-200/80 mb-4 sm:mb-6">
        
        {/* Left Title and Timer */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E93825]/10 flex items-center justify-center text-[#E93825] shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#E93825]" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-[#252525] tracking-tight">
              {tx(settings.flashDeals.title)}
            </h2>
          </div>

          <span className="hidden sm:inline text-stone-300">|</span>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-stone-700 bg-[#FFF8F1] border border-orange-200/70 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <span className="text-stone-500 font-medium mr-0.5 sm:mr-1">{t('flashDealsSection.ends_in')}</span>
            <span className="bg-[#E93825] text-white px-1.5 py-0.5 rounded text-[11px] sm:text-xs tabular-nums">
              {formatDigit(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-[#252525] text-white px-1.5 py-0.5 rounded text-[11px] sm:text-xs tabular-nums">
              {formatDigit(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-[#252525] text-white px-1.5 py-0.5 rounded text-[11px] sm:text-xs tabular-nums">
              {formatDigit(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Right "View All" Button */}
        <div>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F36B0B] hover:text-[#de5f07] hover:underline cursor-pointer group"
          >
            <span>{t('flashDealsSection.view_all_deals')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4 Product Cards Grid (No Add-to-Cart button on card) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
        {flashDealProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.includes(product.id)}
            onSelectProduct={onSelectProduct}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </section>
  );
};
