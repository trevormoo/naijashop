import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/types';
import { cartApi } from '@/services/api';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemsCount: number;
  addToCart: (productId: number, quantity?: number, options?: Record<string, string>) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemsCount = cart?.items_count || 0;

  // Load cart on mount
  useEffect(() => {
    refreshCart().finally(() => setIsLoading(false));
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const response = await cartApi.get() as { cart: Cart };
      setCart(response.cart);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  const addToCart = useCallback(async (
    productId: number,
    quantity: number = 1,
    options?: Record<string, string>
  ) => {
    try {
      const response = await cartApi.add(productId, quantity, options) as { cart: Cart; message: string };
      setCart(response.cart);
      toast.success('Added to cart!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      throw error;
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      const response = await cartApi.update(cartItemId, quantity) as { cart: Cart; message: string };
      setCart(response.cart);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      throw error;
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      const response = await cartApi.remove(cartItemId) as { cart: Cart; message: string };
      setCart(response.cart);
      toast.success('Item removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      throw error;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartApi.clear() as { cart: Cart; message: string };
      setCart(response.cart);
      toast.success('Cart cleared');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      throw error;
    }
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      const response = await cartApi.applyCoupon(code) as { cart: Cart; message: string; discount: number };
      setCart(response.cart);
      toast.success(`Coupon applied! You saved ${response.discount}`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      return false;
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      const response = await cartApi.removeCoupon() as { cart: Cart; message: string };
      setCart(response.cart);
      toast.success('Coupon removed');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove coupon';
      toast.error(message);
      throw error;
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemsCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
