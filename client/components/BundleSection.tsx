'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Sparkles, Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export const BundleSection = () => {
  const { addToCart, openCart } = useCart();
  const [addingBundle, setAddingBundle] = useState<string | null>(null);

  const bundles = [
    {
      id: 'pantry-bundle',
      name: 'The Ultimate Pantry Reset Bundle',
      badge: 'Bestselling Room Set',
      description: 'Hermetic bag resealing, 360° spice accessibility, and clean one-touch sink drainage in one complete set.',
      regularPrice: 7450,
      bundlePrice: 5650,
      savings: 1800,
      items: [
        {
          title: 'OrbitSeal 2-in-1 Magnetic Bag Sealer',
          slug: 'orbitseal-magnetic-bag-resealer',
          image: '/images/products/orbitseal-main.webp',
          price: 2250,
        },
        {
          title: 'SpinTidy 360° Rotating Turntable',
          slug: 'spintidy-360-turntable-organizer',
          image: '/images/products/spintidy-main.webp',
          price: 2450,
        },
        {
          title: 'CleanPress 2-in-1 Counter Soap Caddy',
          slug: 'cleanpress-kitchen-soap-dispenser',
          image: '/images/products/cleanpress-main.webp',
          price: 1290,
        },
      ],
    },
    {
      id: 'wardrobe-bundle',
      name: 'Master Wardrobe Space-Saver Pack',
      badge: 'Reclaims 80% Space',
      description: 'High-density vacuum compression cubes to flatten bulky bedding, paired with motion-sensor closet lighting.',
      regularPrice: 5450,
      bundlePrice: 3990,
      savings: 1460,
      items: [
        {
          title: 'SpaceVault Vacuum Cubes (Set of 6)',
          slug: 'spacevault-vacuum-storage-cubes',
          image: '/images/products/spacevault-main.webp',
          price: 2650,
        },
        {
          title: 'AeroGlow Motion-Sensor Cabinet Light',
          slug: 'aeroglow-motion-sensor-light',
          image: '/images/products/aeroglow-main.webp',
          price: 1750,
        },
      ],
    },
    {
      id: 'desk-bundle',
      name: 'Clean Desk & Commute Focus Pack',
      badge: 'Zero Wire Clutter',
      description: 'Keep your workspace cords magnetically anchored and your phone vibration-free with 15W wireless car charging.',
      regularPrice: 5400,
      bundlePrice: 3950,
      savings: 1450,
      items: [
        {
          title: 'CableGrid Magnetic Desktop Hub',
          slug: 'cablegrid-magnetic-cord-organizer',
          image: '/images/products/cablegrid-main.webp',
          price: 1550,
        },
        {
          title: 'AutoGrip 15W MagSafe Vent Mount',
          slug: 'autogrip-magsafe-car-mount',
          image: '/images/products/autogrip-main.webp',
          price: 2850,
        },
      ],
    },
  ];

  const handleAddBundle = (bundle: typeof bundles[0]) => {
    setAddingBundle(bundle.id);
    bundle.items.forEach((item) => {
      addToCart(
        {
          title: item.title,
          slug: item.slug,
          price: item.price,
          salePrice: item.price,
          images: [item.image],
        },
        1
      );
    });

    setTimeout(() => {
      setAddingBundle(null);
      openCart();
    }, 600);
  };

  return (
    <section className="py-20 bg-[#FAF8F5] border-b border-[#5B755D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Coordinated Multi-Piece Sets
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-2">
            Curated Room Reset Bundles
          </h2>
          <p className="text-sm text-[#525B54] mt-1.5">
            Everything needed to overhaul a specific room. Save up to 25% compared to purchasing individually.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {bundles.map((bundle) => {
            const isAdding = addingBundle === bundle.id;

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs hover:shadow-md transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#435845] bg-[#EBF1EB] px-2.5 py-1 rounded-full border border-[#5B755D]/20">
                      {bundle.badge}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Save PKR {bundle.savings}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#171A18] tracking-tight leading-snug">
                    {bundle.name}
                  </h3>

                  <p className="text-xs text-[#525B54] mt-2 leading-relaxed">
                    {bundle.description}
                  </p>

                  {/* Included Items Thumbnail Preview */}
                  <div className="my-6 space-y-2.5 pt-4 border-t border-[#5B755D]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8681] block">
                      Included in this Kit:
                    </span>
                    {bundle.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/10 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-[#171A18] block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-[#5B755D] font-semibold">
                            PKR {item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Pricing & Add Button */}
                <div className="pt-4 border-t border-[#5B755D]/10 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#171A18]">
                        PKR {bundle.bundlePrice}
                      </span>
                      <span className="text-xs text-[#7F8681] line-through ml-2">
                        PKR {bundle.regularPrice}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5B755D] font-bold bg-[#EBF1EB] px-2 py-0.5 rounded-full">
                      Free Shipping
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    disabled={isAdding}
                    className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>{isAdding ? 'Adding Bundle...' : 'Add Complete Set to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
