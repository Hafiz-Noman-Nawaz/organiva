'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle, ExternalLink, MessageCircle, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCn, setCopiedCn] = useState(false);

  const fetchTracking = async (targetId: string, targetPhone: string) => {
    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await api.post('/orders/track', {
        orderId: targetId.trim(),
        phone: targetPhone.trim(),
      });

      if (res.success) {
        setOrder(res.order);
      } else {
        setError(res.message || 'Order not found.');
      }
    } catch (err: any) {
      setError(err.message || 'No matching order found with provided Order ID and Phone.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qOrderId = searchParams.get('orderId');
    const qPhone = searchParams.get('phone');
    if (qOrderId) {
      setOrderId(qOrderId);
    }
    if (qPhone) {
      setPhone(qPhone);
    }
    if (qOrderId && qPhone) {
      fetchTracking(qOrderId, qPhone);
    }
  }, [searchParams]);

  const handleCopyCn = (cn: string) => {
    navigator.clipboard.writeText(cn);
    setCopiedCn(true);
    setTimeout(() => setCopiedCn(false), 2500);
  };

  const steps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim() || !phone.trim()) {
      setError('Please provide both your Order ID (e.g. ORG-2601) and contact Phone number.');
      return;
    }

    await fetchTracking(orderId, phone);
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'PENDING';
    const stepOrder = steps.map((s) => s.key);
    const currentIndex = stepOrder.indexOf(order.orderStatus);
    const targetIndex = stepOrder.indexOf(stepKey);

    if (targetIndex < currentIndex) return 'COMPLETED';
    if (targetIndex === currentIndex) return 'CURRENT';
    return 'PENDING';
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Real-Time Courier Updates
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-2">
            Track Your Organiva Order
          </h1>
          <p className="text-xs sm:text-sm text-[#525B54] mt-2">
            Enter your Order ID (from SMS/Confirmation) and phone number to see live fulfillment status.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-sm mb-10">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171A18] mb-1">
                  Order ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORG-2601"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A18] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Search size={16} />
              <span>{loading ? 'Searching...' : 'Track My Order'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details & Stepper */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-md space-y-8 animate-fade-up">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#5B755D]/10 gap-3">
              <div>
                <span className="text-xs text-[#7F8681]">Order Reference</span>
                <h3 className="text-xl font-extrabold font-mono text-[#171A18]">{order.orderId}</h3>
                <p className="text-xs text-[#525B54] mt-0.5">
                  Recipient: <strong>{order.customerName}</strong> ({order.city})
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-[#7F8681]">Payment</span>
                <p className="text-sm font-bold text-[#5B755D]">
                  {order.paymentMethod} (PKR {order.total})
                </p>
                <span className="text-[11px] text-[#7F8681] block">
                  Status: <strong>{order.paymentStatus}</strong>
                </span>
              </div>
            </div>

            {/* Courier Dispatch & Live Tracking Card (if shipped) */}
            {order.trackingNumber && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#5B755D]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#5B755D] text-white flex items-center justify-center shrink-0">
                      <Truck size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#171A18] block">
                        Courier Partner: {order.courierName || 'Trax Logistics'}
                      </span>
                      <span className="text-[11px] text-[#525B54] flex items-center gap-1.5 flex-wrap">
                        <span>Tracking / CN #:</span>
                        <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#171A18] border border-gray-200">
                          {order.trackingNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyCn(order.trackingNumber)}
                          title="Copy Tracking Number"
                          className="p-1 rounded hover:bg-gray-200 text-[#5B755D] transition-colors cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                        >
                          {copiedCn ? (
                            <>
                              <Check size={12} className="text-green-600" />
                              <span className="text-green-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  </div>

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                    >
                      <span>Open Courier Live Tracker</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {order.estimatedDeliveryDate && (
                  <p className="text-xs text-[#525B54]">
                    Estimated Arrival:{' '}
                    <strong className="text-[#171A18]">{order.estimatedDeliveryDate}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Stepper */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A18] mb-6">
                Fulfillment Journey
              </h4>

              <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-[#5B755D]/20 ml-3">
                {steps.map((step) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div key={step.key} className="relative flex items-center gap-3">
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${
                          status === 'COMPLETED'
                            ? 'border-[#5B755D] bg-[#5B755D] text-white'
                            : status === 'CURRENT'
                            ? 'border-[#5B755D] text-[#5B755D] ring-4 ring-[#5B755D]/20'
                            : 'border-gray-300 text-transparent'
                        }`}
                      >
                        {status === 'COMPLETED' ? (
                          <CheckCircle2 size={12} />
                        ) : status === 'CURRENT' ? (
                          <span className="w-2 h-2 rounded-full bg-[#5B755D]" />
                        ) : null}
                      </div>

                      <span
                        className={`text-xs sm:text-sm ${
                          status === 'CURRENT'
                            ? 'font-extrabold text-[#5B755D]'
                            : status === 'COMPLETED'
                            ? 'font-semibold text-[#171A18]'
                            : 'text-gray-400 font-normal'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Timeline History */}
            {order.statusTimeline && order.statusTimeline.length > 0 && (
              <div className="pt-6 border-t border-[#5B755D]/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A18] mb-3">
                  Tracking Event Log
                </h4>
                <div className="space-y-2">
                  {order.statusTimeline.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF8F5] text-xs flex items-center justify-between gap-4"
                    >
                      <span className="font-medium text-[#2E332F]">{item.comment}</span>
                      <span className="text-[#7F8681] shrink-0">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Support CTA */}
            <div className="pt-5 border-t border-[#5B755D]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#525B54]">Have a query regarding this delivery?</span>
              <a
                href={getWhatsAppUrl(`Hi Organiva! I would like to inquire about my order ${order.orderId}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold transition-all shadow-xs"
              >
                <MessageCircle size={15} />
                <span>Inquire on WhatsApp ({WHATSAPP_FORMATTED_NUMBER})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5B755D]"></div>
      </div>
    }>
      <TrackOrderInner />
    </Suspense>
  );
}
