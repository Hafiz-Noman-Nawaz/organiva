import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Our Story | Organiva Pakistan',
  description: 'Learn why Organiva was founded: to design thoughtful, durable everyday essentials that simplify living.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Brand Mission Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            About Organiva
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171A18] tracking-tight">
            Smart products. Simpler living.
          </h1>
          <p className="text-base text-[#525B54] leading-relaxed">
            We are a Pakistani direct-to-consumer brand on a mission to eliminate daily household friction through minimal, high-utility product engineering.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-[#171A18]">Why We Started Organiva</h2>
          <div className="space-y-4 text-sm text-[#525B54] leading-relaxed">
            <p>
              Like many Pakistani families, we were exhausted by two extremes in everyday household shopping:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#2E332F]">
              <li>Cheap, disposable dropshipped plastic gadgets that break after two uses.</li>
              <li>Exorbitantly overpriced imported lifestyle goods that lack local warranty or customer care.</li>
            </ul>
            <p>
              We founded <strong>ORGANIVA</strong> to build an authentic alternative: thoughtful, durable everyday tools that genuinely solve tangible problems around your kitchen, desk, car, and home.
            </p>
            <p>
              Before any product joins the Organiva line, we test it physically for build quality, battery safety, and durability under Pakistani conditions (including voltage spikes and monsoon humidity). If an item doesn't make everyday life noticeably simpler, we don't sell it.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">Authentic Testing</h3>
            <p className="text-xs text-[#525B54] leading-relaxed">
              Zero fake claims. We physically evaluate every material, battery cell, and mechanism before listing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <Heart size={20} />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">7-Day Replacement</h3>
            <p className="text-xs text-[#525B54] leading-relaxed">
              Complete peace of mind. If any item arrives damaged or defective, we replace it immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h3 className="text-base font-bold text-[#171A18]">Nationwide COD</h3>
            <p className="text-xs text-[#525B54] leading-relaxed">
              Pay upon doorstep inspection in cash across all major cities and rural postal routes in Pakistan.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm shadow-md transition-all"
          >
            <span>Explore The Organiva Collection</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
