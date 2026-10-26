import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';

export const WishlistPage: React.FC = () => {
  const { wishlist, isLoading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex justify-between items-end pb-4 border-b border-[#E8E3FA]">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
            My Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E3FA] p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FFEBEA] text-[#FF6B67] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#14152D]">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Tap the heart icon on any product card to save it here for later.
          </p>
          <Link to="/shop">
            <Button variant="primary">Discover Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
