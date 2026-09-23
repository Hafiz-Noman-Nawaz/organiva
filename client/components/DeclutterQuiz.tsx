'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

interface DeclutterQuizProps {
  products?: any[];
}

export const DeclutterQuiz = ({ products = [] }: DeclutterQuizProps) => {
  const { addToCart, openCart } = useCart();
  const [selectedId, setSelectedId] = useState('pantry');
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Helper to match products for a given room space
  const findRoomProducts = (roomKey: string) => {
    return products.filter((p) => {
      if (p.isActive === false) return false;
      const catSlug = (typeof p.category === 'object' ? p.category?.slug : p.category || '').toLowerCase();
      const catName = (typeof p.category === 'object' ? p.category?.name : '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      if (roomKey === 'pantry') {
        return catSlug.includes('kitchen') || catName.includes('kitchen') || title.includes('seal') || title.includes('turntable') || title.includes('soap');
      }
      if (roomKey === 'wardrobe') {
        return catSlug.includes('closet') || catName.includes('closet') || title.includes('vacuum') || title.includes('cube') || title.includes('light');
      }
      if (roomKey === 'workspace') {
        return catSlug.includes('workspace') || catSlug.includes('desk') || catName.includes('desk') || title.includes('cable') || title.includes('cord');
      }
      if (roomKey === 'entryway') {
        return catSlug.includes('living') || catSlug.includes('car') || title.includes('dock') || title.includes('key') || title.includes('mount');
      }
      return false;
    });
  };

  const declutterOptions = useMemo(() => {
    const pantryProds = findRoomProducts('pantry').slice(0, 2);
    const wardrobeProds = findRoomProducts('wardrobe').slice(0, 2);
    const workspaceProds = findRoomProducts('workspace').slice(0, 2);
    const entrywayProds = findRoomProducts('entryway').slice(0, 2);

    return [
      {
        id: 'pantry',
        roomTitle: 'Kitchen & Pantry',
        problemText: 'Stale food bags, floppy clips, and knocked-over spice jars in deep cabinets.',
        icon: Utensils,
        recommendationTitle: 'Kitchen & Pantry Systems',
        recommendationText: 'Airtight bag preservation and 360° rotating access bring effortless order to food preparation.',
        products: pantryProds.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '/images/placeholder-product.svg',
          regularPrice: p.price,
          salePrice: p.salePrice || p.price,
        })),
      },
      {
        id: 'wardrobe',
        roomTitle: 'Closet & Wardrobe',
        problemText: 'Overflowing winter duvets, blankets, and unlit dark closets with zero shelf space.',
        icon: Shirt,
        recommendationTitle: 'Closet & Wardrobe Systems',
        recommendationText: 'Reclaim up to 80% volume with compression storage and illuminate dark spaces without wiring.',
        products: wardrobeProds.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '/images/products/spacevault-main.webp',
          regularPrice: p.price,
          salePrice: p.salePrice || p.price,
        })),
      },
      {
        id: 'workspace',
        roomTitle: 'Desk & Cables',
        problemText: 'Charging cords sliding off desk edges and tangled wire nests around power points.',
        icon: Laptop,
        recommendationTitle: 'Clean Desk & Workspace Gear',
        recommendationText: 'Magnetic cable anchors and clean charging setups keep cords accessible at fingertip level.',
        products: workspaceProds.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '/images/products/cablegrid-main.webp',
          regularPrice: p.price,
          salePrice: p.salePrice || p.price,
        })),
      },
      {
        id: 'entryway',
        roomTitle: 'Living & Entryway',
        problemText: 'Misplaced house and car keys, sunglasses, and mail scattered across tables.',
        icon: Key,
        recommendationTitle: 'Calm Entryway Solutions',
        recommendationText: 'Minimalist wall stations with concealed magnetic key docks give your everyday essentials a permanent home.',
        products: entrywayProds.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '/images/products/magdock-main.webp',
          regularPrice: p.price,
          salePrice: p.salePrice || p.price,
        })),
      },
    ];
  }, [products]);

  const activeOption = declutterOptions.find((o) => o.id === selectedId) || declutterOptions[0];

  const bundleTotalRegular = activeOption.products.reduce((acc, p) => acc + p.regularPrice, 0);
  const bundleTotalSale = activeOption.products.reduce((acc, p) => acc + p.salePrice, 0);
  const totalSavings = bundleTotalRegular - bundleTotalSale;

  const handleAddAllToCart = () => {
    setIsAddingAll(true);
    activeOption.products.forEach((p: any) => {
      addToCart(
        {
          _id: p.id,
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

        {/* Recommendation Panel */}
        <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs max-w-4xl mx-auto p-6 sm:p-10 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B755D] bg-[#EBF1EB] px-2.5 py-0.5 rounded-full border border-[#5B755D]/20">
                  Tailored Prescription
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171A18] mt-1">
                {activeOption.recommendationTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#525B54] mt-1 max-w-xl">
                {activeOption.recommendationText}
              </p>
            </div>

            {activeOption.products.length > 0 && (
              <div className="shrink-0 flex items-baseline gap-2 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#5B755D]/15">
                <div>
                  <span className="text-[10px] text-[#7F8681] block">Curated Set:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-[#171A18]">
                      PKR {bundleTotalSale.toLocaleString()}
                    </span>
                    {totalSavings > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        PKR {bundleTotalRegular.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Product Items */}
          {activeOption.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {activeOption.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-gray-100 hover:border-[#5B755D]/30 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 relative border border-gray-200">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-xs font-bold text-[#171A18] hover:text-[#5B755D] truncate block transition-colors"
                      >
                        {p.title}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs font-black text-[#5B755D]">
                          PKR {p.salePrice.toLocaleString()}
                        </span>
                        {p.salePrice < p.regularPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            PKR {p.regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-[#525B54]">
                  <CheckCircle2 size={15} className="text-[#5B755D]" />
                  <span>Includes Cash on Delivery + 7-Day Replacement Guarantee</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href={`/shop?category=${activeOption.id}`}
                    className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View All in Space
                  </Link>

                  <button
                    onClick={handleAddAllToCart}
                    disabled={isAddingAll}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isAddingAll ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>Add Solution Set to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Sparkles size={28} className="mx-auto text-[#5B755D]" />
              <p className="text-xs text-[#525B54] max-w-sm mx-auto">
                We are actively uploading curated organizers for this space. Explore all available items in the shop.
              </p>
              <Link
                href="/shop"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#5B755D] text-white text-xs font-bold hover:bg-[#435845] transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
