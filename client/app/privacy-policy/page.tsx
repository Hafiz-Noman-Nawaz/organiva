import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Organiva Pakistan',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-6 text-sm text-[#525B54] leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18]">Privacy Policy</h1>
          <p className="text-xs text-[#7F8681]">Last Updated: September 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">1. Information We Collect</h2>
            <p>
              When you place an order on Organiva, we collect necessary fulfillment information including your full name, shipping address, contact phone number, and optional email address.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">2. Use of Your Information</h2>
            <p>
              Your contact and address information is used exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process, dispatch, and deliver your orders via our courier partners (TCS, Leopard, Trax).</li>
              <li>Send automated order tracking updates and WhatsApp delivery notices.</li>
              <li>Provide customer support regarding warranty or replacements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">3. Payment Security</h2>
            <p>
              We do not store your debit/credit card numbers or mobile wallet PINs on our servers. Online payments through JazzCash and Easypaisa are processed via encrypted, bank-grade gateway tunnels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">4. Contact</h2>
            <p>
              For any privacy inquiries, email us at <strong className="text-[#171A18]">support@organiva.pk</strong> or message us on WhatsApp at +92 315 6251281.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
