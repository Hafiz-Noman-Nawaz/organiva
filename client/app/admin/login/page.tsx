'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  React.useEffect(() => {
    async function checkSetup() {
      try {
        const res = await api.get('/auth/setup-status');
        if (res.success && res.needsSetup) {
          setNeedsSetup(true);
        } else {
          setNeedsSetup(false);
        }
      } catch (err) {
        // Fallback
      }
    }
    checkSetup();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('organiva_admin_token', res.token);
        localStorage.setItem('organiva_admin_user', JSON.stringify(res.user));
        router.push('/admin');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F3524] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#5B755D]/20 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] mx-auto flex items-center justify-center p-1 border border-[#5B755D]/20">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
          </div>
          <h1 className="text-2xl font-black text-[#171A18] tracking-tight">ORGANIVA CMS</h1>
          <p className="text-xs text-[#525B54]">Staff & Operations Dashboard</p>
        </div>

        {needsSetup && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={16} className="text-amber-600" />
              <span>Initial Setup Required</span>
            </div>
            <p>No master Super Admin account exists yet. Please establish your credentials to lock initial setup.</p>
            <a
              href="/admin/setup"
              className="inline-flex items-center gap-1 font-bold text-[#5B755D] hover:underline"
            >
              <span>Setup Master Super Admin Account →</span>
            </a>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-[#5B755D]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-[#7F8681]">
            Restricted System • Authorized Organiva Staff Only
          </p>
        </div>
      </div>
    </div>
  );
}
