import React from 'react';
import Link from 'next/link';
import { ChevronDown, MessageCircle, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

export const metadata = {
  title: 'Frequently Asked Questions | Organiva Pakistan',
  description: 'Everything you need to know about ordering, nationwide shipping, Cash on Delivery, and our 7-day replacement warranty.',
};

export default function FAQPage() {
  const sections = [
    {
      title: 'Orders & Payments',
      faqs: [
        {
          q: 'What payment methods do you support?',
          a: 'We accept Cash on Delivery (COD) across Pakistan, as well as instant secure online payments through JazzCash and Easypaisa wallets and debit cards.',
        },
        {
          q: 'Do I need to pay an advance deposit for COD?',
          a: 'No! We believe in authentic trust. You pay 100% of the bill directly to the courier when they hand you your package.',
        },
        {
          q: 'Can I cancel or change my order?',
          a: 'Yes, if your order has not yet been handed to our courier partner. Simply drop a message on WhatsApp at +92 315 6251281 with your Order ID.',
        },
      ],
    },
    {
      title: 'Shipping & Delivery',
      faqs: [
        {
          q: 'How much are shipping charges?',
          a: 'We offer standard nationwide delivery for Rs. 250. Orders over Rs. 3,500 automatically receive 100% FREE Nationwide Delivery!',
        },
        {
          q: 'How many days will delivery take?',
          a: 'Delivery takes 2 to 4 business days. Major cities (Lahore, Karachi, Islamabad, Rawalpindi) typically arrive in 2–3 days.',
        },
        {
          q: 'How can I track my shipment?',
          a: 'You can visit our Track Order page anytime, enter your Order ID and phone number, and see real-time updates from dispatch to doorstep arrival.',
        },
      ],
    },
    {
      title: 'Replacements & Warranty',
      faqs: [
        {
          q: 'What is the 7-Day Replacement Guarantee?',
          a: 'If your item arrives defective, damaged, or does not function as described, notify us on WhatsApp within 7 days. We will dispatch a brand-new replacement immediately.',
        },
        {
          q: 'What if I need help using the product?',
          a: 'Every Organiva product includes an English user guide. If you have any questions, our WhatsApp support team and Orgi, our smart home organizing AI companion, are available to walk you through usage step-by-step.',
        },
      ],
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171A18] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#525B54]">
            Quick answers about shipping, COD, replacement warranty, and product care.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <h2 className="text-lg font-bold text-[#171A18] border-b border-[#5B755D]/15 pb-2">
                {sec.title}
              </h2>
              <div className="space-y-3">
                {sec.faqs.map((faq, fIdx) => (
                  <details
                    key={fIdx}
                    className="group bg-white rounded-2xl border border-[#5B755D]/15 p-5 open:shadow-xs transition-all"
                  >
                    <summary className="flex items-center justify-between font-bold text-sm text-[#171A18] cursor-pointer list-none">
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
            </div>
          ))}
        </div>

        {/* WhatsApp Banner */}
        <div className="p-6 bg-white rounded-3xl border border-[#5B755D]/15 text-center space-y-3">
          <h3 className="text-base font-bold text-[#171A18]">Still have a specific question?</h3>
          <p className="text-xs text-[#525B54]">
            Our Pakistani customer service team is available directly on WhatsApp for quick, friendly human help.
          </p>
          <a
            href={getWhatsAppUrl('Hi Organiva! I have a question about an order / product.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-colors shadow-md"
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp ({WHATSAPP_FORMATTED_NUMBER})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
