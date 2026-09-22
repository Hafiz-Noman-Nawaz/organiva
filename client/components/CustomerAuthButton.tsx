'use client';

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import { isClerkKeyConfigured } from '@/lib/clerkConfig';

function ClerkUserComponent({ isMobile = false }: { isMobile?: boolean }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-black/5 animate-pulse flex items-center justify-center">
        <User size={16} className="text-gray-400" />
      </div>
    );
  }

  if (isMobile) {
    if (isSignedIn) {
      return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#5B755D]/20">
          <span className="text-xs font-bold text-[#171A18]">My Account</span>
          <UserButton />
        </div>
      );
    }
    return (
      <Link
        href="/sign-in"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#5B755D] text-white"
      >
        <User size={16} />
        <span>Customer Sign In</span>
      </Link>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center justify-center p-1">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-7 h-7 border border-[#5B755D]/30 shadow-xs',
            },
          }}
        />
      </div>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="p-2 text-[#2E332F] hover:text-[#5B755D] transition-colors rounded-full hover:bg-black/5 flex items-center justify-center"
      title="Customer Sign In"
    >
      <User size={20} />
    </Link>
  );
}

export function CustomerAuthButton({ isMobile = false }: { isMobile?: boolean }) {
  const isConfigured = isClerkKeyConfigured();

  if (!isConfigured) {
    if (isMobile) {
      return (
        <Link
          href="/sign-in"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#5B755D] text-white"
        >
          <User size={16} />
          <span>Customer Sign In</span>
        </Link>
      );
    }
    return (
      <Link
        href="/sign-in"
        className="p-2 text-[#2E332F] hover:text-[#5B755D] transition-colors rounded-full hover:bg-black/5 flex items-center justify-center"
        title="Customer Sign In"
      >
        <User size={20} />
      </Link>
    );
  }

  return <ClerkUserComponent isMobile={isMobile} />;
}
