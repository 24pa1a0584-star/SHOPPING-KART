import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IPricingQuote, IUserAddress } from '../../types';
import { formatINR } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<'DEMO' | 'RAZORPAY' | 'COD'>('DEMO');
  const [quote, setQuote] = useState<IPricingQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  // Address form fields
  const [address, setAddress] = useState<IUserAddress>({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
    isDefault: false,
  });

  const [guestEmail, setGuestEmail] = useState<string>(user?.email || '');

  // Populate default address if user has saved addresses
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({
        name: defaultAddr.name || user.name,
        phone: defaultAddr.phone || user.phone || '',
        street: defaultAddr.street,
        addressLine2: defaultAddr.addressLine2 || '',
        city: defaultAddr.city,
        state: defaultAddr.state,
        postalCode: defaultAddr.postalCode,
        country: defaultAddr.country || 'India',
        isDefault: defaultAddr.isDefault,
      });
      setGuestEmail(user.email);
    }
  }, [user]);

  // Authoritative server quote calculation whenever cart items, coupon, or shipping changes
  const calculateQuote = async (couponToApply?: string) => {
    if (!cart || cart.items.length === 0) return;
    setIsCalculating(true);
    try {
      const res = await api.post('/checkout/quote', {
        couponCode: couponToApply !== undefined ? couponToApply : couponCode,
        shippingMethod,
      });
      if (res.data.success) {
        setQuote(res.data.quote);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update price quote');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (cart && cart.items.length > 0) {
      calculateQuote();
    }
  }, [cart?.items.length, shippingMethod]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl text-[#14152D]">Your bag is currently empty</h1>
        <p className="text-sm text-gray-500">Add products to your cart before proceeding to checkout.</p>
        <Link to="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await calculateQuote(couponCode.trim());
    toast.success(`Coupon "${couponCode.toUpperCase()}" checked!`);
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    await calculateQuote('');
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!guestEmail || !guestEmail.includes('@')) {
      toast.error('Please provide a valid email address.');
      setCurrentStep(2);
      return;
    }
    if (!address.name || !address.phone || !address.street || !address.city || !address.postalCode) {
      toast.error('Please complete all required shipping address fields.');
      setCurrentStep(2);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await api.post('/checkout/order', {
        shippingAddress: address,
        paymentMethod,
        couponCode: quote?.appliedCoupon?.code || undefined,
        shippingMethod,
        guestEmail,
        guestName: address.name,
        guestPhone: address.phone,
      });

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7444FF', '#FF6B67', '#C7F464', '#25CBB8'],
        });

        // Navigate to Order Confirmation
        navigate(`/order-confirmation/${res.data.order.orderReference}`, {
          state: { order: res.data.order },
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please check stock availability and try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { number: 1, title: 'Bag Review', icon: ShoppingBag },
    { number: 2, title: 'Delivery Info', icon: MapPin },
    { number: 3, title: 'Shipping & Payment', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Header with Security Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-[#E8E3FA] gap-4">
        <div>
          <span className="text-xs font-bold text-[#7444FF] uppercase tracking-wider">
            Express Secure Checkout
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D] mt-0.5">
            Complete Your Purchase
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-[#E8E3FA] px-3.5 py-1.5 rounded-full shadow-sm">
          <Lock className="w-3.5 h-3.5 text-[#25CBB8]" /> 256-Bit SSL Encrypted
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="py-6 flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-4 max-w-md w-full">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.number < currentStep) setCurrentStep(s.number);
                  }}
                  className={`flex items-center gap-2 text-xs font-semibold select-none ${
                    isCurrent
                      ? 'text-[#7444FF]'
                      : isCompleted
                      ? 'text-[#25CBB8]'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-[#7444FF] text-white'
                        : isCompleted
                        ? 'bg-[#E3FAF7] text-[#25CBB8]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : s.number}
                  </div>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      currentStep > idx + 1 ? 'bg-[#25CBB8]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Steps (7 cols) + Authoritative Order Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4">
        {/* Step Forms */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: BAG REVIEW */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h2 className="font-display font-bold text-lg text-[#14152D]">
                    Review Your Items ({cart.items.length})
                  </h2>
                  <Link to="/shop" className="text-xs font-semibold text-[#7444FF] hover:underline">
                    Add more items
                  </Link>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.items.map((item) => (
                    <div key={item.variantId} className="py-3 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#14152D] truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{item.variantTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-[#14152D]">
                          {formatINR(item.lineTotalPaise)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  onClick={() => setCurrentStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Delivery Information
                </Button>
              </motion.div>
            )}

            {/* STEP 2: DELIVERY ADDRESS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h2 className="font-display font-bold text-lg text-[#14152D]">
                    Delivery Information
                  </h2>
                  <span className="text-xs text-gray-500">Step 2 of 3</span>
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase">
                    Order Confirmation Email
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                  />
                  <span className="text-[11px] text-gray-400">Order tracking updates will be sent here.</span>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">
                      Contact Phone (10 digits)
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase">
                    Flat, House No., Building, Apartment
                  </label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="e.g. Flat 402, Lotus Residency, 12th Main Road"
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                  />
                </div>

                {/* City, State, PIN */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">State</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="560038"
                      className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      if (!address.name || !address.phone || !address.street || !address.postalCode) {
                        toast.error('Please fill in all required shipping address fields.');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SHIPPING METHOD & PAYMENT SELECTION */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Shipping Method Option */}
                <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-base text-[#14152D]">
                    Choose Delivery Option
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                        shippingMethod === 'STANDARD'
                          ? 'border-[#7444FF] bg-[#F0EBFF]/50 text-[#14152D]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">Standard Delivery</span>
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === 'STANDARD'}
                          onChange={() => setShippingMethod('STANDARD')}
                          className="text-[#7444FF]"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Estimated 3-5 business days</p>
                      <span className="text-xs font-bold text-[#25CBB8] mt-2">
                        {quote && quote.shippingCostPaise === 0 ? 'FREE' : '₹70'}
                      </span>
                    </label>

                    <label
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                        shippingMethod === 'EXPRESS'
                          ? 'border-[#7444FF] bg-[#F0EBFF]/50 text-[#14152D]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">Express Priority</span>
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === 'EXPRESS'}
                          onChange={() => setShippingMethod('EXPRESS')}
                          className="text-[#7444FF]"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Dispatched in 24 hrs (1-2 days)</p>
                      <span className="text-xs font-bold text-[#7444FF] mt-2">₹150</span>
                    </label>
                  </div>
                </div>

                {/* Payment Method Option */}
                <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-base text-[#14152D]">
                    Select Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* DEMO Checkout */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'DEMO'
                          ? 'border-[#7444FF] bg-[#F0EBFF]/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'DEMO'}
                            onChange={() => setPaymentMethod('DEMO')}
                            className="text-[#7444FF]"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#14152D]">
                              Instant Demo Order Mode
                            </span>
                            <Badge variant="mint" size="sm" className="ml-2">
                              Fast Evaluation
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-6">
                        Simulates verified instant transaction with authentic database order persistence.
                      </p>
                    </label>

                    {/* RAZORPAY Sandbox */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'RAZORPAY'
                          ? 'border-[#7444FF] bg-[#F0EBFF]/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'RAZORPAY'}
                            onChange={() => setPaymentMethod('RAZORPAY')}
                            className="text-[#7444FF]"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#14152D]">
                              Razorpay Test Gateway (UPI / Cards / NetBanking)
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-6">
                        Official sandbox environment for India payments verification.
                      </p>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-[#7444FF] bg-[#F0EBFF]/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'COD'}
                            onChange={() => setPaymentMethod('COD')}
                            className="text-[#7444FF]"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[#14152D]">
                              Cash on Delivery (COD)
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-6">
                        Pay in cash or via UPI QR when delivery agent arrives.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Final Submit & Back */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep(2)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 shadow-glow-violet"
                    onClick={handlePlaceOrder}
                    isLoading={isPlacingOrder}
                    rightIcon={<CheckCircle className="w-5 h-5" />}
                  >
                    Place Confirmed Order ({quote ? formatINR(quote.totalPaise) : '...'})
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Authoritative Pricing Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="font-display font-bold text-lg text-[#14152D] pb-3 border-b border-gray-100">
              Authoritative Price Quote
            </h2>

            {/* Coupon Code Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Promotional Coupon Code:
              </label>
              {quote?.appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#E3FAF7] border border-[#25CBB8]/30 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#25CBB8]" />
                    <span className="font-bold text-[#148376]">{quote.appliedCoupon.code}</span>
                    <span className="text-gray-500">
                      ({quote.appliedCoupon.discountType === 'percentage'
                        ? `${quote.appliedCoupon.discountValue}% Off`
                        : `₹${quote.appliedCoupon.discountValue / 100} Flat Off`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 hover:text-red-500 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, LUMORA20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl px-3 py-2 text-xs font-mono uppercase outline-none focus:border-[#7444FF]"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Price Line Breakdown */}
            <div className="space-y-2.5 text-sm pt-2 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#14152D]">
                  {quote ? formatINR(quote.subtotalPaise) : '...'}
                </span>
              </div>

              {quote && quote.discountPaise > 0 && (
                <div className="flex justify-between text-[#FF6B67]">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatINR(quote.discountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-medium text-[#14152D]">
                  {quote
                    ? quote.shippingCostPaise === 0
                      ? 'FREE'
                      : formatINR(quote.shippingCostPaise)
                    : '...'}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated GST Tax (5%)</span>
                <span className="font-medium text-[#14152D]">
                  {quote ? formatINR(quote.taxPaise) : '...'}
                </span>
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <div>
                <span className="font-display font-bold text-lg text-[#14152D]">Final Total</span>
                <p className="text-[11px] text-gray-400">Calculated in Indian Paise</p>
              </div>
              <span className="font-display font-bold text-2xl text-[#7444FF]">
                {quote ? formatINR(quote.totalPaise) : '...'}
              </span>
            </div>

            <div className="p-3 bg-[#FFF9F1] rounded-2xl border border-[#E8E3FA] text-[11px] text-gray-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7444FF] shrink-0 mt-0.5" />
              <span>
                Atomic inventory reservation is guaranteed at the instant you click "Place Order".
                Never oversold.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
