import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ICart } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cart: ICart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  subtotalPaise: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ICart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.warn('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, variantId: string, quantity: number = 1) => {
    try {
      const res = await api.post('/cart/items', {
        productId,
        variantId,
        quantity,
      });

      if (res.data.success) {
        setCart(res.data.cart);
        toast.success(res.data.message || 'Added to shopping bag!');
        setIsCartOpen(true); // Open drawer on addition for seamless feedback
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    try {
      const res = await api.put(`/cart/items/${variantId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      const res = await api.delete(`/cart/items/${variantId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        toast.info(res.data.message || 'Item removed from bag');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        itemCount: cart?.itemCount || 0,
        subtotalPaise: cart?.subtotalPaise || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
