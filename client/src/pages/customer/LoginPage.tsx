import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error is toasted in context
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@lumora.store');
    setPassword('Admin@Lumora2026');
  };

  const fillDemoCustomer = () => {
    setEmail('customer@lumora.store');
    setPassword('Customer@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E8E3FA] shadow-xl p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center mx-auto shadow-sm">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Sign in to access your bag, saved wishlist, and orders.
          </p>
        </div>

        {/* Demo Fast-Fill Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FFF9F1] border border-[#E8E3FA] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14152D]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B67]" /> One-Click Demonstration Accounts:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-1.5 px-2.5 rounded-xl bg-white border border-[#E8E3FA] text-[11px] font-semibold text-[#7444FF] hover:bg-[#F0EBFF] transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Fill Admin
            </button>
            <button
              type="button"
              onClick={fillDemoCustomer}
              className="py-1.5 px-2.5 rounded-xl bg-white border border-[#E8E3FA] text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fill Customer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-glow-violet mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#7444FF] hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
