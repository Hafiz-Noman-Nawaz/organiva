'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, MessageCircle } from 'lucide-react';
import { CustomerAuthButton } from '@/components/CustomerAuthButton';
import { useCart } from '@/lib/cartContext';
import { OrgiAvatar } from '@/components/OrgiAvatar';
import { JellyRadio } from '@/components/JellyRadio';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/lib/themeContext';

export const Navbar = ({
  onOpenAi,
  onOpenOrgi,
}: {
  onOpenAi?: () => void;
  onOpenOrgi?: () => void;
}) => {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { itemCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'All Organizers', href: '/shop' },
    { name: 'Kitchen & Pantry', href: '/shop?category=kitchen' },
    { name: 'Closet & Wardrobe', href: '/shop?category=closet' },
    { name: 'Desk & Workspace', href: '/shop?category=workspace' },
    { name: 'Declutter Quiz', href: '/#quiz-section' },
    { name: 'Track Order', href: '/track-order' },
  ];

  const jellyNavItems = navLinks.map((link) => ({
    value: link.href,
    label: link.name,
  }));

  const activeNavValue = React.useMemo(() => {
    if (typeof window === 'undefined') return pathname;
    const full = pathname + (window.location.search || '');
    if (navLinks.some((l) => l.href === full)) return full;
    if (navLinks.some((l) => l.href === pathname)) return pathname;
    return undefined;
  }, [pathname]);

  const handleNavSelect = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.replace('/#', '');
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#1A2E1D] text-[#FAF8F5] text-xs font-normal py-2 px-4 text-center tracking-wide flex items-center justify-between sm:justify-center gap-2 border-b border-[#2D4531]">
        <div className="flex items-center gap-2 mx-auto flex-wrap justify-center text-[11px] sm:text-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8EB892] animate-pulse"></span>
          <span>
            <strong>FREE Nationwide Express Delivery</strong> on orders over Rs. 3,500 | Cash on Delivery Available
          </span>
          <span className="hidden md:inline text-white/40">&bull;</span>
          <a
            href={getWhatsAppUrl('Hi Organiva! I need help with an order.')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 font-bold text-[#8EB892] hover:text-white transition-colors"
          >
            <span>Direct Helpline: {WHATSAPP_FORMATTED_NUMBER}</span>
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-md ${
          isScrolled
            ? 'bg-[#FAF8F5]/95 dark:bg-[#0D160E]/95 shadow-sm py-3 border-b border-[#5B755D]/15 dark:border-[#759A78]/20'
            : 'bg-[#FAF8F5]/90 dark:bg-[#0D160E]/90 py-4 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Trigger / Desktop Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#171A18] hover:text-[#5B755D] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop Navigation Menu Items with React Bits JellyRadio */}
            <nav className="hidden lg:flex items-center min-h-[36px]">
              {mounted ? (
                <JellyRadio
                  items={jellyNavItems}
                  value={activeNavValue}
                  onChange={(val) => handleNavSelect(val)}
                  chipColor="transparent"
                  activeColor="#5B755D"
                  textColor={isDark ? '#E2ECE3' : '#2E332F'}
                  activeTextColor="#FFFFFF"
                  size="sm"
                  gap={2}
                  radius={9999}
                  swell={0.12}
                  barge={4}
                  shrink={0.03}
                  jelly={0.8}
                  bounce={0.25}
                  stagger={20}
                  stiffness={560}
                />
              ) : (
                <div className="flex items-center gap-1">
                  {navLinks.map((link) => (
                    <span
                      key={link.href}
                      className="px-3 py-1.5 text-xs font-medium text-[#2E332F] dark:text-[#E2ECE3] opacity-75"
                    >
                      {link.name}
                    </span>
                  ))}
                </div>
              )}
            </nav>
          </div>

          {/* Center: Brand Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#5B755D]/20 shadow-xs group-hover:scale-105 transition-transform bg-[#FFFFFF] flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="ORGANIVA Logo"
                width={34}
                height={34}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#171A18] font-sans leading-none">
                ORGANIVA
              </span>
              <span className="text-[9px] tracking-widest text-[#5B755D] font-semibold uppercase mt-0.5">
                Smart Living
              </span>
            </div>
          </Link>

          {/* Right: WhatsApp Support, Search, Cart */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Chat on WhatsApp Trigger */}
            <a
              href={getWhatsAppUrl('Hi Organiva, I have a question about your home organizers')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E8F8EE] text-[#1B7032] hover:bg-[#25D366] hover:text-white transition-all shadow-2xs border border-[#25D366]/35 cursor-pointer group"
              title={`Chat with Organiva Support on WhatsApp (${WHATSAPP_FORMATTED_NUMBER})`}
            >
              <MessageCircle size={15} className="text-[#25D366] group-hover:text-white transition-colors" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#2E332F] hover:text-[#5B755D] transition-colors rounded-full hover:bg-black/5"
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>

            {/* Theme Mode Switcher */}
            <ThemeToggle />

            {/* Customer Account Button */}
            <CustomerAuthButton />

            {/* Cart Bag Icon with Counter */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#2E332F] hover:text-[#5B755D] transition-colors rounded-full hover:bg-black/5 flex items-center justify-center"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={21} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5B755D] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FAF8F5] animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {isSearchOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 border-t border-[#5B755D]/10 mt-3 animate-fade-down">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-xl mx-auto">
              <Search size={18} className="absolute left-3.5 text-[#5B755D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search home organizers (turntable, vacuum cubes, cable hub, key dock)..."
                className="w-full bg-[#FFFFFF] border border-[#5B755D]/25 rounded-full pl-10 pr-24 py-2.5 text-sm text-[#171A18] placeholder-[#7F8681] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-medium rounded-full transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Animated Drawer Menu (Silky Smooth Slide-In from Left with Backdrop Fade) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'pointer-events-auto visible delay-0' : 'pointer-events-none invisible delay-500'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-500 ease-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel: Silky Smooth Slide from Left */}
        <aside
          className={`relative w-[82%] max-w-xs bg-[#FAF8F5] dark:bg-[#0A120B] h-full shadow-[8px_0_40px_rgba(0,0,0,0.22)] z-10 flex flex-col p-6 border-r border-[#5B755D]/20 overflow-y-auto transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#5B755D]/15">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded" />
              <span className="font-extrabold text-lg text-[#171A18] tracking-tight">ORGANIVA</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-[#2E332F] hover:text-[#5B755D] hover:bg-[#EBF1EB] dark:hover:bg-[#1A2D1D] transition-colors cursor-pointer"
                aria-label="Close Navigation Menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#2E332F] hover:text-[#5B755D] hover:bg-[#EBF1EB]/70 dark:hover:bg-[#1A2D1D]/70 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group"
              >
                <span>{link.name}</span>
                <span className="text-xs text-[#5B755D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold">
                  →
                </span>
              </Link>
            ))}
          </nav>

          {/* Direct CTA Buttons & Contact */}
          <div className="mt-8 pt-6 border-t border-[#5B755D]/15 space-y-3">
            <a
              href={getWhatsAppUrl('Hi Organiva, I have a question about your home organizers')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E8F8EE] hover:bg-[#d5f3df] text-[#1B7032] border border-[#25D366]/35 shadow-2xs transition-colors"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              <span>Chat on WhatsApp ({WHATSAPP_FORMATTED_NUMBER})</span>
            </a>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenOrgi) onOpenOrgi();
                else if (onOpenAi) onOpenAi();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-[#132115] text-[#171A18] border border-[#5B755D]/20 shadow-2xs hover:bg-[#EBF1EB] transition-colors cursor-pointer"
            >
              <OrgiAvatar size="xs" state="idle" />
              <span>Chat with Orgi (Home AI)</span>
            </button>

            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full block text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-[#132115] text-[#2E332F] border border-[#5B755D]/20 hover:bg-[#EBF1EB] transition-colors"
            >
              Track Your Order
            </Link>

            <CustomerAuthButton isMobile={true} />
          </div>

          {/* Footer Branding */}
          <div className="mt-auto pt-6 text-xs text-[#7F8681] text-center border-t border-[#5B755D]/10">
            <p className="font-semibold text-[#171A18]">Pakistani DTC Quality Brand</p>
            <p className="mt-0.5 text-[11px] text-[#5B755D]">Thoughtful spaces. Calmer minds.</p>
          </div>
        </aside>
      </div>
    </>
  );
};
