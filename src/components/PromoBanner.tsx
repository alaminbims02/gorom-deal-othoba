import React from 'react';
import { useSite } from '../context/SiteContext';
import { ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  onExplore: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onExplore }) => {
  const { tx, settings } = useSite();
  const promo = settings.promoBanner;
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#FFF8F1] border border-orange-200/70">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 sm:gap-8 p-4 sm:p-10">
          
          {/* Left Text details */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#F36B0B]">
              <span className="w-4 h-0.5 bg-[#F36B0B]" aria-hidden="true" />
              <span>{tx(promo.kicker)}</span>
            </div>

            <h2 className="text-lg sm:text-3xl font-bold text-[#252525] tracking-tight leading-snug">
              {tx(promo.title)}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 max-w-lg leading-relaxed">
              {tx(promo.text)}
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{tx(promo.cta)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Product Showcase */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-xl overflow-hidden bg-white p-1.5 shadow-xs border border-orange-200/70">
              <img
                src={promo.image}
                alt={tx(promo.title)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-103"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
