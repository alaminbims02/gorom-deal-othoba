import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedProductsSectionProps {
  products: Product[];
  wishlistIds: string[];
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  lang: 'bn' | 'en';
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'kitchen' | 'gadgets'>('all');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'kitchen') {
      return p.category === 'kitchen-appliances' || p.category === 'cookware';
    }
    if (activeTab === 'gadgets') {
      return p.category === 'gadgets' || p.category === 'audio' || p.category === 'smartwatch' || p.category === 'power-charging';
    }
    return true;
  }).slice(0, 8);

  const tabs = [
    { id: 'all', labelBn: 'সকল আইটেম', labelEn: 'All Items' },
    { id: 'kitchen', labelBn: 'কিচেন অ্যাপ্লায়েন্স ও কুকওয়্যার', labelEn: 'Kitchen & Cookware' },
    { id: 'gadgets', labelBn: 'স্মার্ট গ্যাজেটস ও অডিও', labelEn: 'Smart Gadgets & Tech' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 mb-6">
        
        {/* Left Section Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F36B0B]/10 flex items-center justify-center text-[#F36B0B]">
            <Sparkles className="w-5 h-5 text-[#F36B0B]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight">
              {lang === 'bn' ? 'টপ ট্রেন্ডিং কিচেন ও গ্যাজেটস' : 'Top Trending Kitchen & Gadgets'}
            </h2>
          </div>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F3F3] rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#F36B0B] shadow-xs'
                  : 'text-stone-600 hover:text-[#252525]'
              }`}
            >
              {lang === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products (Direct click to Single Product Page, no card buttons) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
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
