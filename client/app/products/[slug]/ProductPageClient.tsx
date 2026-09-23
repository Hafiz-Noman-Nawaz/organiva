'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, ShoppingBag, ArrowRight, Zap, Check, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { getWhatsAppUrl } from '@/lib/contact';

export const ProductPageClient = ({ product }: { product: any }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/images/placeholder-product.svg'];

  const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.salePrice && product.salePrice > 0 ? product.price : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Left: Product Image Gallery (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main Display Image */}
        <div className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden bg-white border border-[#5B755D]/20 shadow-md">
          <Image
            src={images[selectedImage]}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain p-4 sm:p-8"
            priority
          />
          {originalPrice && (
            <span className="absolute top-4 right-4 bg-[#EBF1EB] text-[#435845] text-xs font-bold px-3 py-1 rounded-full border border-[#5B755D]/20">
              Save PKR {originalPrice - displayPrice}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-all ${
                  selectedImage === idx
                    ? 'border-[#5B755D] shadow-xs scale-95'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Purchase Module (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-2 text-[#D97706] mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span className="text-xs text-[#7F8681] font-semibold">5.0 (42 Verified Reviews)</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight leading-tight">
            {product.title}
          </h1>

          {/* Short Benefit */}
          <p className="text-sm text-[#525B54] mt-2 leading-relaxed">
            {product.shortBenefit}
          </p>
        </div>

        {/* Price & Stock */}
        <div className="p-4 bg-white rounded-2xl border border-[#5B755D]/15 shadow-xs flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-[#171A18]">
              PKR {displayPrice}
            </span>
            {originalPrice && (
              <span className="text-sm text-[#7F8681] line-through">
                PKR {originalPrice}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#5B755D] bg-[#EBF1EB] px-2.5 py-1 rounded-full border border-[#5B755D]/20">
              {product.stockStatus === 'IN_STOCK' ? '✓ In Stock' : product.stockStatus}
            </span>
            <span className="text-[10px] text-[#7F8681] block mt-1">Dispatches within 24h</span>
          </div>
        </div>

        {/* Quantity Controls & CTA Buttons */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#171A18]">Quantity:</span>
            <div className="flex items-center border border-[#5B755D]/25 rounded-xl bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-[#FAF8F5] text-[#171A18] rounded-l-xl transition-colors"
              >
                <Minus size={15} />
              </button>
              <span className="px-4 text-sm font-bold text-[#171A18]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-[#FAF8F5] text-[#171A18] rounded-r-xl transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                added
                  ? 'bg-[#1F3524] text-white border-[#1F3524]'
                  : 'bg-white text-[#171A18] border-[#5B755D]/30 hover:bg-[#FAF8F5] shadow-xs'
              }`}
            >
              {added ? <Check size={18} /> : <ShoppingBag size={18} className="text-[#5B755D]" />}
              <span>{added ? 'Added to Bag!' : 'Add to Bag'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-3.5 px-6 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Zap size={18} />
              <span>Buy Now (COD)</span>
            </button>
          </div>

          {/* 1-Click WhatsApp Quick Order (High-Converting Pakistani Standard) */}
          <a
            href={getWhatsAppUrl(`Hi Organiva! I would like to order "${product.title}" (Qty: ${quantity}, PKR ${displayPrice * quantity}) via Cash on Delivery.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 border border-[#25D366]/30 transition-all cursor-pointer"
          >
            <MessageCircle size={17} className="text-[#25D366]" />
            <span>⚡ Quick Order via WhatsApp (Instant COD Confirmation)</span>
          </a>
        </div>

        {/* Value Guarantees */}
        <div className="space-y-3 pt-4 border-t border-[#5B755D]/15 text-xs text-[#525B54]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#5B755D] shrink-0" />
            <span><strong>Cash on Delivery (COD)</strong> available nationwide across Pakistan</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck size={16} className="text-[#5B755D] shrink-0" />
            <span><strong>2–4 Days Express Delivery</strong> | Free shipping on orders over Rs. 3,500</span>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw size={16} className="text-[#5B755D] shrink-0" />
            <span><strong>7-Day Hassle-Free Replacement</strong> if defective or damaged in transit</span>
          </div>
        </div>

        {/* High-Converting Sticky Bottom Purchase Bar for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2.5 bg-white/95 backdrop-blur-md border-t border-[#5B755D]/20 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/20 shrink-0">
              <Image src={images[0]} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#171A18] truncate block max-w-[130px] sm:max-w-[180px]">
                {product.title}
              </span>
              <span className="text-xs font-black text-[#5B755D]">
                PKR {displayPrice * quantity}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={getWhatsAppUrl(`Hi Organiva! I would like to order "${product.title}" (PKR ${displayPrice * quantity}) via Cash on Delivery.`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order via WhatsApp"
              className="p-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] rounded-xl transition-all border border-[#25D366]/30 cursor-pointer"
            >
              <MessageCircle size={18} className="text-[#25D366]" />
            </a>

            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="p-2.5 bg-white border border-[#5B755D]/30 text-[#171A18] hover:bg-[#FAF8F5] rounded-xl transition-all cursor-pointer"
            >
              {added ? <Check size={18} className="text-[#1F3524]" /> : <ShoppingBag size={18} className="text-[#5B755D]" />}
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2.5 px-4 bg-[#5B755D] hover:bg-[#435845] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <Zap size={14} />
              <span>Buy (COD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
