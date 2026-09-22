'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export interface ProductProps {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  shortBenefit: string;
  price: number;
  salePrice?: number;
  stockStatus?: string;
  images: string[];
  isHero?: boolean;
}

export const ProductCard = ({ product }: { product: ProductProps }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice = product.salePrice && product.salePrice > 0 ? product.price : null;
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : '/images/products/orbitseal-main.webp';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group organiva-card rounded-2xl overflow-hidden flex flex-col bg-white border border-[#5B755D]/15 hover:border-[#5B755D]/40 transition-all duration-300">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative w-full aspect-square bg-[#FAF8F5] overflow-hidden block">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle Category or Hero Badge */}
        {product.isHero && (
          <span className="absolute top-3 left-3 bg-[#1F3524] text-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
            Hero Problem-Solver
          </span>
        )}

        {originalPrice && (
          <span className="absolute top-3 right-3 bg-[#EBF1EB] text-[#435845] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#5B755D]/20">
            Save PKR {originalPrice - displayPrice}
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#D97706] mb-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="currentColor" />
              ))}
            </div>
            <span className="text-[11px] text-[#7F8681] ml-1 font-medium">5.0 (Verified)</span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-[#171A18] group-hover:text-[#5B755D] transition-colors line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Short Benefit */}
          <p className="text-xs text-[#525B54] mt-1 line-clamp-2 leading-relaxed">
            {product.shortBenefit}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-4 border-t border-[#5B755D]/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-extrabold text-[#171A18]">
                PKR {displayPrice}
              </span>
              {originalPrice && (
                <span className="text-xs text-[#7F8681] line-through">
                  PKR {originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#5B755D] font-medium block">
              Cash on Delivery Available
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              added
                ? 'bg-[#1F3524] text-white'
                : 'bg-[#5B755D] hover:bg-[#435845] text-white shadow-xs hover:shadow-md'
            }`}
            title="Add to Bag"
          >
            {added ? (
              <>
                <Check size={16} />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
