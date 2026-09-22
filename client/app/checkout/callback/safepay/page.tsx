'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

function SafepayCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || '';
  const beacon = searchParams.get('beacon') || searchParams.get('tracker') || '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment with Safepay Sandbox...');

  const verifyPayment = async (simulated: boolean = false) => {
    if (!orderId) {
      setStatus('failed');
      setMessage('Missing Order ID in payment callback.');
      return;
    }

    setStatus('verifying');
    try {
      const res = await api.post('/payments/safepay/verify', {
        orderId,
        beacon,
        simulatedSuccess: simulated,
      });

      if (res.success) {
        setStatus('success');
        setMessage('Payment successfully verified! Redirecting to your order confirmation...');
        setTimeout(() => {
          router.push(`/order-success/${orderId}?payment=success&gateway=safepay`);
        }, 1500);
      } else {
        setStatus('failed');
        setMessage(res.message || 'Safepay payment is pending or incomplete.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setMessage(err.message || 'Error communicating with payment gateway.');
    }
  };

  useEffect(() => {
    verifyPayment(false);
  }, [orderId, beacon]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FAF8F5]">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-[#5B755D]/20 shadow-xl text-center space-y-6">
        {/* Status Animation / Icon */}
        <div className="flex justify-center">
          {status === 'verifying' && (
            <div className="w-16 h-16 rounded-2xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#5B755D]" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>
          )}
          {status === 'failed' && (
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertCircle size={36} />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1EB] text-[#435845] text-[10px] font-extrabold uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>Safepay Sandbox Verification</span>
          </div>

          <h1 className="text-xl font-black text-[#171A18] tracking-tight">
            {status === 'verifying' && 'Confirming Payment...'}
            {status === 'success' && 'Payment Verified!'}
            {status === 'failed' && 'Payment Incomplete or Pending'}
          </h1>

          <p className="text-xs text-[#525B54] leading-relaxed">{message}</p>

          {orderId && (
            <span className="inline-block mt-2 font-mono text-xs text-[#5B755D] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#5B755D]/20 font-bold">
              Order: {orderId}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2.5">
          {status === 'failed' && (
            <>
              <button
                onClick={() => verifyPayment(true)}
                className="w-full py-3 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Simulate Successful Sandbox Payment</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => verifyPayment(false)}
                className="w-full py-2.5 rounded-xl border border-[#5B755D]/25 hover:bg-[#FAF8F5] text-[#171A18] text-xs font-semibold transition-all cursor-pointer"
              >
                Re-check Safepay Tracker
              </button>

              <Link
                href="/checkout"
                className="block text-xs text-[#7F8681] hover:text-[#171A18] pt-1"
              >
                Return to Checkout
              </Link>
            </>
          )}

          {status === 'success' && (
            <Link
              href={`/order-success/${orderId}`}
              className="w-full py-3 rounded-xl bg-[#5B755D] text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>View Order Confirmation</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SafepayCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#5B755D]" size={32} />
        </div>
      }
    >
      <SafepayCallbackContent />
    </Suspense>
  );
}
