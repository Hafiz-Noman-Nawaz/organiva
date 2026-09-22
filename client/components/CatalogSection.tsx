'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import {
  Utensils,
  Shirt,
  Laptop,
  Home as HomeIcon,
  Car,
  LayoutGrid,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { JellyRadio } from '@/components/JellyRadio';

export interface CatalogSectionProps {
  initialProducts: any[];
  categories?: any[];
}

const getCategoryIcon = (slug: string) => {
  const s = (slug || '').toLowerCase();
  if (s.includes('kitchen') || s.includes('pantry')) return Utensils;
  if (s.includes('closet') || s.includes('wardrobe')) return Shirt;
  if (s.includes('desk') || s.includes('work') || s.includes('cable')) return Laptop;
  if (s.includes('living') || s.includes('entry') || s.includes('home')) return HomeIcon;
  if (s.includes('car') || s.includes('auto')) return Car;
  return Sparkles;
};

export const CatalogSection = ({ initialProducts, categories = [] }: CatalogSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('curated');

  // Listen for room selection events triggered from Hero or Bento grid
  useEffect(() => {
    const handleRoomSelect = (e: any) => {
      if (e.detail) {
        setActiveCategory(e.detail);
        const el = document.getElementById('catalog-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('select-room-category', handleRoomSelect);
    return () => window.removeEventListener('select-room-category', handleRoomSelect);
  }, []);

  const defaultCategoryList = [
    { id: 'all', name: 'All Spaces', icon: LayoutGrid },
    { id: 'kitchen', name: 'Kitchen & Pantry', icon: Utensils },
    { id: 'closet', name: 'Closet & Wardrobe', icon: Shirt },
    { id: 'workspace', name: 'Desk & Workspace', icon: Laptop },
    { id: 'living', name: 'Living & Entryway', icon: HomeIcon },
    { id: 'car', name: 'Car Storage', icon: Car },
  ];

  const spaceCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      const active = categories
        .filter((c: any) => c.isActive !== false)
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((c: any) => ({
          id: c.slug,
          name: c.name,
          icon: getCategoryIcon(c.slug),
        }));
      return [{ id: 'all', name: 'All Spaces', icon: LayoutGrid }, ...active];
    }
    return defaultCategoryList;
  }, [categories]);

  // Helper to resolve product category slug
  const getProductCatSlug = (product: any): string => {
    if (!product) return '';
    if (typeof product.category === 'object' && product.category?.slug) {
      return product.category.slug.toLowerCase();
    }
    if (typeof product.category === 'string') {
      return product.category.toLowerCase();
    }
    return '';
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (activeCategory !== 'all') {
      list = list.filter((p) => {
        const cat = getProductCatSlug(p);
        return cat === activeCategory;
      });
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Curated / default: Hero first, then order
      list.sort((a, b) => (b.isHero ? 1 : 0) - (a.isHero ? 1 : 0));
    }

    return list;
  }, [initialProducts, activeCategory, sortBy]);

  // Dynamic counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialProducts.length };
    initialProducts.forEach((p) => {
      const cat = getProductCatSlug(p);
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  return (
    <section id="catalog-section" className="py-20 sm:py-28 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1EB] text-[#435845] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B755D]/20">
              <Sparkles size={13} className="text-[#5B755D]" />
              <span>Architectural Organization Systems</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight">
              Curated for Every Space
            </h2>
            <p className="text-sm text-[#525B54] mt-1 max-w-xl">
              Friction-free essentials engineered to eliminate daily mess and streamline your household routines.
            </p>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-3 py-2 rounded-xl border border-[#5B755D]/20 shadow-2xs">
            <ArrowUpDown size={14} className="text-[#5B755D]" />
            <span className="text-xs font-medium text-[#7F8681]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-[#171A18] bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="curated">Curated / Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Room Filter Menu with React Bits JellyRadio */}
        <div className="overflow-x-auto pb-4 scrollbar-none mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          <JellyRadio
            items={spaceCategories.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.id] || 0;
              return {
                value: cat.id,
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </span>
                ),
                icon: <Icon size={14} />,
              };
            })}
            value={activeCategory}
            onChange={(val) => setActiveCategory(val)}
            chipColor="#FFFFFF"
            activeColor="#5B755D"
            textColor="#2E332F"
            activeTextColor="#FFFFFF"
            size="md"
            gap={6}
            radius={9999}
            swell={0.14}
            barge={5}
            shrink={0.03}
            jelly={0.9}
            bounce={0.25}
            stagger={20}
            stiffness={560}
            className="border border-[#5B755D]/15 bg-white/60 p-1.5 rounded-full shadow-2xs backdrop-blur-xs"
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((prod: any) => (
              <ProductCard key={prod._id || prod.slug} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#5B755D]/15 p-8">
            <SlidersHorizontal size={36} className="mx-auto text-[#5B755D] mb-3" />
            <h3 className="text-lg font-bold text-[#171A18]">No products found in this space</h3>
            <p className="text-xs text-[#525B54] mt-1 max-w-sm mx-auto">
              We are expanding our catalog with newly curated home organizers every week.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#5B755D] text-white text-xs font-bold hover:bg-[#435845] transition-colors"
            >
              Show All Spaces
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-[#5B755D]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#171A18]">
              Need help choosing the right system for your space?
            </h4>
            <p className="text-xs text-[#525B54] mt-0.5">
              Take our 30-second declutter quiz or ask Orgi, our smart organizing assistant, for tailored recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-orgi-chat'));
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#171A18] text-xs font-bold border border-[#5B755D]/30 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Ask Orgi</span>
            </button>
            <a
              href="#quiz-section"
              className="px-4 py-2.5 rounded-xl bg-[#EBF1EB] hover:bg-[#DFE8DF] text-[#435845] text-xs font-bold border border-[#5B755D]/20 transition-colors"
            >
              Take Room Quiz
            </a>
            <Link
              href="/shop"
              className="px-4 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-colors"
            >
              View Full Catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
