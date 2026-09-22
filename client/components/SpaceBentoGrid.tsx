'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Utensils, Shirt, Laptop, Home as HomeIcon, Car } from 'lucide-react';

interface SpaceBentoGridProps {
  categories?: any[];
  products?: any[];
  onSelectCategory?: (category: string) => void;
}

const getCategoryIcon = (slug: string) => {
  const s = (slug || '').toLowerCase();
  if (s.includes('kitchen') || s.includes('pantry')) return Utensils;
  if (s.includes('closet') || s.includes('wardrobe')) return Shirt;
  if (s.includes('desk') || s.includes('work') || s.includes('cable')) return Laptop;
  if (s.includes('living') || s.includes('entry') || s.includes('home')) return HomeIcon;
  if (s.includes('car') || s.includes('auto')) return Car;
  return Utensils;
};

export const SpaceBentoGrid = ({
  categories = [],
  products = [],
  onSelectCategory,
}: SpaceBentoGridProps) => {
  const defaultSpaces = [
    {
      title: 'Kitchen & Pantry',
      subtitle: 'Airtight bag sealers, 360° rotating spice turntables, and sink drainage caddies.',
      count: '3 Systems',
      category: 'kitchen',
      image: '/images/products/spintidy-main.webp',
      icon: Utensils,
      span: 'md:col-span-7 md:row-span-2',
      aspect: 'aspect-4/3 md:aspect-16/11',
    },
    {
      title: 'Closet & Wardrobe',
      subtitle: 'Vacuum compression cubes and motion-sensor ambient closet bars.',
      count: '2 Systems',
      category: 'closet',
      image: '/images/products/spacevault-main.webp',
      icon: Shirt,
      span: 'md:col-span-5 md:row-span-1',
      aspect: 'aspect-16/10',
    },
    {
      title: 'Desk & Workspace',
      subtitle: 'Magnetic desktop cable anchors and tangle-free charging docks.',
      count: '2 Systems',
      category: 'workspace',
      image: '/images/products/cablegrid-main.webp',
      icon: Laptop,
      span: 'md:col-span-5 md:row-span-1',
      aspect: 'aspect-16/10',
    },
    {
      title: 'Living & Entryway',
      subtitle: 'Floating magnetic key docks and minimalist mail organizers.',
      count: '2 Systems',
      category: 'living',
      image: '/images/products/magdock-main.webp',
      icon: HomeIcon,
      span: 'md:col-span-6',
      aspect: 'aspect-16/9',
    },
    {
      title: 'Car & Travel',
      subtitle: '15W MagSafe vibration-dampened wireless mounts and gap storage.',
      count: '1 System',
      category: 'car',
      image: '/images/products/autogrip-main.webp',
      icon: Car,
      span: 'md:col-span-6',
      aspect: 'aspect-16/9',
    },
  ];

  const spaces = React.useMemo(() => {
    if (!categories || categories.length === 0) return defaultSpaces;

    const active = categories
      .filter((c: any) => c.isActive !== false)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 5);

    const spans = [
      'md:col-span-7 md:row-span-2',
      'md:col-span-5 md:row-span-1',
      'md:col-span-5 md:row-span-1',
      'md:col-span-6',
      'md:col-span-6',
    ];

    const aspects = [
      'aspect-4/3 md:aspect-16/11',
      'aspect-16/10',
      'aspect-16/10',
      'aspect-16/9',
      'aspect-16/9',
    ];

    return active.map((cat: any, idx: number) => {
      const matched = products.filter((p: any) => {
        const pCat = (p.category?.slug || (typeof p.category === 'string' ? p.category : '')).toLowerCase();
        return pCat === cat.slug.toLowerCase() || pCat.includes(cat.slug.toLowerCase());
      });

      const fallback = defaultSpaces[idx % defaultSpaces.length];
      const countText = matched.length > 0 ? `${matched.length} System${matched.length > 1 ? 's' : ''}` : 'Featured Space';
      const image = cat.image || matched[0]?.images?.[0] || fallback.image;

      return {
        title: cat.name,
        subtitle: cat.description || fallback.subtitle,
        count: countText,
        category: cat.slug,
        image,
        icon: getCategoryIcon(cat.slug),
        span: spans[idx] || 'md:col-span-6',
        aspect: aspects[idx] || 'aspect-16/9',
      };
    });
  }, [categories, products]);

  return (
    <section className="py-20 bg-white border-b border-[#5B755D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3 py-1 rounded-full border border-[#5B755D]/20">
              Architectural Room Curation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-2">
              Organize by Space
            </h2>
            <p className="text-sm text-[#525B54] mt-1 max-w-xl">
              Purposeful, minimalist objects designed to bring calm and function to every room.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5B755D] hover:text-[#435845] transition-colors self-start md:self-auto"
          >
            <span>View All Everyday Solutions</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {spaces.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`${item.span} group relative rounded-3xl overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/15 hover:border-[#5B755D]/40 transition-all duration-500 shadow-xs hover:shadow-md flex flex-col justify-end p-6 sm:p-8 cursor-pointer`}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(item.category);
                  } else {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('select-room-category', { detail: item.category }));
                      const el = document.getElementById('catalog-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        return;
                      }
                    }
                    window.location.href = `/shop?category=${item.category}`;
                  }
                }}
              >
                {/* Background Image with Zoom */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Japanese Minimalist Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:from-black/90 transition-colors" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 mb-auto pb-8 flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[#171A18] shadow-xs">
                    <Icon size={18} className="text-[#5B755D]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    {item.count}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 text-white space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight group-hover:translate-x-1 transition-transform">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#D6DFD7] line-clamp-2 max-w-md leading-relaxed">
                    {item.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#8EB892] group-hover:text-white transition-colors">
                    <span>Explore Space</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
