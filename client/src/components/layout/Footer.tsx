import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Truck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#14152D] text-white pt-16 pb-24 md:pb-12 border-t border-[#1B1D3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C7F464]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-white">Express Delivery</h4>
              <p className="text-xs text-gray-400">Fast dispatch across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#25CBB8]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-white">Secure Payments</h4>
              <p className="text-xs text-gray-400">UPI, Cards & NetBanking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B67]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-white">Easy Returns</h4>
              <p className="text-xs text-gray-400">7-day hassle-free policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#7444FF]">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-white">Authentic Finds</h4>
              <p className="text-xs text-gray-400">100% verified merchandise</p>
            </div>
          </div>
        </div>

        {/* Main Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-white/10">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#7444FF] flex items-center justify-center text-white font-bold">
                L
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">LUMORA</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm mb-4 leading-relaxed">
              Discover more. Love every find. A colorful, animated, and seamless shopping destination
              for contemporary lifestyle, audio, streetwear, and home aesthetics.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>📍 Bengaluru, Karnataka, India</p>
              <p>✉️ support@lumora.store | 📞 +91 80000 12345</p>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h5 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Explore
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/shop" className="hover:text-[#C7F464] transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=electronics-audio" className="hover:text-[#C7F464] transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/shop?category=fashion-apparel" className="hover:text-[#C7F464] transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/shop?category=home-living" className="hover:text-[#C7F464] transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=accessories-wearables" className="hover:text-[#C7F464] transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Account & Help */}
          <div>
            <h5 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/orders" className="hover:text-[#25CBB8] transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-[#25CBB8] transition-colors">Account Profile</Link></li>
              <li><Link to="/faq" className="hover:text-[#25CBB8] transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-[#25CBB8] transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-[#25CBB8] transition-colors">About LUMORA</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h5 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4">
              Legal & Policies
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/shipping-policy" className="hover:text-[#FF6B67] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-[#FF6B67] transition-colors">Return Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#FF6B67] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#FF6B67] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar & Indian payment badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} LUMORA Retail Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-gray-300">
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Visa</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
