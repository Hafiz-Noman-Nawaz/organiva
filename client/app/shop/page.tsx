import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

async function getProducts(category?: string, search?: string, sort?: string) {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?`;
    if (category && category !== 'all') url += `category=${category}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (sort) url += `sort=${sort}&`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return data.products || [];
  } catch (e) {
    console.error('Products fetch error:', e);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const currentCategory = params.category || 'all';
  const currentSearch = params.search || '';
  const currentSort = params.sort || 'default';

  const [products, categories] = await Promise.all([
    getProducts(currentCategory, currentSearch, currentSort),
    getCategories(),
  ]);

  const categoryTabs = [
    { slug: 'all', name: 'All Products' },
    ...categories.map((c: any) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Curated Essentials
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171A18] tracking-tight mt-3">
            Smart Products. Simpler Living.
          </h1>
          <p className="text-sm sm:text-base text-[#525B54] mt-2">
            Every item in the Organiva catalog is engineered to eliminate a daily frustration.
          </p>
        </div>

        {/* Category Pills & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#5B755D]/15">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryTabs.map((tab) => {
              const isSelected = currentCategory === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={`/shop?category=${tab.slug}${currentSort !== 'default' ? `&sort=${currentSort}` : ''}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#5B755D] text-white shadow-xs'
                      : 'bg-white text-[#2E332F] hover:bg-[#EBF1EB] border border-[#5B755D]/15'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* Product count */}
          <div className="text-xs text-[#7F8681] font-medium">
            Showing <strong className="text-[#171A18]">{products.length}</strong> problem-solvers
          </div>
        </div>

        {/* Active search banner */}
        {currentSearch && (
          <div className="mt-6 p-3 bg-white rounded-xl border border-[#5B755D]/20 flex items-center justify-between">
            <span className="text-xs text-[#2E332F]">
              Search results for: <strong>"{currentSearch}"</strong>
            </span>
            <Link href="/shop" className="text-xs font-bold text-[#5B755D] hover:underline">
              Clear Search
            </Link>
          </div>
        )}

        {/* Product Grid */}
        <div className="mt-8">
          {products.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-base font-bold text-[#171A18]">No products found</p>
              <p className="text-xs text-[#6B726C]">Try adjusting your search or category filters.</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 rounded-full bg-[#5B755D] text-white text-xs font-semibold"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((p: any) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
