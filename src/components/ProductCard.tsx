import React from 'react';
import { useSite } from '../context/SiteContext';
import { Heart, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onSelectProduct: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onSelectProduct,
  onToggleWishlist,
}) => {
  const { lang, t } = useSite();
  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 hover:border-[#F36B0B]/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Product Image Stage (Strict 1:1 Aspect Ratio) */}
      <div className="relative aspect-square w-full bg-[#FBFBFB] overflow-hidden flex items-center justify-center">
        
        {/* Real Product Image */}
        <img
          src={product.image}
          alt={lang === 'bn' ? product.name : product.nameEn}
          referrerPolicy="no-referrer"
          className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge in Accent Red (#E93825) */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#E93825] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs tracking-tight">
            -{product.discountPercent}%
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isWishlisted
              ? 'bg-[#E93825] text-white'
              : 'bg-white/95 text-stone-600 hover:text-[#E93825] hover:bg-white border border-stone-200'
          }`}
          title={isWishlisted ? t('common.wishlist_remove') : t('common.wishlist_add')}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Stock or Badge Tag */}
        {(product.badge || !product.inStock) && (
          <div className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 text-[9px] sm:text-[10px] text-stone-600 bg-white/95 px-1.5 sm:px-2 py-0.5 rounded font-medium border border-stone-200/80 max-w-[calc(100%-1rem)] truncate">
            {!product.inStock ? t('common.out_of_stock') : (lang === 'en' && product.badgeEn) || product.badge}
          </div>
        )}
      </div>

      {/* Product Details (Zero-Pill discipline, clean editorial metadata) */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5">
        <div>
          {/* Brand & Category in muted typography */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-stone-500 mb-1">
            <span className="font-medium text-stone-600 truncate">{product.brand}</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span className="text-stone-400 truncate hidden xs:inline">{lang === 'bn' ? product.categoryNameBn : product.categoryNameEn}</span>
          </div>

          {/* Product Title */}
          <h3 
            className="text-xs sm:text-sm font-semibold text-[#252525] group-hover:text-[#F36B0B] transition-colors line-clamp-2 leading-snug"
            title={lang === 'bn' ? product.name : product.nameEn}
          >
            {lang === 'bn' ? product.name : product.nameEn}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 tabular-nums">{product.rating}</span>
            <span className="text-[10px] sm:text-[11px] text-stone-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price Row (No Add-to-Cart or Buy-Now button as requested!) */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-lg font-bold text-[#252525] tabular-nums font-mono">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through tabular-nums font-mono">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <span className="text-[11px] sm:text-xs font-semibold text-[#F36B0B] group-hover:underline flex items-center gap-0.5 whitespace-nowrap">
            {t('productCard.view_details')} →
          </span>
        </div>

      </div>
    </div>
  );
};
