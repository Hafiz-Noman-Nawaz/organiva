import React from 'react';
import { Truck, ShieldCheck, Clock } from 'lucide-react';

export const metadata = {
  title: 'Nationwide Shipping & Delivery Policy | Organiva Pakistan',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-6 text-sm text-[#525B54] leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18]">
                Shipping & Delivery Policy
              </h1>
              <p className="text-xs text-[#7F8681]">Nationwide Pakistani Coverage</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">1. Delivery Coverage</h2>
            <p>
              Organiva ships nationwide across all provinces and territories of Pakistan (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Kashmir, and Gilgit-Baltistan).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">2. Delivery Timelines</h2>
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/15 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#171A18]">Major Metros (Lahore, Karachi, Islamabad, Rawalpindi):</span>
                <span className="font-semibold text-[#5B755D]">2 to 3 Business Days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#171A18]">Other Cities & Towns:</span>
                <span className="font-semibold text-[#5B755D]">3 to 4 Business Days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#171A18]">Order Dispatch Cut-off:</span>
                <span className="text-[#525B54]">Orders placed before 2:00 PM PKT dispatch same-day.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">3. Shipping Rates</h2>
            <p>
              - Flat Rate Shipping: <strong>PKR 250</strong> per order.
            </p>
            <p className="font-semibold text-[#5B755D]">
              - FREE SHIPPING: Automatically applied on all orders of PKR 3,500 or higher!
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#171A18]">4. Cash on Delivery Handling</h2>
            <p>
              Please keep the exact cash amount ready when the courier contacts you. You will receive an SMS and WhatsApp notification once your parcel is out for delivery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
