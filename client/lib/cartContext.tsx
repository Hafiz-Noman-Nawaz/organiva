'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  shortBenefit?: string;
}

export interface ShippingRuleData {
  flatRate: number;
  freeShippingThreshold: number;
  cityOverrides: { city: string; rate: number }[];
  estimatedDays?: string;
}

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingRule: ShippingRuleData;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  notification: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shippingRule, setShippingRule] = useState<ShippingRuleData>({
    flatRate: 250,
    freeShippingThreshold: 3500,
    cityOverrides: [],
    estimatedDays: '2-4 Business Days',
  });

  // Fetch active dynamic shipping rule from backend
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/orders/shipping-rule`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.shippingRule) {
          setShippingRule(data.shippingRule);
        }
      })
      .catch(() => {});
  }, []);

  const freeShippingThreshold = shippingRule.freeShippingThreshold || 3500;

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('organiva_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('organiva_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const addToCart = (product: any, quantity = 1) => {
    const finalPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const image = product.images && product.images.length > 0 ? product.images[0] : (product.image || '/images/products/orbitseal-main.webp');
    const id = product._id || product.productId || product.slug;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === id || (product.slug && item.slug === product.slug));
      if (existing) {
        return prev.map((item) =>
          (item.productId === id || (product.slug && item.slug === product.slug))
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: id,
          title: product.title,
          slug: product.slug,
          sku: product.sku || product.slug,
          price: finalPrice,
          quantity,
          image,
          shortBenefit: product.shortBenefit,
        },
      ];
    });

    showNotification(`Added ${product.title} to your bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('organiva_cart');
  };

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        shippingRule,
        freeShippingThreshold,
        freeShippingProgress,
        freeShippingRemaining,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
