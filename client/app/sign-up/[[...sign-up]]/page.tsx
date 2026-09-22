import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { isClerkKeyConfigured } from '@/lib/clerkConfig';
import { Key, ShoppingBag } from 'lucide-react';

export default function SignUpPage() {
  const isConfigured = isClerkKeyConfigured();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#FAF8F5]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D]">Customer Account</span>
          <h1 className="text-2xl font-black text-[#171A18] mt-1">Join the Organiva Circle</h1>
          <p className="text-xs text-[#525B54] mt-1">Create an account for one-click checkout and VIP drops</p>
        </div>

        {isConfigured ? (
          <div className="flex justify-center">
            <SignUp
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
              <h3 className="text-base font-bold text-[#171A18]">Clerk Customer Registration Ready</h3>
              <p className="text-xs text-[#525B54] mt-1.5 leading-relaxed">
                Customer sign-up is built with Clerk. Once you add your live Clerk keys from{' '}
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#5B755D] hover:underline"
                >
                  dashboard.clerk.com
                </a>{' '}
                into <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded text-[11px] font-mono border border-gray-200">client/.env.local</code>, registration will activate automatically.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/shop"
                className="w-full py-3 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag size={15} />
                <span>Shop Everyday Essentials</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
