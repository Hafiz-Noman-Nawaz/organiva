'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { getWhatsAppUrl } from '@/lib/contact';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5B755D', '#8EB892', '#D97706', '#FAF8F5'],
      });
    } catch (e) {
      // Ignore confetti errors on unsupported envs
    }

    if (orderId) {
      api
        .get(`/orders/${orderId}`)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const whatsappMsg = encodeURIComponent(
    `Hi Organiva, I just placed order #${orderId}. Please share updates on my shipment!`
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#5B755D]/20 shadow-xl text-center space-y-6">
          {/* Success Check Icon */}
          <div className="w-20 h-20 rounded-full bg-[#EBF1EB] text-[#5B755D] mx-auto flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 size={44} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D]">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-1">
              Thank you for ordering!
            </h1>
            <p className="text-sm text-[#525B54] mt-2">
              We have received your order. Our team will prepare and dispatch it via express nationwide courier.
            </p>
          </div>

          {/* Order ID Badge */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15 flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs text-[#7F8681]">Order Reference ID</span>
              <p className="text-base sm:text-lg font-black font-mono text-[#171A18]">{orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#7F8681]">Status</span>
              <p className="text-xs font-bold text-[#5B755D] bg-[#EBF1EB] px-2.5 py-1 rounded-full border border-[#5B755D]/20 mt-0.5">
                {order?.paymentMethod === 'COD' ? 'COD Confirmed' : 'Paid Online'}
              </p>
            </div>
          </div>

          {/* Delivery Timeline Step Graphic */}
          <div className="py-4 border-y border-[#5B755D]/10 text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171A18]">
              Expected Delivery Timeline
            </h3>
            <div className="flex items-center justify-between text-xs text-[#525B54]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B755D]"></span>
                <span>Dispatched within 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-[#5B755D]" />
                <span>Doorstep arrival in 2–4 business days</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <a
              href={getWhatsAppUrl(whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageCircle size={18} />
              <span>Get WhatsApp Order Updates</span>
            </a>

            <Link
              href="/track-order"
              className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Track Order Status</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/shop"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-[#5B755D] hover:bg-[#EBF1EB] transition-colors block"
            >
              Continue Browsing Organiva
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#7F8681] pt-2">
            <ShieldCheck size={14} className="text-[#5B755D]" />
            <span>Backed by Organiva 7-Day Replacement Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
