import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedProductsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
}) => {
  const { tx, settings } = useSite();
  const tabs = settings.featured.tabs;
  const [activeTab, setActiveTab] = useState(0);

  const tabCats = tabs[activeTab]?.categories || [];
  const filteredProducts = products
    .filter((p) => p.isFeatured)
    .filter((p) => tabCats.length === 0 || tabCats.includes(p.category))
    .slice(0, settings.featured.limit || 8);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-200/80 mb-4 sm:mb-6">
        
        {/* Left Section Title */}
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-6 bg-[#F36B0B] rounded-full shrink-0" aria-hidden="true" />
          <h2 className="text-lg sm:text-2xl font-bold text-[#252525] tracking-tight">
            {tx(settings.featured.title)}
          </h2>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F3F3] rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-white text-[#F36B0B] shadow-xs'
                  : 'text-stone-600 hover:text-[#252525]'
              }`}
            >
              {tx(tab.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products (Direct click to Single Product Page, no card buttons) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
        {filteredProducts.map((product) => (
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
