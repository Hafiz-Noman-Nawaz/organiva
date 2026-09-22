'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Utensils,
  Shirt,
  Laptop,
  Home as HomeIcon,
  Car,
} from 'lucide-react';
import { Folder } from '@/components/Folder';

interface HeroOrganivaProps {
  categories?: any[];
  products?: any[];
  onSelectSpace?: (spaceSlug: string) => void;
}

const defaultFallbackSpaces = [
  { name: 'Kitchen & Pantry', slug: 'kitchen', icon: Utensils },
  { name: 'Closet & Wardrobe', slug: 'closet', icon: Shirt },
  { name: 'Desk & Cables', slug: 'workspace', icon: Laptop },
  { name: 'Living & Entryway', slug: 'living', icon: HomeIcon },
  { name: 'Car Storage', slug: 'car', icon: Car },
];

const getCategoryIcon = (slug: string) => {
  const s = (slug || '').toLowerCase();
  if (s.includes('kitchen') || s.includes('pantry')) return Utensils;
  if (s.includes('closet') || s.includes('wardrobe')) return Shirt;
  if (s.includes('desk') || s.includes('work') || s.includes('cable')) return Laptop;
  if (s.includes('living') || s.includes('entry') || s.includes('home')) return HomeIcon;
  if (s.includes('car') || s.includes('auto')) return Car;
  return Sparkles;
};

export const HeroOrganiva = ({ categories = [], products = [], onSelectSpace }: HeroOrganivaProps) => {
  // Use dynamic categories from database / CMS if available
  const activeCategories = categories.length > 0
    ? categories.filter((c) => c.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  const displaySpaces = activeCategories.length > 0
    ? activeCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: getCategoryIcon(c.slug),
        description: c.description,
        image: c.image,
      }))
    : defaultFallbackSpaces;

  const handleSpaceClick = (slug: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('select-room-category', { detail: slug }));
    }
    if (onSelectSpace) {
      onSelectSpace(slug);
    }
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to find representative product for a category
  const findProductForCategory = (catSlug: string) => {
    const s = catSlug.toLowerCase();
    return products.find((p) => {
      const pCatSlug = (p.category?.slug || (typeof p.category === 'string' ? p.category : '')).toLowerCase();
      return pCatSlug === s || pCatSlug.includes(s) || (p.slug || '').toLowerCase().includes(s);
    });
  };

  // Top 3 categories for the interactive folder
  const topCategories = (activeCategories.length >= 3 ? activeCategories : defaultFallbackSpaces).slice(0, 3);

  const defaultPaperImages = [
    '/images/products/spintidy-main.webp',
    '/images/products/spacevault-main.webp',
    '/images/products/magdock-main.webp',
  ];

  const folderPapers = topCategories.map((cat, idx) => {
    const matchedProd = findProductForCategory(cat.slug);
    const imageSrc = cat.image || matchedProd?.images?.[0] || defaultPaperImages[idx % defaultPaperImages.length];
    const displayTitle = matchedProd?.title ? matchedProd.title.replace('Organiva ', '') : cat.name;
    const priceText = matchedProd?.salePrice || matchedProd?.price
      ? `PKR ${(matchedProd.salePrice || matchedProd.price).toLocaleString()}`
      : 'Explore Space';

    return (
      <Link
        key={cat.slug || idx}
        href={`/shop?category=${cat.slug}`}
        className="w-full h-full flex flex-col justify-between p-1.5 bg-[#FAF8F5] hover:bg-white border border-[#5B755D]/20 hover:border-[#5B755D]/50 rounded-[9px] relative overflow-hidden transition-all group/card cursor-pointer select-none"
      >
        <div className="relative w-full h-[54px] rounded-[6px] overflow-hidden bg-white shadow-2xs">
          <Image
            src={imageSrc}
            alt={cat.name}
            fill
            sizes="240px"
            className="object-cover group-hover/card:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-1 left-1 bg-black/75 text-[#8EB892] text-[4.5px] font-black uppercase px-1 py-0.5 rounded-full backdrop-blur-xs">
            {cat.name}
          </span>
        </div>
        <div className="pt-1 flex flex-col">
          <span className="text-[5.5px] font-extrabold text-[#171A18] leading-tight line-clamp-1 group-hover/card:text-[#5B755D] transition-colors">
            {displayTitle}
          </span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[5px] font-bold text-[#5B755D]">{priceText}</span>
            <span className="text-[4.5px] font-semibold text-[#7F8681] group-hover/card:text-[#171A18]">
              View Room →
            </span>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b border-[#5B755D]/10 bg-[#FAF8F5]">
      {/* Subtle architectural ambient gradient */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#EBF1EB]/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#F3EFE9] rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Tag */}
        <div className="flex flex-col items-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1EB] text-[#435845] text-xs font-bold tracking-wider uppercase border border-[#5B755D]/20 shadow-2xs">
            <Sparkles size={14} className="text-[#5B755D]" />
            <span>Modern Home Organization • Designed for Simpler Living</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Inspiring Editorial Typography & Space Selector */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171A18] tracking-tight leading-[1.08]">
              Thoughtful spaces. <br className="hidden sm:inline" />
              <span className="text-[#435845]">Calmer minds.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#525B54] leading-relaxed max-w-xl">
              Eliminate daily visual chaos with architectural, friction-free organization systems for Pakistani kitchens, closets, workspaces, and living areas.
            </p>

            {/* Quick Space Jump Pills (Dynamic from Database / CMS) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F8681] block">
                Shop by Space in Your Home:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {displaySpaces.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.slug}
                      onClick={() => handleSpaceClick(s.slug)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EBF1EB] text-[#2E332F] hover:text-[#171A18] text-xs font-bold border border-[#5B755D]/15 hover:border-[#5B755D]/35 transition-all shadow-2xs cursor-pointer group"
                    >
                      <Icon size={14} className="text-[#5B755D] group-hover:scale-110 transition-transform" />
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
              <Link
                href="/shop"
                className="px-8 py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>EXPLORE ALL ORGANIZERS</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#declutter-quiz"
                className="px-6 py-4 rounded-xl bg-white hover:bg-[#F5F2ED] text-[#171A18] font-semibold text-sm text-center border border-[#5B755D]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>FIND YOUR SPACE FIX</span>
              </a>
            </div>

            {/* Nationwide Trust Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 text-xs text-[#525B54] border-t border-[#5B755D]/10">
              <div className="flex items-center gap-1.5">
                <Truck size={15} className="text-[#5B755D] shrink-0" />
                <span className="font-semibold text-[11px]">Free delivery over Rs. 3,500</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#5B755D] shrink-0" />
                <span className="font-semibold text-[11px]">Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw size={15} className="text-[#5B755D] shrink-0" />
                <span className="font-semibold text-[11px]">7-Day Replacement</span>
              </div>
            </div>
          </div>

          {/* Right: Dynamic React Bits Interactive Space Folio (Hover-triggered, Database/CMS alterable) */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[480px] sm:min-h-[540px] w-full select-none py-6">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#EBF1EB]/70 blur-3xl" />
            </div>

            {/* Folder Header Hint */}
            <div className="mb-6 sm:mb-8 text-center relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#435845] text-[11px] font-bold uppercase tracking-wider border border-[#5B755D]/20 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B755D] animate-ping" />
                <span>Interactive Category Folio</span>
              </span>
              <p className="text-xs text-[#525B54] mt-1.5 font-medium">
                <span className="hidden lg:inline">Hover over the Organiva folio to reveal curated room categories</span>
                <span className="lg:hidden">Scroll down or tap the folio to reveal room categories</span>
              </p>
            </div>

            {/* The Folder Component (Closed by default, opens cleanly on hover) */}
            <div className="relative z-20 flex items-center justify-center my-auto py-6">
              <Folder
                color="#5B755D"
                size={2.7}
                defaultOpen={false}
                openOnHover={true}
                label="ORGANIVA SPACES"
                items={folderPapers}
              />
            </div>

            {/* Bottom space quick tags (Dynamic from CMS categories) */}
            <div className="mt-8 flex items-center justify-center gap-2 relative z-10 flex-wrap">
              <span className="text-[11px] text-[#7F8681]">Featuring:</span>
              {topCategories.map((c: any) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="text-[11px] font-bold text-[#2E332F] bg-white hover:bg-[#EBF1EB] px-2.5 py-0.5 rounded-full border border-[#5B755D]/15 hover:border-[#5B755D]/40 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
