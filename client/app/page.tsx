import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ChevronDown } from 'lucide-react';
import { HeroOrganiva } from '@/components/HeroOrganiva';
import { SpaceBentoGrid } from '@/components/SpaceBentoGrid';
import { CatalogSection } from '@/components/CatalogSection';
import { DeclutterQuiz } from '@/components/DeclutterQuiz';
import { BeforeAfterSection } from '@/components/BeforeAfterSection';
import { BundleSection } from '@/components/BundleSection';
import { getWhatsAppUrl } from '@/lib/contact';

export const dynamic = 'force-dynamic';

// Fetch products and categories from backend with safe fallback
async function getHomeData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const [prodRes, catRes] = await Promise.all([
      fetch(`${apiUrl}/products`, { cache: 'no-store' }),
      fetch(`${apiUrl}/categories`, { cache: 'no-store' }),
    ]);

    const prodData = prodRes.ok ? await prodRes.json() : { products: [] };
    const catData = catRes.ok ? await catRes.json() : { categories: [] };

    return {
      products: prodData.products || [],
      categories: catData.categories || [],
    };
  } catch (err) {
    console.error('Home data fetch error, using client fallback:', err);
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData();

  const reviews = [
    {
      name: 'Amina Siddiqui',
      city: 'Lahore (DHA Phase 6)',
      rating: 5,
      date: 'September 2026',
      title: 'The SpinTidy and OrbitSeal completely transformed my pantry.',
      comment:
        'Our kitchen cabinets used to be a disaster of half-open spice packets and knocked-over bottles. The SpinTidy turntable brings every single jar right to the front with one touch, and OrbitSeal reseals our snack packs instantly. Delivered in 2 days via COD.',
    },
    {
      name: 'Dr. Bilal Qureshi',
      city: 'Karachi (Clifton)',
      rating: 5,
      date: 'September 2026',
      title: 'SpaceVault compression cubes recovered an entire wardrobe.',
      comment:
        'Living near the sea in Karachi, storing heavy winter duvets and wedding shawls usually meant musty odors or overflowing wardrobes. The vacuum cubes compressed 3 giant quilts into a tiny flat stack. Sealed airtight and dust-free.',
    },
    {
      name: 'Zainab Tariq',
      city: 'Islamabad (F-7)',
      rating: 5,
      date: 'September 2026',
      title: 'MagDock is the first thing guests compliment at our door.',
      comment:
        'The combination of solid walnut wood and architectural steel looks like a $150 designer piece from an upscale boutique. The magnetic key hold on the underside has a super satisfying snap. We never lose our keys anymore.',
    },
  ];

  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'You can order without paying any advance deposit. When our courier partner (TCS, Leopard, or Trax) arrives at your doorstep in Pakistan, you inspect the package and pay cash directly to the courier.',
    },
    {
      q: 'How long does nationwide delivery take?',
      a: 'We deliver within 2 to 4 business days nationwide across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, Multan, and all other cities.',
    },
    {
      q: 'What is Organiva’s 7-Day Replacement Guarantee?',
      a: 'If your product arrives damaged, defective, or not working as expected, simply WhatsApp our team at +92 315 6251281 with a photo/video within 7 days. We will ship a brand-new replacement unit with zero hassle.',
    },
    {
      q: 'Are Organiva organizers easy to install without tools or drilling?',
      a: 'Yes. Most of our systems (like the SpinTidy turntable, OrbitSeal fridge dock, CableGrid magnetic hub, and AeroGlow sensor light) require zero drilling and use heavy-duty non-damaging adhesive or high-grade magnets.',
    },
    {
      q: 'Can I purchase coordinating room bundles for better savings?',
      a: 'Absolutely. We offer curated room reset sets for pantries, wardrobes, and entryways with up to 25% instant bundle savings and free express delivery across Pakistan.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* 1. EDITORIAL HOME ORGANIZATION HERO (Dynamic Categories + Hover Folder) */}
      <HeroOrganiva categories={categories} products={products} />

      {/* 2. ARCHITECTURAL SPACE BENTO GRID (Dynamic Categories) */}
      <SpaceBentoGrid categories={categories} products={products} />

      {/* 3. MULTI-SPACE INTERACTIVE CATALOG (Dynamic Products & Category JellyRadio) */}
      <CatalogSection initialProducts={products} categories={categories} />

      {/* 4. INTERACTIVE ROOM DECLUTTER QUIZ */}
      <div id="quiz-section">
        <DeclutterQuiz products={products} />
      </div>

      {/* 5. INTERACTIVE BEFORE & AFTER COMPARISON */}
      <BeforeAfterSection />

      {/* 6. COORDINATED ROOM RESET BUNDLES */}
      <BundleSection products={products} />

      {/* 7. VERIFIED REVIEWS */}
      <section className="py-20 bg-white border-y border-[#5B755D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
              Verified Homeowners
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-3">
              Calmer Pakistani Homes, Room by Room.
            </h2>
            <p className="text-sm text-[#525B54] mt-2">
              Real verified customers who replaced visual clutter with intentional, lasting organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15 flex flex-col justify-between hover:border-[#5B755D]/35 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#D97706]">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#7F8681]">{rev.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#171A18] leading-snug">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-[#525B54] mt-2 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#5B755D]/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#171A18] block">{rev.name}</span>
                    <span className="text-[11px] text-[#7F8681]">{rev.city}</span>
                  </div>
                  <span className="text-[10px] bg-[#EBF1EB] text-[#435845] font-bold px-2 py-0.5 rounded-full border border-[#5B755D]/20">
                    Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRUST STRIP */}
      <section className="py-16 bg-[#172319] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-4 space-y-2">
              <span className="text-lg font-bold text-[#8EB892]">✓</span>
              <h5 className="text-sm font-bold">Cash on Delivery</h5>
              <p className="text-xs text-[#A1ACA2]">Zero advance required</p>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-lg font-bold text-[#8EB892]">✓</span>
              <h5 className="text-sm font-bold">Nationwide Delivery</h5>
              <p className="text-xs text-[#A1ACA2]">2–4 business days</p>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-lg font-bold text-[#8EB892]">✓</span>
              <h5 className="text-sm font-bold">7-Day Replacement</h5>
              <p className="text-xs text-[#A1ACA2]">Hassle-free guarantee</p>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-lg font-bold text-[#8EB892]">✓</span>
              <h5 className="text-sm font-bold">Secure Online Pay</h5>
              <p className="text-xs text-[#A1ACA2]">JazzCash & Easypaisa</p>
            </div>
            <div className="p-4 space-y-2 col-span-2 md:col-span-1">
              <span className="text-lg font-bold text-[#8EB892]">✓</span>
              <h5 className="text-sm font-bold">WhatsApp Support</h5>
              <p className="text-xs text-[#A1ACA2]">Direct human help</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-[#5B755D]/15 p-5 open:shadow-xs transition-all"
              >
                <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-[#171A18] cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className="text-[#5B755D] group-open:rotate-180 transition-transform shrink-0 ml-2"
                  />
                </summary>
                <p className="text-xs sm:text-sm text-[#525B54] mt-3 leading-relaxed pt-2 border-t border-[#5B755D]/10">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-xs text-[#7F8681]">
              Have a question about organizing a specific space?{' '}
              <a
                href={getWhatsAppUrl('Hi Organiva! I have a question about organizing my space.')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B755D] font-bold hover:underline"
              >
                Chat with our team on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL-TO-ACTION */}
      <section className="py-20 bg-[#1F3524] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8EB892] bg-[#273F2D] px-3.5 py-1 rounded-full border border-[#3D5E45]">
            Ready for a Calmer Home?
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Design spaces that bring you peace every single day.
          </h2>
          <p className="text-sm sm:text-base text-[#CAD3CA] max-w-xl mx-auto">
            Order with Cash on Delivery anywhere in Pakistan. Fast 2-4 day doorstep delivery with our 7-Day Replacement Guarantee.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1F3524] font-bold text-sm shadow-xl transition-all hover:scale-105"
            >
              <span>EXPLORE ALL HOME SYSTEMS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
