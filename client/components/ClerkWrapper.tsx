import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { isClerkKeyConfigured } from '@/lib/clerkConfig';

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const isConfigured = isClerkKeyConfigured();

  if (!isConfigured) {
    // Graceful fallback: do not mount ClerkProvider to avoid invalid host handshake redirect
    return <>{children}</>;
  }

  return <ClerkProvider dynamic>{children}</ClerkProvider>;
}
