'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function SuperAdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+92 ');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get('/auth/setup-status');
        if (res.success) {
          setNeedsSetup(res.needsSetup);
          if (!res.needsSetup) {
            // Already configured, lock access
            setTimeout(() => {
              router.replace('/admin/login');
            }, 3000);
          }
        }
      } catch (err: any) {
        console.error('Setup status check error:', err);
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/setup-superadmin', {
        name,
        email,
        password,
        phone,
      });

      if (res.success && res.token) {
        setSuccess(true);
        localStorage.setItem('organiva_admin_token', res.token);
        localStorage.setItem('organiva_admin_user', JSON.stringify(res.user));

        setTimeout(() => {
          router.replace('/admin');
        }, 1500);
      } else {
        setError(res.message || 'Setup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error initializing superadmin account');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1F3524] flex items-center justify-center p-4">
        <div className="text-white text-sm flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Verifying security & setup state...</span>
        </div>
      </div>
    );
  }

  // Already setup - permanent lock state
  if (needsSetup === false) {
    return (
      <div className="min-h-screen bg-[#1F3524] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#5B755D]/20 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black text-[#171A18]">Setup Permanently Locked</h2>
          <p className="text-xs text-[#525B54] leading-relaxed">
            The master Super Admin account for Organiva has already been established. For security reasons, this setup page has been permanently disabled.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#5B755D] text-white text-xs font-bold hover:bg-[#435845] transition-all"
            >
              <span>Go to Admin Login</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F3524] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#5B755D]/20 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] mx-auto flex items-center justify-center p-1 border border-[#5B755D]/20">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3 py-1 rounded-full border border-[#5B755D]/20">
            One-Time Master Setup
          </span>
          <h1 className="text-2xl font-black text-[#171A18] tracking-tight">Create Super Admin</h1>
          <p className="text-xs text-[#525B54] max-w-sm mx-auto">
            Initialize your master owner credentials. Once submitted, this form is permanently locked and cannot be reopened.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Master Super Admin created successfully! Redirecting to Dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Muhammad Nawaz (Store Owner)"
                className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Master Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@organiva.pk"
                className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">WhatsApp / Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A18] mb-1">Master Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A18] mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#5B755D]/15 text-[11px] text-[#525B54] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#171A18]">
              <ShieldCheck size={14} className="text-[#5B755D]" />
              <span>Full Administrative Authority</span>
            </div>
            <p>
              As Super Admin, you will be the only person able to create staff accounts, assign managers, and configure granular permissions (e.g. restrict suppliers, financial profits, or stock controls).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>{loading ? 'Initializing Super Admin...' : 'Establish Master Super Admin'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-1">
          <Link href="/admin/login" className="text-xs text-[#5B755D] hover:underline font-semibold">
            Already have staff credentials? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
