'use client';

import React, { useState } from 'react';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const BeforeAfterSection = () => {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');

  const comparisons = [
    {
      space: 'Kitchen & Groceries',
      before: {
        title: 'Floppy Clips & Stale Food',
        desc: 'Plastic clips that snap after 2 weeks, rubber bands popping off, and soggy biscuits or stale chips within 24 hours of opening.',
      },
      after: {
        title: 'Fresh & Organized Pantry',
        desc: 'Purpose-built kitchen systems that keep food fresh, spices accessible, and countertops clutter-free for weeks on end.',
      },
    },
    {
      space: 'Deep Pantry Shelves',
      before: {
        title: 'Dark Corners & Knocked Over Jars',
        desc: 'Reaching into deep cabinets, knocking over turmeric or oil bottles, and buying duplicate spices you couldn\'t see.',
      },
      after: {
        title: 'Everything Within Reach',
        desc: 'Smart rotating organizers and tiered shelving systems bring every item forward instantly — no more forgotten corners.',
      },
    },
    {
      space: 'Wardrobe & Closets',
      before: {
        title: 'Overflowing Seasonal Duvets',
        desc: 'Heavy winter blankets and wedding garments monopolizing 80% of wardrobe space and gathering closet dust.',
      },
      after: {
        title: 'Reclaimed Space & Protection',
        desc: 'Compression storage and smart lighting solutions recover wasted closet space and protect your belongings from moisture and dust.',
      },
    },
    {
      space: 'Workspace & Nightstands',
      before: {
        title: 'Falling Cords & Dust Crawling',
        desc: 'Charging cables sliding off desk edges every time you unplug your phone, forcing you to fish them from the floor.',
      },
      after: {
        title: 'Clean, Anchored Cables',
        desc: 'Magnetic cable management systems keep every cord snapped neatly in place, ready with a one-hand pull whenever you need them.',
      },
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-[#5B755D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Friction vs Calm
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171A18] tracking-tight mt-2">
            The Organiva Difference
          </h2>
          <p className="text-sm text-[#525B54] mt-1.5">
            How small, thoughtful engineering decisions eliminate the everyday annoyances in your house.
          </p>

          {/* Interactive State Toggle */}
          <div className="inline-flex p-1 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/20 mt-6 shadow-2xs">
            <button
              onClick={() => setActiveTab('after')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'after'
                  ? 'bg-[#172619] text-white shadow-xs'
                  : 'text-[#525B54] hover:text-[#171A18]'
              }`}
            >
              <Sparkles size={13} className="text-[#8EB892]" />
              <span>With Organiva Order</span>
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'before'
                  ? 'bg-[#172619] text-white shadow-xs'
                  : 'text-[#525B54] hover:text-[#171A18]'
              }`}
            >
              <span>Typical Daily Clutter</span>
            </button>
          </div>
        </div>

        {/* 4 Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comparisons.map((c, idx) => {
            const isAfter = activeTab === 'after';
            const item = isAfter ? c.after : c.before;

            return (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                  isAfter
                    ? 'bg-[#FAF8F5] border-[#5B755D]/25 shadow-xs'
                    : 'bg-[#FDFBFA] border-red-200/60 shadow-none'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#5B755D]/10">
                  <span className="text-xs font-bold text-[#7F8681] uppercase tracking-wider">
                    {c.space}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isAfter
                        ? 'bg-[#EBF1EB] text-[#435845] border border-[#5B755D]/20'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {isAfter ? <Check size={12} /> : <X size={12} />}
                    <span>{isAfter ? 'Organiva Calmer State' : 'Everyday Friction'}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 text-left">
                  <h4 className="text-base sm:text-lg font-black text-[#171A18]">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#525B54] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <span>Upgrade Your Home Today</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};
