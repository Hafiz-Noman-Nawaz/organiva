'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Send, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import { WHATSAPP_FORMATTED_NUMBER } from '@/lib/contact';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: any[];
  timestamp: string;
}

const parseBold = (text: string, isUser: boolean) => {
  if (!text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-[#171A18]'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderFormattedMessage = (content: string, isUser: boolean) => {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full min-w-0 select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Horizontal divider
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className={`my-2 border-t ${isUser ? 'border-white/20' : 'border-[#5B755D]/15'}`} />;
        }

        // Headings: ### Header or ## Header
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4
              key={idx}
              className={`text-xs sm:text-sm font-bold mt-2 mb-0.5 break-words [overflow-wrap:anywhere] ${
                isUser ? 'text-white' : 'text-[#171A18]'
              }`}
            >
              {parseBold(headingText, isUser)}
            </h4>
          );
        }

        // Bullet lists: * item or - item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 text-xs sm:text-sm pl-1 break-words [overflow-wrap:anywhere]">
              <span className={`mt-1 shrink-0 text-[10px] ${isUser ? 'text-white/80' : 'text-[#5B755D]'}`}>•</span>
              <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">{parseBold(itemText, isUser)}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">
            {parseBold(line, isUser)}
          </p>
        );
      })}
    </div>
  );
};

export const AiConciergeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am the **Organiva AI Concierge**. I have real-time access to our entire product inventory, prices, and practical living guides. How can I help you simplify your home, kitchen, workspace, or car today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What do you recommend for keeping opened snack bags fresh?',
    'What is your best product for messy desk cables?',
    'How does Cash on Delivery and shipping work?',
    'Tell me about the 7-day replacement warranty.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { query: text });
      const aiMsg: Message = {
        role: 'assistant',
        content: res.answer,
        recommendedProducts: res.recommendedProducts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            `I'm momentarily having trouble reaching the knowledge base. Please feel free to check our Shop page or reach our human team on WhatsApp at ${WHATSAPP_FORMATTED_NUMBER}!`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#5B755D]/25 flex flex-col h-[620px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1F3524] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5B755D] flex items-center justify-center text-white shadow-xs">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Organiva AI Concierge</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#8EB892]/20 text-[#8EB892] text-[10px] font-semibold tracking-wide uppercase">
                  RAG Knowledge Base
                </span>
              </div>
              <p className="text-xs text-[#CAD3CA] mt-0.5">Live store inventory & product guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#CAD3CA] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-4 overscroll-contain">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-[#5B755D] text-white rounded-br-none shadow-xs'
                    : 'bg-[#FFFFFF] text-[#171A18] rounded-bl-none border border-[#5B755D]/15 shadow-xs'
                }`}
              >
                {renderFormattedMessage(msg.content, msg.role === 'user')}

                {/* Recommended Product Cards inside AI response */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#5B755D]/15 space-y-2">
                    <p className="text-[11px] font-semibold text-[#5B755D] uppercase tracking-wider">
                      Recommended for your need:
                    </p>
                    {msg.recommendedProducts.map((p: any) => (
                      <div
                        key={p._id || p.slug}
                        className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#5B755D]/20 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#5B755D]/10 relative">
                            <Image
                              src={p.images?.[0] || '/images/products/orbitseal-main.webp'}
                              alt={p.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-[#171A18] line-clamp-1">
                              {p.title}
                            </h5>
                            <p className="text-xs font-bold text-[#5B755D]">
                              PKR {p.salePrice || p.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={onClose}
                            className="p-1.5 text-xs text-[#5B755D] hover:bg-[#5B755D]/10 rounded-lg transition-colors font-medium flex items-center gap-1"
                          >
                            <span>View</span>
                            <ArrowRight size={12} />
                          </Link>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="p-1.5 bg-[#5B755D] hover:bg-[#435845] text-white rounded-lg transition-colors"
                            title="Add to Bag"
                          >
                            <ShoppingBag size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#7F8681] mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#5B755D] p-2 bg-[#EBF1EB] rounded-xl w-fit animate-pulse">
              <Sparkles size={14} className="animate-spin" />
              <span>Analyzing Organiva products and knowledge base...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Inquiries */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-[#F3EFE9] border-t border-[#5B755D]/10 overflow-x-auto flex gap-2 no-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 text-xs bg-white text-[#2E332F] hover:text-[#5B755D] hover:border-[#5B755D] px-3 py-1.5 rounded-full border border-[#5B755D]/15 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#5B755D]/15">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g., 'What product solves stale chips?')..."
              className="flex-1 bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-4 py-2.5 text-sm text-[#171A18] placeholder-[#7F8681] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-[#5B755D] hover:bg-[#435845] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
