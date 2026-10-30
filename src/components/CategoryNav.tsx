import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  UtensilsCrossed, 
  CookingPot, 
  Cpu, 
  Headphones, 
  Watch, 
  Zap, 
  LayoutGrid
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  lang: 'bn' | 'en';
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'UtensilsCrossed':
      return <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'CookingPot':
      return <CookingPot className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'Cpu':
      return <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'Headphones':
      return <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'Watch':
      return <Watch className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'Zap':
      return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
    default:
      return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />;
  }
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  lang,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative group">
        
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center text-stone-700 hover:text-[#F36B0B] shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          aria-label="Previous categories"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Categories Scrollable Strip */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-2 shrink-0 group/item cursor-pointer focus:outline-none transition-transform hover:-translate-y-1"
                style={{ width: '84px' }}
              >
                {/* Circular Icon Container matching wireframe */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#F36B0B] text-white shadow-lg shadow-orange-500/30 scale-105 border-2 border-white ring-2 ring-[#F36B0B]'
                      : 'bg-[#F3F3F3] text-stone-700 hover:bg-[#FFF8F1] hover:text-[#F36B0B] border border-stone-200/80 shadow-xs'
                  }`}
                >
                  {getCategoryIcon(cat.iconName)}
                </div>

                {/* Category Label */}
                <span
                  className={`text-xs text-center font-medium leading-tight line-clamp-1 transition-colors ${
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

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center text-stone-700 hover:text-[#F36B0B] shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          aria-label="Next categories"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
