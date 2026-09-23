'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

const VISITOR_STORAGE_KEY = 'organiva_vid';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let vid = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_STORAGE_KEY, vid);
    }
    return vid;
  } catch {
    return 'v_anon';
  }
}

export function TelemetryTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>('');

  const sendEvent = (eventType: 'impression' | 'click', path: string, metadata?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!path || path.startsWith('/admin')) return;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    try {
      api.post('/telemetry/track', {
        eventType,
        path,
        visitorId,
        metadata: {
          referrer: document.referrer || undefined,
          ...metadata,
        },
      }).catch(() => {
        // Telemetry is silent and non-blocking
      });
    } catch {
      // Ignore
    }
  };

  // Track page impression on route changes
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (lastTrackedPath.current === pathname) return;

    lastTrackedPath.current = pathname;
    sendEvent('impression', pathname);

    // If customer navigates directly to a product page, also count as a product view click
    if (pathname.startsWith('/products/')) {
      sendEvent('click', pathname, { directProductView: true });
    }
  }, [pathname]);

  // Global listener for customer product clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Check if click was on or inside an anchor targeting /products/
        const anchor = target.closest('a') as HTMLAnchorElement | null;
        if (anchor && anchor.href) {
          const url = new URL(anchor.href, window.location.origin);
          if (url.pathname.startsWith('/products/')) {
            sendEvent('click', url.pathname);
            return;
          }
        }

        // Check if click was on an element with data-track="product-click"
        const trackEl = target.closest('[data-track="product-click"]') as HTMLElement | null;
        if (trackEl) {
          const productSlug = trackEl.getAttribute('data-product-slug') || window.location.pathname;
          sendEvent('click', productSlug);
        }
      } catch {
        // Ignore
      }
    };

    document.addEventListener('click', handleDocumentClick, { passive: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return null;
}
