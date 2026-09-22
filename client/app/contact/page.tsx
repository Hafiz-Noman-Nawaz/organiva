'use client';

import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] bg-[#EBF1EB] px-3.5 py-1 rounded-full border border-[#5B755D]/20">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171A18] tracking-tight mt-2">
            We’re Here to Help
          </h1>
          <p className="text-sm text-[#525B54] mt-2">
            Have questions regarding products, your order shipment, or corporate orders? Reach our Pakistani support team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-[#171A18]">Direct Channels</h3>

              <div className="space-y-4 text-xs sm:text-sm text-[#525B54]">
                <a
                  href={getWhatsAppUrl('Hi Organiva! I would like to get in touch with customer support.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EBF1EB] transition-colors border border-[#5B755D]/15 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-[#171A18] block group-hover:text-[#5B755D]">
                      WhatsApp Official
                    </span>
                    <span className="text-xs text-[#7F8681]">{WHATSAPP_FORMATTED_NUMBER}</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15">
                  <div className="w-10 h-10 rounded-xl bg-[#5B755D] text-white flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-[#171A18] block">Email Support</span>
                    <span className="text-xs text-[#7F8681]">support@organiva.pk</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15">
                  <div className="w-10 h-10 rounded-xl bg-[#1F3524] text-white flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-[#171A18] block">Support Hours</span>
                    <span className="text-xs text-[#7F8681]">Mon – Sat: 10:00 AM – 8:00 PM PKT</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15">
                  <div className="w-10 h-10 rounded-xl bg-[#435845] text-white flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-[#171A18] block">Dispatch Hub</span>
                    <span className="text-xs text-[#7F8681]">Lahore Logistics Center, Punjab, Pakistan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#5B755D]/15 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF1EB] text-[#5B755D] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-[#171A18]">Message Sent Successfully</h3>
                <p className="text-xs text-[#525B54] max-w-sm mx-auto">
                  Thank you, {name}. Our customer care team will review your inquiry and get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-[#171A18]">Send Us a Message</h3>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Email or Phone *</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 0300 1234567 or email@domain.com"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help with your order or product inquiries?"
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send size={16} />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
