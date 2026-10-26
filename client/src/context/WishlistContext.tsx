import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { IProduct } from '../types';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: IProduct[];
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist.products || []);
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item._id === productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    try {
      const res = await api.post(`/wishlist/toggle/${productId}`);
      if (res.data.success) {
        const isAdded = res.data.action === 'added';
        toast.success(res.data.message);
        await refreshWishlist();
        return isAdded;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
