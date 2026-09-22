'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { getWhatsAppUrl } from '@/lib/contact';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    subtotal,
    shippingRule,
    freeShippingThreshold,
    freeShippingProgress,
    freeShippingRemaining,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl z-10 flex flex-col border-l border-[#5B755D]/20 animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#5B755D]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#171A18]">Your Shopping Bag</h3>
            <span className="text-xs bg-[#EBF1EB] text-[#5B755D] font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[#5B755D] hover:bg-[#EBF1EB] rounded-lg transition-colors"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="px-6 py-3 bg-[#EBF1EB] border-b border-[#5B755D]/15">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1F3524] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-[#5B755D]" />
              {freeShippingRemaining === 0 ? (
                <span className="text-[#5B755D] font-bold">🎉 You unlocked FREE Nationwide Delivery!</span>
              ) : (
                <span>Add <strong>PKR {freeShippingRemaining}</strong> more for FREE shipping</span>
              )}
            </span>
            <span>{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#5B755D]/20">
            <div
              className="h-full bg-[#5B755D] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF1EB] flex items-center justify-center text-[#5B755D]">
                <Truck size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#171A18]">Your bag is empty</h4>
                <p className="text-xs text-[#6B726C] mt-1 max-w-xs">
                  Discover our everyday problem-solvers designed to simplify home, kitchen, and workspace routines.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 rounded-full bg-[#5B755D] text-white text-xs font-semibold hover:bg-[#435845] transition-colors"
              >
                Browse Problem Solvers
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="p-3.5 bg-white rounded-xl border border-[#5B755D]/15 shadow-xs flex items-center gap-3.5"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#5B755D]/10">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="text-xs font-bold text-[#171A18] hover:text-[#5B755D] transition-colors line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs font-bold text-[#5B755D] mt-0.5">
                    PKR {item.price}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#5B755D]/20 rounded-lg bg-[#FAF8F5]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-[#EBF1EB] text-[#171A18] rounded-l-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-[#171A18]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-[#EBF1EB] text-[#171A18] rounded-r-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-[#5B755D]/15 space-y-4">
            <div className="space-y-1.5 text-xs text-[#525B54]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#171A18]">PKR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span className="font-semibold text-[#171A18]">
                  {subtotal >= freeShippingThreshold ? 'FREE' : 'PKR 250'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#171A18] pt-2 border-t border-gray-100">
                <span>Estimated Total</span>
                <span className="text-[#5B755D]">
                  PKR {subtotal >= freeShippingThreshold ? subtotal : subtotal + 250}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 px-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-2 px-4 rounded-xl text-center text-xs font-semibold text-[#5B755D] hover:bg-[#EBF1EB] transition-colors block"
              >
                View Full Cart
              </Link>
              <a
                href={getWhatsAppUrl(`Hi Organiva! I would like to order the following items from my cart:\n${cart.map((i) => `• ${i.title} (Qty: ${i.quantity}) - PKR ${i.price * i.quantity}`).join('\n')}\nSubtotal: PKR ${subtotal}\nPayment: Cash on Delivery`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeCart}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 border border-[#25D366]/30 transition-all cursor-pointer"
              >
                <MessageCircle size={15} className="text-[#25D366]" />
                <span>⚡ Order Bag via WhatsApp (COD)</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#7F8681] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#5B755D]" /> Cash on Delivery Available
              </span>
              <span>•</span>
              <span>7-Day Replacement</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
