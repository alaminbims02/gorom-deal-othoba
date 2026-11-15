import React, { useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const getCategoryIcon = (iconName: string) => <DynamicIcon name={iconName} className="w-5 h-5 sm:w-6 sm:h-6" />;

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { lang, categoryList: CATEGORIES } = useSite();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="relative group">
        
        {/* Left Arrow Button (Desktop/Tablet only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-stone-50 border border-stone-200 rounded-full items-center justify-center text-stone-700 hover:text-[#F36B0B] shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          aria-label="Previous categories"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Categories Scrollable Strip */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 w-[72px] sm:w-[84px] group/item cursor-pointer focus:outline-none transition-transform hover:-translate-y-1"
              >
                {/* Circular Icon Container */}
                <div
                  className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#F36B0B] text-white shadow-lg shadow-orange-500/30 scale-105 border-2 border-white ring-2 ring-[#F36B0B]'
                      : 'bg-[#F3F3F3] text-stone-700 hover:bg-[#FFF8F1] hover:text-[#F36B0B] border border-stone-200/80 shadow-xs'
                  }`}
                >
                  {getCategoryIcon(cat.iconName)}
                </div>

                {/* Category Label */}
                <span
                  className={`text-[11px] sm:text-xs text-center font-medium leading-tight line-clamp-1 transition-colors ${
                    isSelected
                      ? 'text-[#F36B0B] font-bold'
                      : 'text-stone-700 group-hover/item:text-[#F36B0B]'
                  }`}
                >
                  {lang === 'bn' ? cat.name : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button (Desktop/Tablet only) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-stone-50 border border-stone-200 rounded-full items-center justify-center text-stone-700 hover:text-[#F36B0B] shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          aria-label="Next categories"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
