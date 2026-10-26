import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem, subtotalPaise } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 99900; // ₹999 in paise
  const progressPercent = Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalPaise);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-[#14152D]/60 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#FFF9F1] shadow-2xl flex flex-col border-l border-[#F0EBFF]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#E8E3FA] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F0EBFF] flex items-center justify-center text-[#7444FF]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#14152D]">Shopping Bag</h2>
                    <p className="text-xs text-gray-500">
                      {cart?.itemCount || 0} {cart?.itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free shipping threshold progress bar */}
              <div className="px-5 py-3 bg-[#F0EBFF]/70 border-b border-[#E8E3FA]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#14152D] mb-1.5">
                  <Truck className="w-4 h-4 text-[#7444FF]" />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      Add <strong className="text-[#7444FF]">{formatINR(remainingForFreeShipping)}</strong> more for{' '}
                      <span className="font-bold text-[#25CBB8]">FREE Delivery</span>!
                    </span>
                  ) : (
                    <span className="text-[#148376] font-semibold">🎉 You unlocked FREE Standard Delivery!</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7444FF] to-[#25CBB8] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {!cart || cart.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-[#F0EBFF] flex items-center justify-center text-[#7444FF]">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-[#14152D]">Your bag is empty</h3>
                      <p className="text-sm text-gray-500 max-w-xs mt-1">
                        Discover vibrant finds and curated collections ready for your doorstep.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                      className="mt-2"
                    >
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-[#E8E3FA] shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <Link
                                to={`/products/${item.productSlug}`}
                                onClick={() => setIsCartOpen(false)}
                                className="font-medium text-sm text-[#14152D] hover:text-[#7444FF] line-clamp-1 transition-colors"
                              >
                                {item.productName}
                              </Link>
                              <button
                                onClick={() => removeItem(item.variantId)}
                                className="text-gray-400 hover:text-[#FF6B67] transition-colors p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{item.variantTitle}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Control */}
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-[#14152D]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <span className="font-semibold text-sm text-[#14152D]">
                                {formatINR(item.lineTotalPaise)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer / Summary */}
              {cart && cart.items.length > 0 && (
                <div className="p-5 bg-white border-t border-[#E8E3FA] space-y-3.5 shadow-lg">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#14152D]">{formatINR(subtotalPaise)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Shipping</span>
                      <span className="text-[#25CBB8] font-medium">
                        {remainingForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="font-display font-bold text-base text-[#14152D]">Estimated Total</span>
                    <span className="font-display font-bold text-xl text-[#7444FF]">{formatINR(subtotalPaise)}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-glow-violet"
                    onClick={handleCheckoutClick}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
