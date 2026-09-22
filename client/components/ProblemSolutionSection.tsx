'use client';

import React from 'react';
import Image from 'next/image';
import { XCircle, CheckCircle2, ShieldAlert, Sparkles, Clock, Repeat, HeartHandshake } from 'lucide-react';

export const ProblemSolutionSection = ({
  problemStatement,
  solutionStatement,
  benefits,
}: {
  problemStatement?: string;
  solutionStatement?: string;
  benefits?: Array<{ number: string; title: string; description: string }>;
}) => {
  const defaultBenefits = [
    {
      number: '01',
      title: 'EASY TO USE',
      description: 'One-touch operation. Reseals any snack or frozen bag in 2 seconds with zero pre-heating time.',
      icon: Sparkles,
    },
    {
      number: '02',
      title: 'SAVES TIME & MONEY',
      description: 'Never throw away stale chips, biscuits, or dry pantry ingredients again. Locks freshness for weeks.',
      icon: Clock,
    },
    {
      number: '03',
      title: 'USB-C RECHARGEABLE',
      description: 'Zero disposable batteries. One 45-minute charge delivers over 120 airtight heat seals.',
      icon: Repeat,
    },
    {
      number: '04',
      title: 'BUILT FOR EVERYDAY LIFE',
      description: 'Magnetic rear dock snaps straight onto your refrigerator door so it never gets lost in kitchen drawers.',
      icon: HeartHandshake,
    },
  ];

  const displayBenefits = benefits && benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Why Organiva Exists
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-3">
            Still dealing with daily everyday friction?
          </h2>
          <p className="text-sm sm:text-base text-[#525B54] mt-3">
            We identify the small, annoying daily hassles around Pakistani households and build clean, smart upgrades that solve them permanently.
          </p>
        </div>

        {/* Problem vs Solution Split Visual Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-20">
          {/* Problem Card (Annoying Old Way) */}
          <div className="bg-[#FFFFFF] p-8 rounded-3xl border border-red-200/70 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-red-600">
                <XCircle size={22} />
                <span className="text-xs font-bold uppercase tracking-wider">The Annoying Old Way</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171A18]">
                Broken clips, rubber bands, and wasted groceries.
              </h3>
              <p className="text-sm text-[#525B54] leading-relaxed">
                {problemStatement ||
                  'You buy fresh chips or snacks, eat half, and try to seal them with flimsy plastic bag clips that snap after two weeks. In Pakistani summer humidity, snacks turn soggy within hours and go straight into the trash.'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-red-100 space-y-2.5 text-xs text-[#7F8681]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Floppy clips cluttering kitchen drawers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Air leaks causing stale, wasted food</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Tearing bags jaggedly without scissors</span>
              </div>
            </div>
          </div>

          {/* Solution Card (The Organiva Way) */}
          <div className="bg-gradient-to-br from-[#1F3524] to-[#2B4530] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-[#3E5C44]">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-[#8EB892]">
                <CheckCircle2 size={22} />
                <span className="text-xs font-bold uppercase tracking-wider">There's A Simpler Way</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Airtight factory seal in 2 seconds. Every single time.
              </h3>
              <p className="text-sm text-[#CAD3CA] leading-relaxed">
                {solutionStatement ||
                  "Organiva OrbitSeal glides across any bag with a micro-ceramic heat strip to weld it completely airtight. Snacks stay crisp for weeks, and the built-in cutter opens bags cleanly without tearing."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 space-y-2.5 text-xs text-[#E1EAE1]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB892]"></span>
                <span>Airtight seal keeps humidity out 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB892]"></span>
                <span>Magnetic dock keeps it right on the fridge door</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB892]"></span>
                <span>Hidden safety cutter glides through tough pouches</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Benefit Cards (01, 02, 03, 04) */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#171A18] tracking-tight">
              Designed with purpose. Built for longevity.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayBenefits.map((b, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs hover:border-[#5B755D]/30 transition-all hover:-translate-y-1 group"
              >
                <span className="text-2xl font-black text-[#5B755D]/25 group-hover:text-[#5B755D] transition-colors font-mono">
                  {b.number}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#171A18] mt-2">
                  {b.title}
                </h4>
                <p className="text-xs text-[#525B54] mt-2 leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
