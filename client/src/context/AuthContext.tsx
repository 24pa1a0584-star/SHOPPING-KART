import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { IUser, IUserAddress } from '../types';
import { getGuestSessionId } from '../lib/utils';
import { toast } from 'sonner';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name?: string, phone?: string) => Promise<void>;
  addAddress: (address: IUserAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const mergeGuestCartAfterLogin = async () => {
    try {
      const guestSessionId = getGuestSessionId();
      if (guestSessionId) {
        await api.post('/cart/merge', { guestSessionId });
      }
    } catch (err) {
      console.warn('Cart merge after login notice:', err);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      // Auto-merge guest cart
      await mergeGuestCartAfterLogin();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      setUser(res.data.user);
      toast.success(`Welcome to LUMORA, ${res.data.user.name}!`);
      // Auto-merge guest cart
      await mergeGuestCartAfterLogin();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.info('You have been logged out.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (name?: string, phone?: string) => {
    try {
      const res = await api.put('/auth/profile', { name, phone });
      setUser(res.data.user);
      toast.success('Profile updated successfully.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const addAddress = async (address: IUserAddress) => {
    try {
      const res = await api.post('/auth/addresses', address);
      if (user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      toast.success('New delivery address saved.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      if (user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      toast.success('Address removed.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
