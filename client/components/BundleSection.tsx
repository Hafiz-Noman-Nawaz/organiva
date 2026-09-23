'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

interface BundleSectionProps {
  products?: any[];
}

export const BundleSection = ({ products = [] }: BundleSectionProps) => {
  const { addToCart, openCart } = useCart();
  const [addingBundle, setAddingBundle] = useState<string | null>(null);

  // Dynamically generate bundles from real active products
  const bundles = useMemo(() => {
    const active = products.filter((p) => p.isActive !== false);
    if (active.length < 2) return [];

    const generated: any[] = [];

    // Bundle 1: Flagship Duo
    const duoItems = active.slice(0, 2);
    const duoRegular = duoItems.reduce((acc, p) => acc + (p.price || p.salePrice || 0), 0);
    const duoSavings = Math.round(duoRegular * 0.18);
    const duoPrice = duoRegular - duoSavings;

    generated.push({
      id: 'flagship-duo',
      name: `${duoItems[0].title.replace('Organiva ', '')} + ${duoItems[1].title.replace('Organiva ', '')}`,
      badge: 'Best Value Duo',
      description: `Pair our bestselling ${duoItems[0].title} with the ${duoItems[1].title} for complete room decluttering and instant savings.`,
      regularPrice: duoRegular,
      bundlePrice: duoPrice,
      savings: duoSavings,
      items: duoItems.map((p) => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        image: p.images?.[0] || '/images/placeholder-product.svg',
        price: p.salePrice || p.price,
      })),
    });

    // Bundle 2: Complete Trio (if at least 3 products exist)
    if (active.length >= 3) {
      const trioItems = active.slice(0, 3);
      const trioRegular = trioItems.reduce((acc, p) => acc + (p.price || p.salePrice || 0), 0);
      const trioSavings = Math.round(trioRegular * 0.22);
      const trioPrice = trioRegular - trioSavings;

      generated.push({
        id: 'complete-trio',
        name: 'The Ultimate Room Reset Trio',
        badge: 'Top Seller • Save 22%',
        description: 'A curated three-piece architectural organization system designed to completely streamline everyday household routines.',
        regularPrice: trioRegular,
        bundlePrice: trioPrice,
        savings: trioSavings,
        items: trioItems.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '/images/products/spintidy-main.webp',
          price: p.salePrice || p.price,
        })),
      });
    }

    return generated;
  }, [products]);

  if (bundles.length === 0) {
    return null;
  }

  const handleAddBundle = (bundle: typeof bundles[0]) => {
    setAddingBundle(bundle.id);
    bundle.items.forEach((item: any) => {
      addToCart(
        {
          _id: item.id,
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

        <div className={`grid grid-cols-1 ${bundles.length > 1 ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'} gap-6 sm:gap-8`}>
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
                      Save PKR {bundle.savings.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#171A18] leading-tight">
                    {bundle.name}
                  </h3>

                  <p className="text-xs text-[#525B54] mt-2 leading-relaxed">
                    {bundle.description}
                  </p>

                  {/* Included Items List */}
                  <div className="mt-5 space-y-2.5 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F8681] block">
                      Includes {bundle.items.length} Systems:
                    </span>
                    {bundle.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-gray-100"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 relative border border-gray-100">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-xs font-bold text-[#171A18] hover:text-[#5B755D] truncate block transition-colors"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-[#7F8681]">
                            Individually: PKR {item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-[#7F8681] block">Bundle Price (Free Delivery)</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-[#171A18]">
                          PKR {bundle.bundlePrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          PKR {bundle.regularPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#5B755D]">
                      In Stock • COD
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    disabled={isAdding}
                    className="w-full py-3 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isAdding ? (
                      <>
                        <Check size={16} />
                        <span>Adding All Systems to Cart...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>Add Bundle to Cart (Save PKR {bundle.savings.toLocaleString()})</span>
                      </>
                    )}
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
