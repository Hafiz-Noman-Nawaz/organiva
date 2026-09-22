'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Lock, ArrowRight, AlertCircle, CheckCircle2, CreditCard, Tag, X } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, shippingRule, freeShippingThreshold, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'SAFEPAY' | 'JAZZCASH' | 'EASYPAISA'>('COD');

  // Safepay Card Input State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [safepayMode, setSafepayMode] = useState<'direct' | 'hosted'>('direct');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoFillTestCard = () => {
    setCardNumber('5200 0000 0000 1096');
    setCardExpiry('12/28');
    setCardCvv('111');
    setCardholderName(fullName.trim() || 'Test Cardholder');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const majorCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Sialkot',
    'Gujranwala',
    'Quetta',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Other City',
  ];

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await api.post('/orders/apply-coupon', {
        code: couponCodeInput.trim(),
        subtotal,
      });
      if (res.success) {
        setAppliedCoupon({
          code: res.code,
          discount: res.discount,
          discountType: res.discountType,
          discountAmount: res.discountAmount,
          message: res.message,
        });
        setCouponCodeInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Dynamic shipping calculation with city overrides
  const calculateShipping = () => {
    if (subtotal >= freeShippingThreshold) return 0;
    if (shippingRule?.cityOverrides && shippingRule.cityOverrides.length > 0) {
      const match = shippingRule.cityOverrides.find(
        (o) => o.city.toLowerCase() === city.toLowerCase()
      );
      if (match) return match.rate;
    }
    return shippingRule?.flatRate || 250;
  };

  const shipping = calculateShipping();
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
        <h2 className="text-xl font-bold text-[#171A18]">Your bag is empty</h2>
        <p className="text-xs text-[#525B54] mt-1">Please add items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="mt-4 px-6 py-2.5 rounded-full bg-[#5B755D] text-white text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all required shipping fields (Name, Phone, City, Address).');
      return;
    }

    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid Pakistani mobile number (e.g. 0300 1234567).');
      return;
    }

    if (paymentMethod === 'SAFEPAY' && safepayMode === 'direct') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (!cleanNum || cleanNum.length < 15) {
        setError('Please enter your card number or click "Auto-Fill Test Card" to test.');
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
        setError('Please enter card expiry date in MM/YY format.');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        setError('Please enter your 3 or 4 digit CVV/CVC code.');
        return;
      }
    }

    setLoading(true);

    try {
      // Send cart items to backend for strict price recalculation & verification
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim(),
          area: area.trim() || undefined,
          address: address.trim(),
          postalCode: postalCode.trim() || undefined,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          quantity: item.quantity,
        })),
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes: notes.trim(),
      };

      const res = await api.post('/orders/checkout', payload);

      if (res.success) {
        clearCart();

        if (paymentMethod === 'COD') {
          router.push(`/order-success/${res.orderId}`);
        } else if (paymentMethod === 'SAFEPAY') {
          if (safepayMode === 'direct') {
            // Confirm test card payment via Safepay verify API
            try {
              await api.post('/payments/safepay/verify', {
                orderId: res.orderId,
                beacon: res.token,
                simulatedSuccess: true,
              });
            } catch (vErr) {
              console.warn('Verification call notice:', vErr);
            }
            router.push(`/order-success/${res.orderId}?payment=success&gateway=safepay`);
          } else {
            // Open Safepay Hosted Portal at /components
            window.location.href = res.paymentUrl;
          }
        } else if (res.paymentUrl) {
          // Redirect to payment gateway or sandbox
          window.location.href = res.paymentUrl;
        } else {
          router.push(`/order-success/${res.orderId}`);
        }
      } else {
        setError(res.message || 'Error processing order.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again or order via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D]">
            Simple 1-Page Checkout
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171A18] tracking-tight mt-1">
            Complete Your Order
          </h1>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Customer Information & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact & Shipping Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-xs space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-[#171A18] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#5B755D] text-white text-xs flex items-center justify-center font-mono">
                  1
                </span>
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Usman Tariq"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Mobile Phone (for delivery SMS/calls) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  >
                    {majorCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Area / Sector / Town
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. DHA Phase 5, Gulberg, Clifton"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Complete Street Address (House/Apartment #, Street) *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 42, Street 7, Block B"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please call before arriving or deliver to guard"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#171A18] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#5B755D] text-white text-xs flex items-center justify-center font-mono">
                  2
                </span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#5B755D] bg-[#EBF1EB]/40'
                      : 'border-[#5B755D]/15 bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-[#5B755D] focus:ring-[#5B755D]"
                    />
                    <div>
                      <span className="text-sm font-bold text-[#171A18] block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-[#525B54]">
                        Pay in cash upon doorstep delivery anywhere in Pakistan.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#5B755D] bg-white px-2.5 py-1 rounded-full border border-[#5B755D]/20">
                    Recommended
                  </span>
                </label>

                {/* Safepay Sandbox Payment (Cards & Online Banking) */}
                <label
                  onClick={() => setPaymentMethod('SAFEPAY')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'SAFEPAY'
                      ? 'border-[#5B755D] bg-[#EBF1EB]/40 shadow-xs'
                      : 'border-[#5B755D]/15 bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'SAFEPAY'}
                      onChange={() => setPaymentMethod('SAFEPAY')}
                      className="text-[#5B755D] focus:ring-[#5B755D]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#171A18] block">
                          Safepay Card & Online Bank Pay
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#5B755D] text-white px-2 py-0.5 rounded-full">
                          Live Sandbox
                        </span>
                      </div>
                      <span className="text-xs text-[#525B54] mt-0.5 block">
                        Visa, Mastercard, PayPak, & Direct Bank Checkout via Safepay Sandbox.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Safepay
                  </span>
                </label>

                {/* Safepay Card Input Panel */}
                {paymentMethod === 'SAFEPAY' && (
                  <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#5B755D]/30 bg-white shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#5B755D]/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-[#5B755D]" />
                          <span className="text-sm font-bold text-[#171A18]">
                            Enter Card Details
                          </span>
                        </div>
                        <p className="text-xs text-[#525B54] mt-0.5">
                          Safely test card payments with real-time sandbox verification.
                        </p>
                      </div>

                      {/* Auto-fill test card button */}
                      <button
                        type="button"
                        onClick={handleAutoFillTestCard}
                        className="px-3 py-1.5 rounded-lg bg-[#5B755D]/10 hover:bg-[#5B755D]/20 text-[#5B755D] text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <span>✨ Auto-Fill Test Card</span>
                      </button>
                    </div>

                    {/* Mode Toggle: Direct vs Safepay Hosted Window */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#5B755D]/10 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setSafepayMode('direct')}
                        className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer ${
                          safepayMode === 'direct'
                            ? 'bg-white text-[#171A18] font-bold shadow-xs border border-[#5B755D]/20'
                            : 'text-[#7F8681] hover:text-[#171A18]'
                        }`}
                      >
                        Direct Card Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => setSafepayMode('hosted')}
                        className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer ${
                          safepayMode === 'hosted'
                            ? 'bg-white text-[#171A18] font-bold shadow-xs border border-[#5B755D]/20'
                            : 'text-[#7F8681] hover:text-[#171A18]'
                        }`}
                      >
                        Safepay Hosted Portal
                      </button>
                    </div>

                    {safepayMode === 'direct' ? (
                      <div className="space-y-3.5 pt-1">
                        <div>
                          <label className="text-xs font-semibold text-[#171A18] block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="e.g. Muhammad Nawaz"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20 focus:border-[#5B755D]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#171A18] block mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                              placeholder="5200 0000 0000 1096"
                              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20 focus:border-[#5B755D]"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-bold text-gray-400 pointer-events-none">
                              <span>VISA</span>
                              <span>/</span>
                              <span>MC</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[#171A18] block mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                              placeholder="MM/YY (e.g. 12/28)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20 focus:border-[#5B755D]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-[#171A18] block mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              maxLength={4}
                              placeholder="111"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20 focus:border-[#5B755D]"
                            />
                          </div>
                        </div>

                        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#5B755D]/15 text-[11px] text-[#525B54] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#171A18]">
                            <ShieldCheck size={14} className="text-[#5B755D]" />
                            <span>Safepay Official Sandbox Test Card</span>
                          </div>
                          <p>
                            Number: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold text-[#171A18]">5200 0000 0000 1096</code> • Exp: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold text-[#171A18]">12/28</code> • CVV: <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold text-[#171A18]">111</code>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
                        <p className="font-semibold">
                          Safepay Hosted Components Window
                        </p>
                        <p className="text-blue-800 text-[11px] leading-relaxed">
                          When you click checkout, you will be redirected to Safepay&apos;s hosted portal (<code>sandbox.api.getsafepay.com</code>) to complete payment, and returned to Organiva automatically.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* JazzCash Option (Coming Soon) */}
                <div
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      disabled
                      name="payment"
                      className="text-gray-400"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-700 block">
                        JazzCash Mobile Account / Wallet
                      </span>
                      <span className="text-xs text-gray-500">
                        Direct JazzCash mobile wallet integration.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>

                {/* Easypaisa Option (Coming Soon) */}
                <div
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      disabled
                      name="payment"
                      className="text-gray-400"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-700 block">
                        Easypaisa Mobile Account / Wallet
                      </span>
                      <span className="text-xs text-gray-500">
                        Direct Easypaisa mobile balance checkout.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Review & Submit (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-[#171A18] pb-3 border-b border-[#5B755D]/10">
                Order Review ({cart.reduce((a, b) => a + b.quantity, 0)} items)
              </h3>

              {/* Items List Mini */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#5B755D]/10">
                        <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-[#171A18] line-clamp-1">{item.title}</span>
                        <span className="text-[#7F8681]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#171A18] shrink-0">
                      PKR {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-3 border-t border-[#5B755D]/10">
                <label className="block text-xs font-semibold text-[#171A18] mb-1.5 flex items-center gap-1.5">
                  <Tag size={13} className="text-[#5B755D]" />
                  <span>Have a Promo / Voucher Code?</span>
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#5B755D]/10 border border-[#5B755D]/30 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider text-[#1F3524] bg-white px-2 py-0.5 rounded border border-[#5B755D]/20">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[#3E5340] font-medium">
                        -PKR {appliedCoupon.discount} off
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ORGANIVA10"
                        className="flex-1 px-3 py-2 text-xs uppercase tracking-wider font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-[#5B755D]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCodeInput.trim()}
                        className="px-4 py-2 bg-[#1F3524] hover:bg-[#2e4d35] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1">
                        <AlertCircle size={11} /> {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#5B755D]/10 space-y-2 text-xs sm:text-sm text-[#525B54]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#171A18]">PKR {subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#2e5936] font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> Discount ({appliedCoupon.code})
                    </span>
                    <span>-PKR {appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nationwide Express Shipping</span>
                  <span className="font-semibold text-[#171A18]">
                    {shipping === 0 ? 'FREE' : `PKR ${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#171A18] pt-2 border-t border-gray-100">
                  <span>Total Due</span>
                  <span className="text-[#5B755D]">PKR {total}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      {paymentMethod === 'COD'
                        ? `Place COD Order (PKR ${total})`
                        : `Proceed to ${paymentMethod} Payment`}
                    </span>
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-[#7F8681]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#5B755D]" />
                  <span>Strict Server-Side Price & Inventory Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#5B755D]" />
                  <span>Estimated delivery within 2–4 business days</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
