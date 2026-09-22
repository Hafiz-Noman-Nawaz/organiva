'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import { OrgiAvatar, OrgiState } from '@/components/OrgiAvatar';
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

export const OrgiChatWidget = () => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPromptedBubble, setHasPromptedBubble] = useState(true);
  const [orgiState, setOrgiState] = useState<OrgiState>('idle');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Assalam-o-alaikum! I'm **Orgi**, your personal home organization companion. I know every detail about our storage systems, pantry organizers, wardrobe savers, and prices.\n\nWhich room in your house would you like to declutter today?",
      timestamp: 'Just now',
    },
  ]);

  const suggestedQuestions = [
    'How do I organize messy spice jars & deep cabinets?',
    'What is your best solution for bulky winter blankets?',
    'Which organizer keeps phone charging cables in line?',
    'How does Cash on Delivery (COD) work nationwide?',
  ];

  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
      setHasPromptedBubble(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    };
    window.addEventListener('open-orgi-chat', handleOpen);
    return () => window.removeEventListener('open-orgi-chat', handleOpen);
  }, []);

  // Scroll to bottom on message or state update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen, isMinimized]);

  // Handle closing completely
  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
    setIsMinimized(false);
    setOrgiState('idle');
  };

  // Handle minimizing / toggling
  const handleToggleMinimize = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMinimized((prev) => !prev);
  };

  // Open from floating button
  const handleOpenWidget = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
    setHasPromptedBubble(false);
    setTimeout(() => inputRef.current?.focus(), 250);
  };

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

    // Dynamic animation sequence: 1. Thinking -> 2. Retrieving -> 3. Telling -> 4. Idle
    setOrgiState('thinking');
    const retrievingTimer = setTimeout(() => {
      setOrgiState('retrieving');
    }, 600);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${apiUrl}/ai/chat-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      clearTimeout(retrievingTimer);

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      setOrgiState('telling');

      let streamedText = '';
      let recommendedProducts: any[] = [];

      // Append initial streaming bubble
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          recommendedProducts: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                streamedText += data.text;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === 'assistant') {
                    copy[copy.length - 1] = {
                      ...last,
                      content: streamedText,
                    };
                  }
                  return copy;
                });
              }
              if (data.recommendedProducts && Array.isArray(data.recommendedProducts)) {
                recommendedProducts = data.recommendedProducts;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === 'assistant') {
                    copy[copy.length - 1] = {
                      ...last,
                      recommendedProducts,
                    };
                  }
                  return copy;
                });
              }
            } catch {
              // skip non-json frames
            }
          }
        }
      }

      setTimeout(() => {
        setOrgiState('idle');
      }, 3500);
    } catch {
      clearTimeout(retrievingTimer);
      // Resilient fallback to standard JSON endpoint
      try {
        const res = await api.post('/ai/chat', { query: text });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.answer || "Here is what I found for your space in our home catalog.",
            recommendedProducts: res.recommendedProducts || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setOrgiState('idle');
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              `I'm momentarily syncing with our inventory catalog. In the meantime, you can explore our curated spaces or chat with our human team on WhatsApp at ${WHATSAPP_FORMATTED_NUMBER}!`,
            timestamp: 'Just now',
          },
        ]);
        setOrgiState('idle');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING CHAT DOCK (Anchored in bottom right, NON-BLOCKING to allow free store interaction) */}
      <div
        className={`fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[420px] transition-all duration-300 ease-out origin-bottom-right pointer-events-auto ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
        }`}
      >
        <div
          className={`bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#5B755D]/25 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-[62px]' : 'h-[580px] max-h-[calc(100dvh-6.5rem)]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#172319] text-white px-4 py-3 sm:px-5 flex items-center justify-between shrink-0 select-none border-b border-[#253927]">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={handleToggleMinimize}
              title={isMinimized ? 'Click to expand Orgi' : 'Click to minimize'}
            >
              {/* Orgi Animated Face */}
              <OrgiAvatar state={orgiState} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                    <span>Orgi</span>
                    <span className="text-[10px] bg-[#8EB892]/20 text-[#8EB892] font-semibold px-2 py-0.2 rounded-full border border-[#8EB892]/30">
                      Organiva AI
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-[#A1ACA2] mt-0.5 flex items-center gap-1.5 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      orgiState === 'retrieving'
                        ? 'bg-[#8EB892] animate-ping'
                        : orgiState === 'thinking'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-[#8EB892]'
                    }`}
                  />
                  <span className="truncate">
                    {orgiState === 'thinking' && 'Thinking about your space...'}
                    {orgiState === 'retrieving' && 'Scanning home organizer catalog...'}
                    {orgiState === 'telling' && 'Orgi is answering...'}
                    {orgiState === 'idle' && 'Live store inventory • Ready to help'}
                    {orgiState === 'happy' && 'Always here for you!'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Down Arrow (Minimize) & Cross (Close) */}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button
                onClick={handleToggleMinimize}
                className="p-1.5 text-[#CAD3CA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat (Down Arrow)'}
                aria-label="Minimize or Expand Chat"
              >
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-[#CAD3CA] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Chat (Cross)"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 bg-[#FAF8F5] overscroll-contain">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[92%] sm:max-w-[88%] min-w-0 w-fit">
                      {msg.role === 'assistant' && (
                        <div className="mt-1 shrink-0">
                          <OrgiAvatar state={i === messages.length - 1 ? orgiState : 'idle'} size="xs" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 sm:px-4 text-xs sm:text-sm leading-relaxed shadow-2xs min-w-0 flex-1 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden ${
                          msg.role === 'user'
                            ? 'bg-[#5B755D] text-white rounded-br-none'
                            : 'bg-white text-[#171A18] rounded-bl-none border border-[#5B755D]/15'
                        }`}
                      >
                        {renderFormattedMessage(msg.content, msg.role === 'user')}

                        {/* Recommended Products */}
                        {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#5B755D]/15 space-y-2 max-w-full min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B755D] block">
                              Recommended Organiva Systems:
                            </span>
                            {msg.recommendedProducts.map((p: any) => (
                              <div
                                key={p._id || p.slug}
                                className="bg-[#FAF8F5] p-2 rounded-xl border border-[#5B755D]/20 flex items-center justify-between gap-2 max-w-full min-w-0"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-[#5B755D]/15 relative">
                                    <Image
                                      src={p.images?.[0] || '/images/products/spintidy-main.webp'}
                                      alt={p.title}
                                      fill
                                      sizes="36px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-[11px] font-bold text-[#171A18] truncate block">
                                      {p.title}
                                    </h5>
                                    <p className="text-[11px] font-extrabold text-[#5B755D]">
                                      PKR {p.salePrice || p.price}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Link
                                    href={`/products/${p.slug}`}
                                    className="px-2 py-1 text-[11px] text-[#5B755D] hover:bg-[#5B755D]/10 rounded font-bold whitespace-nowrap"
                                  >
                                    View
                                  </Link>
                                  <button
                                    onClick={() => addToCart(p, 1)}
                                    className="p-1.5 bg-[#5B755D] hover:bg-[#435845] text-white rounded-md transition-colors"
                                    title="Add to cart"
                                  >
                                    <ShoppingBag size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-[#7F8681] mt-1 px-8">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Loading Status Indicator with Orgi's State */}
                {loading && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-[#5B755D]/20 w-fit animate-fade-in shadow-2xs max-w-full">
                    <OrgiAvatar state={orgiState} size="xs" />
                    <div className="text-xs text-[#5B755D] font-medium break-words [overflow-wrap:anywhere]">
                      {orgiState === 'retrieving' ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B755D] animate-ping" />
                          Scanning Organiva catalog & specs...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B755D] animate-bounce" />
                          Orgi is formulating recommendations...
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Carousel */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-[#F3EFE9] border-t border-[#5B755D]/10 flex gap-1.5 overflow-x-auto scrollbar-none overscroll-contain max-w-full">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="shrink-0 text-[11px] font-medium bg-white hover:bg-[#EBF1EB] text-[#2E332F] hover:text-[#5B755D] px-2.5 py-1 rounded-full border border-[#5B755D]/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-[#5B755D]/15 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2 max-w-full min-w-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Orgi (e.g., 'OrbitSeal price?')..."
                    className="flex-1 min-w-0 bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#171A18] placeholder-[#7F8681] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 sm:p-2.5 bg-[#5B755D] hover:bg-[#435845] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. FLOATING ORGI LOGO TRIGGER BUTTON (Bottom Right Corner of Screen) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Optional Speech Bubble prompt if closed */}
        {!isOpen && hasPromptedBubble && (
          <div className="hidden sm:flex items-center gap-2.5 bg-white py-2 px-3.5 rounded-2xl shadow-xl border border-[#5B755D]/20 animate-fade-in relative text-xs">
            <div className="flex flex-col">
              <span className="font-bold text-[#171A18] flex items-center gap-1">
                <span>Ask Orgi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8EB892] animate-pulse" />
              </span>
              <span className="text-[11px] text-[#525B54]">Need help organizing a space?</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasPromptedBubble(false);
              }}
              className="text-[#7F8681] hover:text-[#171A18] p-0.5 ml-1"
              title="Dismiss"
            >
              <X size={13} />
            </button>
            {/* Speech bubble beak */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-[#5B755D]/20" />
          </div>
        )}

        {/* Floating Button with Orgi's Face */}
        <button
          onClick={handleOpenWidget}
          className="relative w-15 h-15 rounded-full bg-[#FAF8F5] hover:bg-white border-2 border-[#5B755D] shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-108 hover:shadow-2xl cursor-pointer group"
          title="Chat with Orgi - Organiva AI Assistant"
          aria-label="Open Orgi Chatbot"
        >
          {/* Animated Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#5B755D]/20 group-hover:bg-[#5B755D]/30 animate-pulse pointer-events-none" />

          {/* Orgi Face Avatar */}
          <OrgiAvatar state={isOpen ? orgiState : 'idle'} size="sm" />

          {/* Online status indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#8EB892] border-2 border-white shadow-2xs" />
        </button>
      </div>
    </>
  );
};
