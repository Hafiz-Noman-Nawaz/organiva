import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: '7-Day Replacement & Refund Policy | Organiva Pakistan',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-6 text-sm text-[#525B54] leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18]">
                7-Day Hassle-Free Replacement Policy
              </h1>
              <p className="text-xs text-[#7F8681]">Official Organiva Guarantee</p>
            </div>
          </div>

          <p>
            At <strong>ORGANIVA</strong>, customer satisfaction and trust are our top priorities. We stand behind every problem solver we engineer.
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">1. Eligibility for Replacement</h2>
            <p>You qualify for a free replacement unit if:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The item arrived damaged or broken during transit.</li>
              <li>The product has an internal manufacturing defect or does not power on.</li>
              <li>You received an incorrect item or missing component.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">2. Simple 2-Step Claim Process</h2>
            <div className="space-y-2 p-4 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/15">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#5B755D]">Step 1:</span>
                <span>Send a brief video or photo showing the defect along with your Order ID to our WhatsApp at +92 315 6251281 within 7 days of delivery.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#5B755D]">Step 2:</span>
                <span>Our representative will review the claim and dispatch a brand-new replacement parcel to your doorstep free of charge.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">3. Refunds</h2>
            <p>
              If a replacement unit is unavailable in stock or the issue cannot be resolved, we will process a complete refund to your Bank Account, JazzCash, or Easypaisa within 3 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
