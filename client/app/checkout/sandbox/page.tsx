'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const gateway = searchParams.get('gateway') || 'jazzcash';
  const orderId = searchParams.get('orderId') || '';
  const amount = searchParams.get('amount') || '0';
  const txnRef = searchParams.get('txnRef') || '';

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isJazzCash = gateway.toLowerCase() === 'jazzcash';

  const handleSimulate = async (status: 'SUCCESS' | 'FAILED') => {
    setLoading(true);
    try {
      const res = await api.post('/payments/sandbox/confirm', {
        orderId,
        gateway: gateway.toUpperCase(),
        status,
      });

      if (status === 'SUCCESS') {
        router.push(`/order-success/${orderId}?payment=success&gateway=${gateway}`);
      } else {
        setMsg('Payment was simulated as failed/cancelled.');
        setTimeout(() => {
          router.push(`/checkout?payment=failed&orderId=${orderId}`);
        }, 1500);
      }
    } catch (e: any) {
      setMsg(e.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#5B755D]/20 shadow-xl space-y-6 text-center">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-md ${
            isJazzCash ? 'bg-[#FF5B00]' : 'bg-[#00C250]'
          }`}
        >
          {isJazzCash ? 'JC' : 'EP'}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7F8681]">
            Sandbox Gateway Simulation
          </span>
          <h2 className="text-xl font-extrabold text-[#171A18] mt-1">
            {isJazzCash ? 'JazzCash Payment Portal' : 'Easypaisa Mobile Gateway'}
          </h2>
          <p className="text-xs text-[#525B54] mt-1">
            Testing Order: <strong className="font-mono text-[#171A18]">{orderId}</strong>
          </p>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/15 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#7F8681]">Merchant</span>
            <span className="font-bold text-[#171A18]">ORGANIVA Pakistan</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7F8681]">Amount Due</span>
            <span className="font-bold text-base text-[#5B755D]">PKR {amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7F8681]">Txn Reference</span>
            <span className="font-mono text-[#171A18]">{txnRef}</span>
          </div>
        </div>

        {msg && <p className="text-xs font-semibold text-red-600">{msg}</p>}

        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleSimulate('SUCCESS')}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>Simulate Successful Payment</span>
          </button>

          <button
            onClick={() => handleSimulate('FAILED')}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#171A18] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <XCircle size={18} className="text-red-500" />
            <span>Simulate Payment Failure / Cancel</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7F8681] pt-2">
          <ShieldCheck size={14} className="text-[#5B755D]" />
          <span>Organiva Modular Payment Test Suite</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSandboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-[#5B755D]">Loading gateway sandbox...</div>}>
      <SandboxContent />
    </Suspense>
  );
}
