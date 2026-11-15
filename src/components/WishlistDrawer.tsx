import React from 'react';
import { useSite } from '../context/SiteContext';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  const { lang, t } = useSite();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/55 transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFF8F1] border-b border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Heart className="w-5 h-5 text-[#E93825] fill-[#E93825] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#252525] truncate">
                {t('wishlistDrawer.my_wishlist')}
              </h2>
              <span className="bg-[#E93825] text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {wishlistProducts.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer shrink-0"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-[#E93825]">
                  <Heart className="w-8 h-8 opacity-60" />
                </div>
                <p className="font-semibold text-stone-700">
                  {t('wishlistDrawer.your_wishlist_is_empty')}
                </p>
                <p className="text-xs text-stone-400 max-w-xs">
                  {t('wishlistDrawer.click_the_heart_icon_on_any')}
                </p>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 items-center justify-between"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 aspect-square object-cover bg-white rounded-lg border border-stone-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-[#252525] line-clamp-1">
                      {lang === 'bn' ? product.name : product.nameEn}
                    </h4>
                    <span className="text-[11px] text-stone-500">{product.brand}</span>
                    <div className="text-xs font-bold text-[#F36B0B] font-mono mt-0.5">
                      ৳{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-stone-400 hover:text-[#E93825] p-1 transition-colors cursor-pointer"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onRemoveFromWishlist(product);
                      }}
                      className="px-3 py-1.5 bg-[#F36B0B] hover:bg-[#de5f07] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      <span>{t('wishlistDrawer.add_to_cart')}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200">
              <button
                onClick={() => {
                  wishlistProducts.forEach((p) => onAddToCart(p));
                  onClose();
                }}
                className="w-full py-3 bg-[#F36B0B] hover:bg-[#de5f07] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('wishlistDrawer.move_all_to_cart')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
