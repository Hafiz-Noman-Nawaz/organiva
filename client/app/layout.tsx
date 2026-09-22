import type { Metadata } from 'next';
import './globals.css';
import { ClerkWrapper } from '@/components/ClerkWrapper';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'ORGANIVA — Smart products. Simpler living. | DTC Everyday Essentials Pakistan',
  description:
    'Discover Organiva: Pakistan’s premium brand for smart, minimal everyday products that solve daily problems around home, kitchen, workspace, and car. Cash on Delivery available nationwide.',
  keywords: [
    'organiva',
    'smart products pakistan',
    'kitchen gadgets pakistan',
    'everyday essentials',
    'bag heat sealer',
    'cord organizer',
    'magsafe car mount',
    'cash on delivery pakistan',
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'ORGANIVA — Smart products. Simpler living.',
    description: 'High-quality everyday problem solvers for Pakistani homes and modern lifestyles.',
    url: 'https://organiva.pk',
    siteName: 'ORGANIVA',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'ORGANIVA Brand Logo',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('organiva_theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var theme = (saved === 'dark' || (!saved && prefersDark)) ? 'dark' : 'light';
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                      document.documentElement.style.colorScheme = 'dark';
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.setAttribute('data-theme', 'light');
                      document.documentElement.style.colorScheme = 'light';
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body
          suppressHydrationWarning
          className="antialiased min-h-screen flex flex-col selection:bg-[#5B755D] selection:text-white"
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkWrapper>
  );
}
