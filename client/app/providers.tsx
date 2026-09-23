'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/lib/cartContext';
import { ThemeProvider, useTheme } from '@/lib/themeContext';
import { ClickSpark } from '@/components/ClickSpark';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { OrgiChatWidget } from '@/components/OrgiChatWidget';
import { TelemetryTracker } from '@/components/TelemetryTracker';

function ThemedClickSpark({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <ClickSpark sparkColor={isDark ? '#8ED496' : '#5B755D'} sparkSize={11} sparkRadius={18} sparkCount={8} duration={420}>
      {children}
    </ClickSpark>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const handleOpenOrgi = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-orgi-chat'));
    }
  };

  return (
    <ThemeProvider>
      <ThemedClickSpark>
        <CartProvider>
          {!isAdminRoute && <Navbar onOpenOrgi={handleOpenOrgi} />}

          <main className="flex-1">{children}</main>

          {!isAdminRoute && <Footer onOpenOrgi={handleOpenOrgi} />}
          {!isAdminRoute && <CartDrawer />}

          {/* Floating Orgi Chatbot Launcher & Non-blocking Floating Dock */}
          {!isAdminRoute && <OrgiChatWidget />}

          {/* Real-time Customer Telemetry Tracker */}
          {!isAdminRoute && <TelemetryTracker />}
        </CartProvider>
      </ThemedClickSpark>
    </ThemeProvider>
  );
}

