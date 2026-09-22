'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

export const WhatsAppFloat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickOptions = [
    { label: '📦 Track My Order', text: 'Hi Organiva! I would like to check the tracking status of my order.' },
    { label: '❓ Product Question', text: 'Hello, I have a quick question regarding one of your products.' },
    { label: '⚡ Order via WhatsApp', text: 'Hi, I would like to place an order directly via WhatsApp with Cash on Delivery.' },
  ];

  const handleOpenChat = (message: string) => {
    window.open(getWhatsAppUrl(message), '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#5B755D]/20 p-4 animate-scale-in text-[#171A18]">
          <div className="flex items-center justify-between pb-3 border-b border-[#5B755D]/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                <MessageCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Organiva Customer Care</h4>
                <p className="text-[11px] text-[#5B755D] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  Online | Typically replies in mins
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#7F8681] hover:text-[#171A18] p-1"
              aria-label="Close WhatsApp chat"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-[#525B54] py-3">
            Assalam-o-alaikum! How can our Pakistani team assist you today?
          </p>

          <div className="space-y-2">
            {quickOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleOpenChat(opt.text)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-[#FAF8F5] hover:bg-[#EBF1EB] text-[#2E332F] transition-colors border border-[#5B755D]/10 flex items-center justify-between"
              >
                <span>{opt.label}</span>
                <span className="text-[#5B755D]">→</span>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => handleOpenChat('Hi Organiva, I need assistance.')}
              className="text-xs text-[#25D366] font-semibold hover:underline"
            >
              Open Direct WhatsApp Chat
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer relative group"
        aria-label="Contact via WhatsApp"
      >
        <MessageCircle size={28} className="transition-transform group-hover:rotate-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          1
        </span>
      </button>
    </div>
  );
};
