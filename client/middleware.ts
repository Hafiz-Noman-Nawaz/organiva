import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Check if a real Clerk publishable key has been configured by the owner
function isRealClerkKeyConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  if (!key) return false;
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  // Exclude dummy placeholder strings
  if (key.includes('b3JnYW5pdmEtZGV2') || key.includes('sample') || key.includes('placeholder')) {
    return false;
  }
  return true;
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  // If the route is an admin route or api, bypass completely
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api')) {
    return;
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // 1. Strictly bypass all Clerk processing for Admin and API endpoints
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. If Clerk keys are unconfigured or placeholder, bypass to prevent invalid-host redirect loops
  if (!isRealClerkKeyConfigured()) {
    return NextResponse.next();
  }

  // 3. Delegate to Clerk when live credentials exist
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
