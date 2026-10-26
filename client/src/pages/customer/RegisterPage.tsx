import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch {
      // Handled in context
    }
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
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBEA] text-[#FF6B67] flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
            Join LUMORA
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Create your account to unlock personalized recommendations and express checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Rohan Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Create Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#7444FF] focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button
            type="submit"
            variant="coral"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-glow-coral mt-2"
          >
            Create My Account
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#7444FF] hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
