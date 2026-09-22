'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function CartPage() {
  const {
    cart,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    freeShippingRemaining,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const shipping = subtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 250;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
        <div className="w-20 h-20 rounded-full bg-[#EBF1EB] flex items-center justify-center text-[#5B755D] mb-4">
          <ShoppingBag size={36} />
        </div>
        <h1 className="text-2xl font-bold text-[#171A18]">Your shopping bag is empty</h1>
        <p className="text-sm text-[#525B54] mt-2 max-w-sm">
          Looks like you haven’t added any everyday problem-solvers yet.
        </p>
        <div className="mt-6">
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full bg-[#5B755D] text-white text-sm font-semibold hover:bg-[#435845] transition-all inline-block shadow-md"
          >
            Explore Organiva Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-[#171A18] tracking-tight mb-8">
          Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} items)
        </h1>

        {/* Free Shipping Progress Alert */}
        <div className="mb-8 p-4 bg-[#EBF1EB] rounded-2xl border border-[#5B755D]/20">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#1F3524] mb-2">
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-[#5B755D]" />
              {freeShippingRemaining === 0 ? (
                <span>🎉 Congratulations! You have unlocked <strong>FREE Nationwide Express Delivery</strong>.</span>
              ) : (
                <span>Add <strong>PKR {freeShippingRemaining}</strong> more to qualify for FREE Nationwide Delivery!</span>
              )}
            </span>
            <span>{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#5B755D]/20">
            <div
              className="h-full bg-[#5B755D] rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-white p-5 rounded-2xl border border-[#5B755D]/15 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/10 shrink-0">
                    <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-bold text-[#171A18] hover:text-[#5B755D] transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-[#5B755D] font-bold mt-0.5">PKR {item.price}</p>
                    <span className="text-[11px] text-[#7F8681] block mt-1">SKU: {item.sku}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#5B755D]/25 rounded-xl bg-[#FAF8F5]">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#EBF1EB] text-[#171A18] rounded-l-xl transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#171A18]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-[#EBF1EB] text-[#171A18] rounded-r-xl transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-[#171A18] min-w-20 text-right">
                    PKR {item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <Link
                href="/shop"
                className="text-xs font-bold text-[#5B755D] hover:underline flex items-center gap-1"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:underline font-medium"
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#171A18]">Order Summary</h3>

            <div className="space-y-3 text-xs sm:text-sm text-[#525B54] border-b border-[#5B755D]/10 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#171A18]">PKR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[#171A18]">
                  {shipping === 0 ? 'FREE (Nationwide)' : `PKR ${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#171A18] pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#5B755D]">PKR {total}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>

            <div className="space-y-2 pt-2 text-xs text-[#7F8681]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#5B755D]" />
                <span>Cash on Delivery available</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-[#5B755D]" />
                <span>Nationwide delivery in 2–4 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
