import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { isClerkKeyConfigured } from '@/lib/clerkConfig';
import { ShieldCheck, Key, ArrowRight, ShoppingBag } from 'lucide-react';

export default function SignInPage() {
  const isConfigured = isClerkKeyConfigured();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#FAF8F5]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D]">Customer Account</span>
          <h1 className="text-2xl font-black text-[#171A18] mt-1">Sign in to Organiva</h1>
          <p className="text-xs text-[#525B54] mt-1">Track your orders, view receipts, and manage shipping addresses</p>
        </div>

        {isConfigured ? (
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#5B755D] hover:bg-[#435845] text-sm font-bold',
                  card: 'shadow-xl rounded-2xl border border-[#5B755D]/15',
                },
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#5B755D]/20 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center mx-auto border border-[#5B755D]/20">
              <Key size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171A18]">Clerk Customer Auth Ready</h3>
              <p className="text-xs text-[#525B54] mt-1.5 leading-relaxed">
                Customer sign-in is built with Clerk. To activate live customer logins, create a free project at{' '}
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#5B755D] hover:underline"
                >
                  dashboard.clerk.com
                </a>{' '}
                and paste your keys into <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded text-[11px] font-mono border border-gray-200">client/.env.local</code>.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl text-left text-[11px] text-[#525B54] space-y-1 border border-[#5B755D]/15">
              <span className="font-bold text-[#171A18] block">Required in client/.env.local:</span>
              <p className="font-mono text-[10px] text-[#5B755D]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</p>
              <p className="font-mono text-[10px] text-[#5B755D]">CLERK_SECRET_KEY=sk_test_...</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/shop"
                className="w-full py-3 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag size={15} />
                <span>Continue Shopping as Guest</span>
              </Link>
              <Link
                href="/admin/login"
                className="text-xs text-[#7F8681] hover:text-[#171A18] transition-colors py-1"
              >
                Store Owner / Staff? Go to Admin Portal →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
