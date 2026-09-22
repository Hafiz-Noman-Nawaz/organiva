'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Star,
  Zap,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Flame,
  RotateCw,
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export const HeroDTC = ({ heroProduct }: { heroProduct: any }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const images = heroProduct?.images && heroProduct.images.length > 0
    ? heroProduct.images
    : [
        '/images/products/orbitseal-main.webp',
        '/images/products/orbitseal-fridge.webp',
        '/images/products/orbitseal-pack.webp',
      ];

  const displayPrice = heroProduct?.salePrice || 2250;
  const regularPrice = heroProduct?.price || 2850;

  const handleBuyNow = () => {
    addToCart(heroProduct, 1);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(heroProduct, 1);
    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden border-b border-[#5B755D]/10 bg-[#FAF8F5]">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EBF1EB]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#F3EFE9] rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Direct High-Conversion Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1EB] text-[#435845] text-xs font-bold tracking-wider uppercase border border-[#5B755D]/20 shadow-xs">
              <Sparkles size={14} className="text-[#5B755D]" />
              <span>Smart Everyday Problem Solvers • Pakistan</span>
            </div>

            {/* Impact Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A18] tracking-tight leading-[1.08]">
              The 2-second seal that saves your groceries.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#525B54] leading-relaxed max-w-xl">
              Tired of stale chips, broken plastic clips, and messy pantry bags? The{' '}
              <strong className="text-[#171A18]">Organiva OrbitSeal</strong> delivers instant,
              airtight heat welds and hides a precision safety cutter. Docks right onto your fridge door.
            </p>

            {/* Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#2E332F] font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B755D] shrink-0" />
                <span>Airtight seal in under 2s</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B755D] shrink-0" />
                <span>Integrated clean safety blade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B755D] shrink-0" />
                <span>Neodymium magnetic fridge dock</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#5B755D] shrink-0" />
                <span>Type-C USB rechargeable</span>
              </div>
            </div>

            {/* Pricing & Stock Ticker */}
            <div className="p-4 rounded-2xl bg-white border border-[#5B755D]/15 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#171A18]">
                    PKR {displayPrice}
                  </span>
                  <span className="text-sm text-[#7F8681] line-through">
                    PKR {regularPrice}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EBF1EB] text-[#435845] border border-[#5B755D]/20">
                    Save PKR {regularPrice - displayPrice}
                  </span>
                </div>
                <span className="text-[11px] text-[#5B755D] font-bold block mt-1">
                  Cash on Delivery Available Nationwide
                </span>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Flame size={14} className="text-amber-600 animate-pulse" />
                  <span>High Demand</span>
                </div>
                <span className="text-[10px] text-[#7F8681] block mt-1">
                  Dispatches within 24 hours
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 px-6 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-extrabold text-sm text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Zap size={18} />
                <span>BUY NOW (CASH ON DELIVERY)</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleAddToCart}
                className="py-4 px-6 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#171A18] font-bold text-sm text-center border border-[#5B755D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:border-[#5B755D]"
              >
                <ShoppingBag size={18} className="text-[#5B755D]" />
                <span>{isAdding ? 'Added!' : 'Add to Bag'}</span>
              </button>
            </div>

            {/* Social Proof & Trust Strip */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[#6B726C] border-t border-[#5B755D]/10">
              <div className="flex items-center gap-1.5">
                <div className="flex text-[#D97706]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="font-bold text-[#171A18]">4.9/5</span>
                <span>(1,200+ Pakistani homes)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Truck size={15} className="text-[#5B755D]" />
                <span>2–4 Days Nationwide Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: World-Class Photorealistic Visual Showcase (No 3D canvas) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden bg-white border border-[#5B755D]/20 shadow-xl group">
              <Image
                src={images[selectedImage]}
                alt={heroProduct?.title || 'Organiva OrbitSeal'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Floating Highlight Badges */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#5B755D]/20 shadow-sm text-xs font-bold text-[#171A18] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#5B755D]" />
                <span>Airtight in 2s</span>
              </div>

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#5B755D]/20 shadow-sm text-xs font-bold text-[#171A18] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#5B755D]" />
                <span>7-Day Replacement</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[#1F3524]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 shadow-lg text-xs flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#7CE28E] animate-ping" />
                <span className="font-medium">
                  Verified Purchase: <strong>Usman T.</strong> in Lahore just ordered
                </span>
              </div>
            </div>

            {/* Interactive Image Angle Selector */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-[#5B755D] shadow-md scale-105 ring-2 ring-[#5B755D]/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
