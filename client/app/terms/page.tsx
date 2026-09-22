import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | Organiva Pakistan',
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-6 text-sm text-[#525B54] leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18]">Terms & Conditions</h1>
          <p className="text-xs text-[#7F8681]">Effective: September 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">1. General Terms</h2>
            <p>
              By visiting our website or purchasing products from Organiva, you agree to be bound by these terms. Organiva reserves the right to update product offerings, pricing, and policies as necessary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">2. Pricing & Currency</h2>
            <p>
              All prices listed on the site are in Pakistani Rupees (PKR). Prices are verified server-side at checkout.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">3. Order Acceptance</h2>
            <p>
              Submission of an order constitutes an offer to purchase. Organiva reserves the right to cancel or hold orders in the event of suspected fraudulent activity, invalid contact information, or stock unavailability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">4. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
