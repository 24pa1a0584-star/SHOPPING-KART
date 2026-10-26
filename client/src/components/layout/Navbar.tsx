import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import { IProduct } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=4`);
        if (res.data.success) {
          setSearchResults(res.data.products);
        }
      } catch (err) {
        // quiet error
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search and user menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Electronics', path: '/shop?category=electronics-audio' },
    { name: 'Fashion', path: '/shop?category=fashion-apparel' },
    { name: 'Home Living', path: '/shop?category=home-living' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E3FA] transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-gradient-to-r from-[#7444FF] via-[#FF6B67] to-[#25CBB8] text-white py-1 px-4 text-center text-xs font-medium tracking-wide">
        ✨ Free Standard Shipping on all orders above ₹999 | Use code <span className="font-bold underline decoration-white/50">WELCOME10</span> for 10% off
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* LUMORA Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#14152D] flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                <defs>
                  <linearGradient id="navLumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7444FF" />
                    <stop offset="50%" stopColor="#FF6B67" />
                    <stop offset="100%" stopColor="#25CBB8" />
                  </linearGradient>
                </defs>
                <path
                  d="M14 13C14 11.8954 14.8954 11 16 11H20C21.1046 11 22 11.8954 22 13V27H32C33.1046 27 34 27.8954 34 29V33C34 34.1046 33.1046 35 32 35H16C14.8954 35 14 34.1046 14 33V13Z"
                  fill="url(#navLumGrad)"
                />
                <circle cx="32" cy="16" r="4.5" fill="#C7F464" />
                <circle cx="28" cy="22" r="2.5" fill="#25CBB8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tight text-[#14152D] leading-none">
                LUMORA
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-[#7444FF] uppercase leading-tight mt-0.5">
                DISCOVER MORE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    isActive ? 'text-[#7444FF] font-semibold' : 'text-[#14152D]/80 hover:text-[#7444FF]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7444FF] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar with live popup */}
          <div ref={searchRef} className="relative flex-1 max-w-xs lg:max-w-md hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search headphones, streetwear, decor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] focus:border-[#7444FF] focus:bg-white pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Suggestions dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8E3FA] overflow-hidden z-50">
                <div className="p-2 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3">
                  Matching Products
                </div>
                {searchResults.map((item) => (
                  <Link
                    key={item._id}
                    to={`/products/${item.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-[#F0EBFF]/50 transition-colors"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#14152D] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#7444FF] font-semibold">
                        ₹{(item.basePricePaise / 100).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2 text-xs font-medium text-[#7444FF] bg-gray-50 hover:bg-[#F0EBFF] transition-colors"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Action Icons: Wishlist, Cart, User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-gray-700 hover:text-[#FF6B67] hover:bg-[#FFEBEA] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B67] text-white text-[10px] font-bold flex items-center justify-center animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl text-gray-700 hover:text-[#7444FF] hover:bg-[#F0EBFF] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7444FF] text-white text-[10px] font-bold flex items-center justify-center animate-scaleIn">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl hover:bg-[#F0EBFF] transition-colors text-sm font-medium text-[#14152D]"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#7444FF] text-white text-xs font-bold flex items-center justify-center uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden lg:inline-block max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E3FA] py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-[#14152D] truncate">{user.email}</p>
                        {isAdmin && (
                          <Badge variant="violet" size="sm" className="mt-1">
                            Administrator
                          </Badge>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#7444FF] hover:bg-[#F0EBFF]"
                        >
                          <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 text-gray-400" /> My Orders
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" /> Account Profile
                      </Link>

                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#FF6B67] hover:bg-[#FFEBEA]"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Join
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E3FA] bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-fadeIn">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9F1] border border-[#E8E3FA] pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2 rounded-xl text-sm font-medium text-[#14152D] hover:bg-[#F0EBFF] hover:text-[#7444FF]"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[#7444FF] bg-[#F0EBFF]"
              >
                🛡️ Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
