import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSite } from '../context/SiteContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  onSelectCategory?: (catId: string) => void;
}

import type { HeroSlide as SlideItem } from '../types';

const SLIDE_DURATION_MS = 5500;

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onSelectCategory,
}) => {
  const { t, tx, slides: SLIDES } = useSite();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, currentSlide]);

  if (SLIDES.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 45) {
      if (touchDeltaX.current < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  const handleSlideAction = (slide: SlideItem) => {
    if (slide.target && onSelectCategory) {
      onSelectCategory(slide.target);
    } else {
      onShopNow();
    }
  };

  return (
    <section
      aria-label={t('heroBanner.featured_deals_carousel')}
      className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-2"
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#161616] shadow-md group select-none"
      >
        {/* Horizontal Sliding Track */}
        <div
          className="flex h-[340px] sm:h-[410px] lg:h-[460px] transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide, index) => {
            const isActive = currentSlide === index;
            return (
              <div
                key={slide.id}
                className="relative w-full h-full shrink-0 overflow-hidden"
                aria-hidden={!isActive}
              >
                {/* Full-Bleed Product Photography */}
                <img
                  src={slide.image}
                  alt={tx(slide.title)}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
                    isActive ? 'scale-100' : 'scale-105'
                  }`}
                />

                {/* Measured High-Contrast Gradient Scrim */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/15 sm:bg-gradient-to-r sm:from-black/88 sm:via-black/52 sm:to-black/10"
                  aria-hidden="true"
                />

                {/* Slide Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center px-4 pb-12 pt-6 sm:px-14 lg:px-16 sm:pb-16 max-w-2xl">
                  <div className="space-y-2.5 sm:space-y-4">
                    {/* Clean Editorial Kicker */}
                    <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#FF9248]">
                      {tx(slide.kicker)}
                    </p>

                    {/* Balanced Display Headline */}
                    <h1 className="text-xl sm:text-3xl lg:text-[40px] font-bold text-white leading-[1.2] tracking-tight text-balance">
                      {tx(slide.title)}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm lg:text-base text-stone-200/95 leading-relaxed line-clamp-2 max-w-lg">
                      {tx(slide.subtitle)}
                    </p>

                    {/* Primary Action Row */}
                    <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-5">
                      <button
                        onClick={() => handleSlideAction(slide)}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#F36B0B] hover:bg-[#e05f05] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-black/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>{tx(slide.cta)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={onShopNow}
                        className="hidden sm:inline-flex items-center text-xs sm:text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {t('heroBanner.view_hot_deals')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Compact Top-Right Prev/Next Controls */}
        <div className="sm:hidden absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={prevSlide}
            aria-label={t('heroBanner.previous_slide')}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-[#F36B0B] text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label={t('heroBanner.next_slide')}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-[#F36B0B] text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Edge Arrow Controls */}
        <button
          onClick={prevSlide}
          aria-label={t('heroBanner.previous_slide')}
          className="hidden sm:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-[#F36B0B] text-white backdrop-blur-xs border border-white/20 items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          aria-label={t('heroBanner.next_slide')}
          className="hidden sm:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-[#F36B0B] text-white backdrop-blur-xs border border-white/20 items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Interactive Slide Progress Strip */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 sm:px-14 lg:px-16 pb-3 sm:pb-4 pt-6">
          {/* Desktop Labeled Progress Tabs */}
          <div className="hidden sm:grid gap-3 lg:gap-4" style={{ gridTemplateColumns: `repeat(${SLIDES.length}, minmax(0, 1fr))` }}>
            {SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}: ${tx(slide.tab)}`}
                  className="text-left group/tab cursor-pointer focus:outline-none py-1"
                >
                  <div className="h-[3px] w-full bg-white/25 rounded-full overflow-hidden mb-1.5">
                    {isActive ? (
                      <div
                        key={`${currentSlide}-${isPaused ? 'paused' : 'play'}`}
                        className={`h-full bg-[#F36B0B] rounded-full ${
                          isPaused ? 'w-full' : 'w-full animate-hero-progress'
                        }`}
                      />
                    ) : (
                      <div className="h-full w-0 bg-white/60 group-hover/tab:w-full transition-all duration-300" />
                    )}
                  </div>
                  <span
                    className={`block text-xs truncate transition-colors ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-white/65 group-hover/tab:text-white/95 font-medium'
                    }`}
                  >
                    {tx(slide.tab)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Compact Progress Bars + Counter */}
          <div className="flex sm:hidden items-center justify-between gap-3">
            <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SLIDES.length}, minmax(0, 1fr))` }}>
              {SLIDES.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className="py-1.5 cursor-pointer focus:outline-none"
                  >
                    <div className="h-1 w-full bg-white/25 rounded-full overflow-hidden">
                      {isActive && (
                        <div
                          key={`mob-${currentSlide}-${isPaused ? 'paused' : 'play'}`}
                          className={`h-full bg-[#F36B0B] rounded-full ${
                            isPaused ? 'w-full' : 'w-full animate-hero-progress'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono tabular-nums text-white/85 shrink-0">
              {currentSlide + 1} / {SLIDES.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
