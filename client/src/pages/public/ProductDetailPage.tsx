import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { IProduct, IProductVariant, IReview } from '../../types';
import { formatINR, getDiscountPercentage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { ProductGallery } from '../../components/products/ProductGallery';
import { VariantSelector } from '../../components/products/VariantSelector';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod: IProduct = res.data.product;
          setProduct(prod);
          setRelatedProducts(res.data.related || []);

          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Fetch reviews
          const reviewRes = await api.get(`/reviews/products/${prod._id}`);
          if (reviewRes.data.success) {
            setReviews(reviewRes.data.reviews);
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Product not found');
        navigate('/shop');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-6 w-1/3 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const activePricePaise = selectedVariant ? selectedVariant.pricePaise : product.basePricePaise;
  const compareAtPricePaise = selectedVariant?.compareAtPricePaise;
  const discountPercent = getDiscountPercentage(activePricePaise, compareAtPricePaise);
  const availableStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    try {
      await addToCart(product._id, selectedVariant._id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    try {
      await addToCart(product._id, selectedVariant._id, quantity);
      navigate('/checkout');
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to write a product review.');
      navigate('/login');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a short review comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/products/${product._id}`, { rating, comment });
      if (res.data.success) {
        toast.success(res.data.message);
        setReviews([res.data.review, ...reviews]);
        setComment('');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/" className="hover:text-[#7444FF]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#7444FF]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {typeof product.categoryId === 'object' && (
          <>
            <Link to={`/shop?category=${product.categoryId.slug}`} className="hover:text-[#7444FF]">
              {product.categoryId.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[#14152D] truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery: 6 cols */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={
              selectedVariant && selectedVariant.images.length > 0
                ? selectedVariant.images
                : product.images
            }
            productName={product.name}
          />
        </div>

        {/* Product Info & Buy Controls: 6 cols */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Title */}
          <div>
            {typeof product.brandId === 'object' && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {product.brandId.name}
              </span>
            )}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#14152D] mt-1">
              {product.name}
            </h1>

            {/* Rating Stars & SKU */}
            <div className="flex items-center gap-4 mt-2.5">
              {product.ratingAverage > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-[#FFF9F1] px-2 py-1 rounded-lg border border-[#E8E3FA]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.ratingAverage}</span>
                  <span className="text-gray-400 font-normal">({product.ratingCount} reviews)</span>
                </div>
              )}
              {selectedVariant && (
                <span className="text-xs font-mono text-gray-400">SKU: {selectedVariant.sku}</span>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-[#FFF9F1] border border-[#E8E3FA] flex items-baseline gap-3">
            <span className="font-display font-bold text-3xl text-[#14152D]">
              {formatINR(activePricePaise)}
            </span>
            {compareAtPricePaise && compareAtPricePaise > activePricePaise && (
              <span className="text-base text-gray-400 line-through">
                {formatINR(compareAtPricePaise)}
              </span>
            )}
            {discountPercent > 0 && (
              <Badge variant="coral" size="sm" className="font-bold">
                Save {discountPercent}%
              </Badge>
            )}
            <span className="text-[11px] text-gray-400 font-medium ml-auto">
              Inclusive of all taxes
            </span>
          </div>

          {/* Stock Availability Indicator */}
          <div>
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-[#FF6B67] text-xs font-semibold border border-red-100">
                <span className="w-2 h-2 rounded-full bg-[#FF6B67]" /> Currently Out of Stock
              </div>
            ) : availableStock <= 5 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Only {availableStock} units remaining! Order soon
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E3FAF7] text-[#148376] text-xs font-semibold border border-[#25CBB8]/30">
                <span className="w-2 h-2 rounded-full bg-[#25CBB8]" /> In Stock & Ready to Dispatch
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => {
                setSelectedVariant(v);
                setQuantity(1); // Reset qty on variant switch
              }}
            />
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#14152D]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                isLoading={isAdding}
                disabled={isOutOfStock}
                className="flex-1 shadow-glow-violet"
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>

              <Button
                variant="coral"
                size="lg"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 shadow-glow-coral"
                leftIcon={<Zap className="w-5 h-5" />}
              >
                Buy Now
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`p-3.5 rounded-xl border border-gray-200 transition-all ${
                  isFavorited
                    ? 'bg-[#FFEBEA] border-[#FF6B67] text-[#FF6B67]'
                    : 'bg-white text-gray-400 hover:text-[#FF6B67] hover:border-gray-300'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#FF6B67]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
              <Truck className="w-4 h-4 text-[#7444FF] shrink-0" />
              <span>Free Delivery &gt; ₹999</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
              <RefreshCw className="w-4 h-4 text-[#FF6B67] shrink-0" />
              <span>7-Day Return</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
              <ShieldCheck className="w-4 h-4 text-[#25CBB8] shrink-0" />
              <span>100% Authentic</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-display font-semibold text-sm text-[#14152D] uppercase tracking-wider mb-2">
              Product Overview
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications Table */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-display font-semibold text-sm text-[#14152D] uppercase tracking-wider mb-3">
                Key Specifications
              </h3>
              <div className="rounded-2xl border border-[#E8E3FA] overflow-hidden divide-y divide-[#E8E3FA] text-xs">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="flex p-3 bg-white hover:bg-gray-50">
                    <span className="w-1/3 font-semibold text-gray-500">{attr.name}</span>
                    <span className="w-2/3 font-medium text-[#14152D]">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews & Form Section */}
      <section className="pt-8 border-t border-[#E8E3FA] space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-[#14152D]">Customer Reviews</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Real feedback from verified LUMORA customers
            </p>
          </div>
        </div>

        {/* Write a review box */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-[#14152D]">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rating:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-gray-600 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Experience:</label>
              <textarea
                rows={3}
                placeholder="Share what you loved about this product, quality, fit, or delivery..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-2xl p-3.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingReview}
            >
              Submit Verified Review
            </Button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-[#FFF9F1] rounded-2xl border border-[#E8E3FA]">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">No customer reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white border border-[#E8E3FA] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#14152D]">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <Badge variant="mint" size="sm">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#E8E3FA] space-y-6">
          <h2 className="font-display font-bold text-2xl text-[#14152D]">You May Also Love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
