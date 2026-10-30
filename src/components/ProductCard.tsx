import React from 'react';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  lang: 'bn' | 'en';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onSelectProduct,
  onToggleWishlist,
  lang,
}) => {
  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-[#F36B0B]/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square bg-[#FBFBFB] overflow-hidden flex items-center justify-center p-4">
        
        {/* Real Product Image */}
        <img
          src={product.image}
          alt={lang === 'bn' ? product.name : product.nameEn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge in Accent Red (#E93825) */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-[#E93825] text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-xs tracking-tight">
            -{product.discountPercent}%
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-xs ${
            isWishlisted
              ? 'bg-[#E93825] text-white'
              : 'bg-white/95 text-stone-600 hover:text-[#E93825] hover:bg-white border border-stone-200'
          }`}
          title={isWishlisted ? 'উইশলিস্ট থেকে মুছুন' : 'উইশলিস্টে যোগ করুন'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Stock or Badge Tag */}
        {product.badge && (
          <div className="absolute bottom-2 left-3 text-[10px] text-stone-600 bg-white/95 px-2 py-0.5 rounded font-medium border border-stone-200/80">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Details (Zero-Pill discipline, clean editorial metadata) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Brand & Category in muted typography */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-600 truncate">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-400 truncate">{lang === 'bn' ? product.categoryNameBn : product.categoryNameEn}</span>
          </div>

          {/* Product Title */}
          <h3 
            className="text-sm font-semibold text-[#252525] group-hover:text-[#F36B0B] transition-colors line-clamp-2 leading-snug"
            title={lang === 'bn' ? product.name : product.nameEn}
          >
            {lang === 'bn' ? product.name : product.nameEn}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-stone-800 tabular-nums">{product.rating}</span>
            <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price Row (No Add-to-Cart or Buy-Now button as requested!) */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#252525] tabular-nums font-mono">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through tabular-nums font-mono">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <span className="text-xs font-semibold text-[#F36B0B] group-hover:underline flex items-center gap-0.5">
            {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'} →
          </span>
        </div>

      </div>
    </div>
  );
};
