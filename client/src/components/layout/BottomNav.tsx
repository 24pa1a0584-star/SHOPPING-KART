import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Compass },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    {
      label: 'Bag',
      isCart: true,
      icon: ShoppingBag,
      badge: itemCount,
    },
    { label: user ? 'Account' : 'Sign In', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8E3FA] py-2 px-3 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? location.pathname === item.path : false;

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                className="relative flex flex-col items-center py-1 px-3 text-gray-500 hover:text-[#7444FF] active:scale-95 transition-all"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#7444FF] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 leading-none">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`relative flex flex-col items-center py-1 px-3 active:scale-95 transition-all ${
                isActive ? 'text-[#7444FF]' : 'text-gray-500 hover:text-[#14152D]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#FF6B67] text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 leading-none ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
