import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw, Headphones, MessageCircle, Heart, Lock } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

export const Footer = ({ onOpenOrgi }: { onOpenOrgi?: () => void }) => {
  return (
    <footer className="bg-[#172319] text-[#FAF8F5] pt-16 pb-12 border-t border-[#253927]">
      {/* Upper Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-[#2C422F]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#273E2B] flex items-center justify-center shrink-0 text-[#8EB892]">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF]">Nationwide Delivery</h4>
              <p className="text-xs text-[#A1ACA2] mt-0.5">2–4 business days across Pakistan</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#273E2B] flex items-center justify-center shrink-0 text-[#8EB892]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF]">Cash on Delivery</h4>
              <p className="text-xs text-[#A1ACA2] mt-0.5">Pay in cash upon doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#273E2B] flex items-center justify-center shrink-0 text-[#8EB892]">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF]">7-Day Replacement</h4>
              <p className="text-xs text-[#A1ACA2] mt-0.5">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#273E2B] flex items-center justify-center shrink-0 text-[#8EB892]">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#FFFFFF]">WhatsApp Support</h4>
              <p className="text-xs text-[#A1ACA2] mt-0.5">Quick human answers: {WHATSAPP_FORMATTED_NUMBER}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white p-0.5 flex items-center justify-center">
                <Image src="/logo.png" alt="ORGANIVA" width={28} height={28} className="object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-sans">ORGANIVA</span>
            </Link>
            <p className="text-sm text-[#A1ACA2] leading-relaxed max-w-sm">
              Smart products. Simpler living. We design and curate thoughtful everyday essentials that eliminate friction in Pakistani homes, kitchens, cars, and workspaces.
            </p>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl('Hi Organiva, I have a question about a product')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#253D2A] hover:bg-[#314E36] text-[#E5ECE5] text-xs font-medium transition-colors border border-[#3D5B43]"
              >
                <MessageCircle size={15} className="text-[#8EB892]" />
                <span>Chat on WhatsApp ({WHATSAPP_FORMATTED_NUMBER})</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold tracking-wider uppercase text-[#8EB892] mb-4">Explore</h5>
            <ul className="space-y-2.5 text-sm text-[#CAD3CA]">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=kitchen" className="hover:text-white transition-colors">Kitchen Essentials</Link></li>
              <li><Link href="/shop?category=workspace" className="hover:text-white transition-colors">Desk & Workspace</Link></li>
              <li><Link href="/shop?category=car" className="hover:text-white transition-colors">Car Accessories</Link></li>
              <li><Link href="/shop?category=home" className="hover:text-white transition-colors">Home Organization</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-semibold tracking-wider uppercase text-[#8EB892] mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-sm text-[#CAD3CA]">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">7-Day Replacement Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenOrgi) onOpenOrgi();
                    else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-orgi-chat'));
                  }}
                  className="text-left text-[#8EB892] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ask Orgi (AI Assistant)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Management */}
          <div>
            <h5 className="text-xs font-semibold tracking-wider uppercase text-[#8EB892] mb-4">Company</h5>
            <ul className="space-y-2.5 text-sm text-[#CAD3CA]">
              <li><Link href="/about" className="hover:text-white transition-colors">About Organiva</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8EB892] hover:text-white transition-colors group mt-1"
                >
                  <Lock size={12} className="text-[#8EB892] group-hover:scale-110 transition-transform" />
                  <span>Admin Management</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Protected Admin Button & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#233525] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A968B]">
        <div className="flex flex-wrap items-center gap-3">
          <p>© {new Date().getFullYear()} ORGANIVA Pakistan. All rights reserved. Crafted for simpler living.</p>
          <span className="hidden sm:inline text-[#354D38]">•</span>
          {/* Protected Route Button */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A2C1E] hover:bg-[#253D2A] text-[#8EB892] hover:text-white transition-all text-[11px] font-medium border border-[#2E4833] hover:border-[#5B755D]/60 shadow-2xs group"
            title="Authorized Staff & Master Control Panel (Protected)"
          >
            <Lock size={11} className="text-[#8EB892] group-hover:text-white transition-colors" />
            <span>Admin Portal</span>
          </Link>
        </div>
        
        {/* Payment Methods Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#A1ACA2] mr-1">Supported Payments:</span>
          <span className="px-2 py-0.5 rounded bg-[#203123] border border-[#2F4432] text-white text-[10px] font-medium">Cash on Delivery</span>
          <span className="px-2 py-0.5 rounded bg-[#203123] border border-[#2F4432] text-[#FF5B00] text-[10px] font-bold">JazzCash</span>
          <span className="px-2 py-0.5 rounded bg-[#203123] border border-[#2F4432] text-[#00C250] text-[10px] font-bold">Easypaisa</span>
        </div>
      </div>
    </footer>
  );
};
