'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Utensils,
  Shirt,
  Laptop,
  Key,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

interface DeclutterOption {
  id: string;
  roomTitle: string;
  problemText: string;
  icon: any;
  recommendationTitle: string;
  recommendationText: string;
  products: {
    title: string;
    slug: string;
    image: string;
    regularPrice: number;
    salePrice: number;
  }[];
}

export const DeclutterQuiz = () => {
  const { addToCart, openCart } = useCart();
  const [selectedId, setSelectedId] = useState('pantry');
  const [isAddingAll, setIsAddingAll] = useState(false);

  const declutterOptions: DeclutterOption[] = [
    {
      id: 'pantry',
      roomTitle: 'Kitchen & Pantry',
      problemText: 'Stale chip bags, floppy plastic clips, and knocked-over spice jars in deep cabinets.',
      icon: Utensils,
      recommendationTitle: 'The 2-Piece Kitchen Pantry Reset',
      recommendationText: 'Instant airtight heat seals for all groceries paired with a 360° rotating turntable so every spice jar is in arm’s reach.',
      products: [
        {
          title: 'Organiva OrbitSeal 2-in-1 Bag Resealer',
          slug: 'orbitseal-magnetic-bag-resealer',
          image: '/images/products/orbitseal-main.webp',
          regularPrice: 2850,
          salePrice: 2250,
        },
        {
          title: 'Organiva SpinTidy 360° Turntable',
          slug: 'spintidy-360-turntable-organizer',
          image: '/images/products/spintidy-main.webp',
          regularPrice: 2950,
          salePrice: 2450,
        },
      ],
    },
    {
      id: 'wardrobe',
      roomTitle: 'Closet & Wardrobe',
      problemText: 'Overflowing winter duvets, blankets, and unlit dark closets with zero shelf space.',
      icon: Shirt,
      recommendationTitle: 'The Master Closet Declutter System',
      recommendationText: 'Reclaim 80% shelf volume with airtight vacuum cubes and illuminate dark corners with wire-free motion lighting.',
      products: [
        {
          title: 'Organiva SpaceVault Vacuum Cubes (6-Pack)',
          slug: 'spacevault-vacuum-storage-cubes',
          image: '/images/products/spacevault-main.webp',
          regularPrice: 3250,
          salePrice: 2650,
        },
        {
          title: 'Organiva AeroGlow Sensor Light',
          slug: 'aeroglow-motion-sensor-light',
          image: '/images/products/aeroglow-main.webp',
          regularPrice: 2200,
          salePrice: 1750,
        },
      ],
    },
    {
      id: 'workspace',
      roomTitle: 'Desk & Cables',
      problemText: 'Charging cords sliding off desk edges and tangled wire nests around power points.',
      icon: Laptop,
      recommendationTitle: 'The Clean Desk Focus System',
      recommendationText: 'Weighted aluminum magnetic dock anchors your phone and laptop wires right at finger level with zero cable drops.',
      products: [
        {
          title: 'Organiva CableGrid Magnetic Cord Hub',
          slug: 'cablegrid-magnetic-cord-organizer',
          image: '/images/products/cablegrid-main.webp',
          regularPrice: 1950,
          salePrice: 1550,
        },
      ],
    },
    {
      id: 'entryway',
      roomTitle: 'Living & Entryway',
      problemText: 'Misplaced house and car keys, sunglasses, and mail scattered across tables.',
      icon: Key,
      recommendationTitle: 'The Calm Entryway Station',
      recommendationText: 'Solid walnut and steel floating wall shelf with high-power hidden magnetic key suspension underneath.',
      products: [
        {
          title: 'Organiva MagDock Floating Key & Mail Shelf',
          slug: 'magdock-entryway-key-shelf',
          image: '/images/products/magdock-main.webp',
          regularPrice: 2450,
          salePrice: 1850,
        },
      ],
    },
  ];

  const activeOption = declutterOptions.find((o) => o.id === selectedId) || declutterOptions[0];

  const bundleTotalRegular = activeOption.products.reduce((acc, p) => acc + p.regularPrice, 0);
  const bundleTotalSale = activeOption.products.reduce((acc, p) => acc + p.salePrice, 0);
  const totalSavings = bundleTotalRegular - bundleTotalSale;

  const handleAddAllToCart = () => {
    setIsAddingAll(true);
    activeOption.products.forEach((p) => {
      addToCart(
        {
          title: p.title,
          slug: p.slug,
          price: p.regularPrice,
          salePrice: p.salePrice,
          images: [p.image],
        },
        1
      );
    });

    setTimeout(() => {
      setIsAddingAll(false);
      openCart();
    }, 600);
  };

  return (
    <section id="declutter-quiz" className="py-20 bg-[#FAF8F5] border-b border-[#5B755D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1EB] text-[#435845] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B755D]/20">
            <Zap size={14} className="text-[#5B755D]" />
            <span>Interactive Space Diagnoser</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171A18] tracking-tight">
            Which area in your home needs a reset?
          </h2>
          <p className="text-sm text-[#525B54] mt-2">
            Select your biggest clutter friction point to see the exact minimalist system that fixes it.
          </p>
        </div>

        {/* Room Selection Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto mb-10">
          {declutterOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedId(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#172619] text-white border-[#172619] shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-[#F5F2ED] text-[#2E332F] border-[#5B755D]/15'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/15 text-[#8EB892]' : 'bg-[#EBF1EB] text-[#5B755D]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm leading-tight">{opt.roomTitle}</h4>
                  <p
                    className={`text-[10px] mt-1 line-clamp-2 ${
                      isSelected ? 'text-[#CAD3CA]' : 'text-[#7F8681]'
                    }`}
                  >
                    {opt.problemText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Solution Showcase Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#5B755D]/20 shadow-md p-6 sm:p-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Explanation */}
            <div className="lg:max-w-md space-y-4 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3 py-1 rounded-full border border-[#5B755D]/20">
                Recommended Solution System
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight">
                {activeOption.recommendationTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#525B54] leading-relaxed">
                {activeOption.recommendationText}
              </p>

              {/* Price & Savings Pill */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15 space-y-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-[#171A18]">PKR {bundleTotalSale}</span>
                  {totalSavings > 0 && (
                    <span className="text-xs text-[#7F8681] line-through font-semibold">
                      PKR {bundleTotalRegular}
                    </span>
                  )}
                  {totalSavings > 0 && (
                    <span className="text-[10px] font-bold bg-[#EBF1EB] text-[#435845] px-2 py-0.5 rounded-full">
                      Save PKR {totalSavings}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5B755D] font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Free Express Nationwide Delivery & Cash on Delivery</span>
                </p>
              </div>

              <button
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                className="w-full py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>{isAddingAll ? 'Adding System...' : 'Get This Complete Room System'}</span>
              </button>
            </div>

            {/* Right: Products Visual Lineup */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 justify-center">
              {activeOption.products.map((prod, idx) => (
                <div
                  key={prod.slug}
                  className="w-44 bg-[#FAF8F5] rounded-2xl p-3 border border-[#5B755D]/15 shrink-0 flex flex-col justify-between text-left"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-2.5 border border-[#5B755D]/10">
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#171A18] line-clamp-2 leading-tight">
                      {prod.title}
                    </h5>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="font-black text-xs text-[#5B755D]">PKR {prod.salePrice}</span>
                      <span className="text-[10px] text-[#7F8681] line-through">
                        PKR {prod.regularPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
