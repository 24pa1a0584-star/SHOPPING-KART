import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './pages/public/HomePage';
import { ShopPage } from './pages/public/ShopPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import {
  AboutPage,
  ContactPage,
  FAQPage,
  ShippingPolicyPage,
  ReturnPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/public/InfoPages';
import { Toaster } from 'sonner';

// Scroll to top automatically on route change
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCheckoutRoute = location.pathname === '/checkout';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F1] text-[#14152D]">
      <ScrollToTop />
      <Toaster position="top-right" richColors closeButton />

      {/* Show Main Storefront Navbar unless inside Admin portal */}
      {!isAdminRoute && <Navbar />}

      {/* Global Slide-Over Shopping Cart Drawer */}
      <CartDrawer />

      {/* Routes */}
      <main className="flex-1">
        <Routes>
          {/* Public Storefront */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Features */}
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderReference" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:identifier" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="py-24 text-center space-y-4">
                <h1 className="font-display font-bold text-4xl text-[#14152D]">404</h1>
                <p className="text-sm text-gray-500">The page you were looking for could not be found.</p>
                <a href="/" className="inline-block px-4 py-2 bg-[#7444FF] text-white rounded-xl text-xs font-semibold">
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Storefront Footer & Mobile Navigation */}
      {!isAdminRoute && !isCheckoutRoute && <Footer />}
      {!isAdminRoute && <BottomNav />}
    </div>
  );
};
