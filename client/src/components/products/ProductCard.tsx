import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { IProduct } from '../../types';
import { formatINR, getDiscountPercentage } from '../../lib/utils';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';

export interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product._id);
  const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const pricePaise = product.minPricePaise || product.basePricePaise;
  const compareAtPricePaise = primaryVariant?.compareAtPricePaise;
  const discountPercent = getDiscountPercentage(pricePaise, compareAtPricePaise);

  const totalStock = product.totalStock !== undefined ? product.totalStock : (primaryVariant?.stock || 0);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= 5;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (primaryVariant && !isOutOfStock) {
      await addToCart(product._id, primaryVariant._id, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-3xl border border-[#E8E3FA] overflow-hidden flex flex-col shadow-sm hover:shadow-card-hover transition-all"
    >
      {/* Media Container */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square bg-[#F9F7FE] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <Badge variant="coral" size="sm" className="font-bold shadow-sm">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="violet" size="sm" className="shadow-sm">
              Featured
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="lime" size="sm" className="shadow-sm">
              Only {totalStock} left
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="gray" size="sm" className="shadow-sm">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Button on Top Right */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-[#FF6B67] hover:scale-110 active:scale-95 transition-all shadow-sm z-10"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <motion.div
            animate={isFavorited ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-[#FF6B67] text-[#FF6B67]' : 'text-gray-600'
              }`}
            />
          </motion.div>
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        {!isOutOfStock && primaryVariant && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block z-10">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-4 rounded-xl bg-[#14152D] hover:bg-[#7444FF] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-[#7444FF] tracking-wider uppercase">
              {typeof product.categoryId === 'object' ? product.categoryId.name : 'Catalog'}
            </span>
            {product.ratingAverage > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-[#FFF9F1] px-1.5 py-0.5 rounded-md border border-[#E8E3FA]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.ratingAverage}</span>
                <span className="text-gray-400 text-[10px]">({product.ratingCount})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-[#7444FF] transition-colors">
            <h3 className="font-display font-semibold text-sm sm:text-base text-[#14152D] line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base sm:text-lg text-[#14152D]">
                {formatINR(pricePaise)}
              </span>
              {compareAtPricePaise && compareAtPricePaise > pricePaise && (
                <span className="text-xs text-gray-400 line-through">
                  {formatINR(compareAtPricePaise)}
                </span>
              )}
            </div>
            {product.variants && product.variants.length > 1 && (
              <span className="text-[11px] text-gray-500 font-medium">
                {product.variants.length} options
              </span>
            )}
          </div>

          {/* Mobile Cart Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden w-8 h-8 rounded-xl bg-[#7444FF] text-white flex items-center justify-center hover:bg-[#6335E6] active:scale-95 disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
