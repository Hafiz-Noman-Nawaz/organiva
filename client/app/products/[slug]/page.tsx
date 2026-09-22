import React, { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, ShieldCheck, Truck, RotateCcw, Check, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { ProductPageClient } from './ProductPageClient';
import { ProductReviewsClient } from './ProductReviewsClient';
import { ProblemSolutionSection } from '@/components/ProblemSolutionSection';

const getProduct = cache(async (slug: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/slug/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (e) {
    console.error('Error fetching product:', e);
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found | Organiva' };

  return {
    title: `${product.title} | Organiva Pakistan`,
    description: product.shortBenefit || product.description?.slice(0, 160),
    openGraph: {
      title: `${product.title} | Organiva`,
      description: product.shortBenefit,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#7F8681] mb-8">
          <Link href="/" className="hover:text-[#5B755D]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#5B755D]">Shop</Link>
          <span>/</span>
          <span className="text-[#171A18] font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* ABOVE THE FOLD HERO LAUNCH MODULE (Client Component for Gallery, Quantity, Cart, Buy Now) */}
        <ProductPageClient product={product} />

        {/* PRODUCT STORY: Problem → Solution → Benefits */}
        <div className="mt-20">
          <ProblemSolutionSection
            problemStatement={product.problemStatement}
            solutionStatement={product.solutionStatement}
            benefits={product.benefits}
          />
        </div>

        {/* PRODUCT SPECIFICATIONS TABLE */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="py-16 border-t border-[#5B755D]/15">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D]">
                  Technical Specs
                </span>
                <h3 className="text-2xl font-extrabold text-[#171A18] mt-1">
                  Product Specifications
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-[#5B755D]/15 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    {product.specifications.map((spec: any, idx: number) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-[#FAF8F5]' : 'bg-white'}
                      >
                        <td className="py-3.5 px-5 font-semibold text-[#171A18] w-2/5 border-b border-[#5B755D]/10">
                          {spec.key}
                        </td>
                        <td className="py-3.5 px-5 text-[#525B54] border-b border-[#5B755D]/10">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* DYNAMIC VERIFIED CUSTOMER REVIEWS & SUBMISSION */}
        <ProductReviewsClient
          productSlug={product.slug}
          initialRating={product.rating || 5}
          initialReviewCount={product.reviewCount || 0}
        />
      </div>
    </div>
  );
}
