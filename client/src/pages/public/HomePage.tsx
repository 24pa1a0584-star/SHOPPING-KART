import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, ShieldCheck, RefreshCw, Star, Tag } from 'lucide-react';
import { api } from '../../services/api';
import { IProduct, ICategory } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/categories'),
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-[#FFF9F1] via-[#F0EBFF]/40 to-[#FFF9F1]">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7444FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#FF6B67]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#25CBB8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E3FA] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF6B67] animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-[#14152D] uppercase">
                  New Season Collection 2026
                </span>
                <span className="text-xs font-bold text-[#7444FF] bg-[#F0EBFF] px-2 py-0.5 rounded-md">
                  HOT
                </span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#14152D] tracking-tight leading-[1.1]">
                Your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7444FF] via-[#FF6B67] to-[#25CBB8]">favourite thing</span> starts here.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover standout products, delightful finds, and everyday essentials in one seamless, colourful shopping experience tailored for Indian online shoppers.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/shop">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-glow-violet"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Collection
                  </Button>
                </Link>
                <Link to="/shop?category=electronics-audio">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Shop Audio & Smart Gear
                  </Button>
                </Link>
              </div>

              {/* Trust stats pill row */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8E3FA]/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="font-display font-bold text-2xl text-[#14152D]">100%</div>
                  <div className="text-xs text-gray-500">Genuine Brands</div>
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-[#7444FF]">₹0</div>
                  <div className="text-xs text-gray-500">Delivery above ₹999</div>
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-[#25CBB8]">7 Days</div>
                  <div className="text-xs text-gray-500">Easy Returns</div>
                </div>
              </div>
            </motion.div>

            {/* Right Showcase Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Background glowing frame */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#7444FF] via-[#FF6B67] to-[#C7F464] rounded-3xl blur-xl opacity-30 animate-pulse-glow" />

                {/* Main Card */}
                <div className="relative bg-[#14152D] rounded-3xl p-6 text-white shadow-2xl border border-white/10 overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="lime" size="sm">
                      LUMORA EXCLUSIVE
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">LUM-2026</span>
                  </div>

                  {/* Featured Product Preview */}
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 relative group mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                      alt="Aura SoundFlow Wireless ANC Headphones"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14152D] via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl text-white">
                      Aura SoundFlow Wireless ANC
                    </h3>
                    <p className="text-xs text-gray-300">
                      Concert-hall acoustics with active noise cancellation and 45h battery life.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">Special Launch Price</span>
                        <div className="font-display font-bold text-2xl text-[#C7F464]">₹4,999</div>
                      </div>
                      <Link to="/products/aura-soundflow-wireless-anc-headphones">
                        <Button variant="coral" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-[#E8E3FA] flex items-center gap-3 hidden sm:flex"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25CBB8]/20 flex items-center justify-center text-[#25CBB8]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#14152D]">Instant Express Dispatch</p>
                    <p className="text-[10px] text-gray-500">Ships in 24 hours</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#7444FF] tracking-wider uppercase">
              Curated Collections
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#14152D] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#7444FF] hover:text-[#6335E6] flex items-center gap-1 group"
          >
            Explore all categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border border-[#E8E3FA] shadow-sm hover:shadow-card-hover transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14152D]/90 via-[#14152D]/30 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <h3 className="font-display font-bold text-base group-hover:text-[#C7F464] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 font-medium">
                    {cat.productCount ? `${cat.productCount} Products` : 'Explore'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B67] tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Trending Right Now
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#14152D]">
              Featured Finds
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#7444FF] hover:text-[#6335E6] flex items-center gap-1 group"
          >
            View full catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Festive Promotion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#7444FF] via-[#FF6B67] to-[#14152D] text-white p-8 sm:p-12 overflow-hidden shadow-glow-violet">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Tag className="w-3.5 h-3.5" /> Seasonal Special Offer
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              Flat ₹500 Off with Coupon <span className="underline decoration-[#C7F464]">FESTIVE500</span>
            </h2>

            <p className="text-sm sm:text-base text-white/90">
              Upgrade your lifestyle, sound system, and wardrobe. Minimum order value ₹2,499. Apply coupon during checkout for instant savings.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="secondary" size="md" className="bg-white text-[#14152D] hover:bg-gray-100">
                  Shop Now with Offer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop with LUMORA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#7444FF] tracking-wider uppercase">
            Built for Delight
          </span>
          <h2 className="font-display font-bold text-3xl text-[#14152D] mt-1">
            Why Shop with LUMORA?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            We hold ourselves to world-class standards of design, speed, and integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm hover:shadow-card-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#14152D]">Authoritative Real-Time Inventory</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every item shown is verified in our database. Atomic concurrency checks prevent overselling, guaranteeing what you buy is truly reserved for you.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm hover:shadow-card-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEBEA] text-[#FF6B67] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#14152D]">Server-Enforced Honest Pricing</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Never worry about hidden markups or phantom cart changes. Every line item and coupon discount is calculated authoritatively in Indian Paise.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E8E3FA] shadow-sm hover:shadow-card-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E3FAF7] text-[#25CBB8] flex items-center justify-center font-bold">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#14152D]">7-Day Easy Return Policy</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              If a product isn't the perfect fit, initiate a cancellation or return with a single click. Stock is automatically returned to inventory and refunds processed safely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
