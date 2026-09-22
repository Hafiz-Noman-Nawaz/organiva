'use client';

import React, { useState, useEffect } from 'react';

export type OrgiState = 'idle' | 'thinking' | 'retrieving' | 'telling' | 'happy';

export interface OrgiAvatarProps {
  state?: OrgiState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatusLabel?: boolean;
}

export const OrgiAvatar = ({
  state = 'idle',
  size = 'md',
  className = '',
  showStatusLabel = false,
}: OrgiAvatarProps) => {
  // Natural blinking effect when idle
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (state !== 'idle') return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 4000);
    return () => clearInterval(interval);
  }, [state]);

  // Dimension mapping
  const sizeStyles = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const labelTexts: Record<OrgiState, string> = {
    idle: 'Orgi Online',
    thinking: 'Orgi is thinking...',
    retrieving: 'Scanning home catalog...',
    telling: 'Orgi is answering...',
    happy: 'Ready to help!',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`relative ${sizeStyles[size]} shrink-0 transition-transform duration-300 ${
          state === 'thinking' ? 'animate-bounce-subtle' : ''
        } ${state === 'telling' ? 'animate-bob' : ''} ${
          state === 'idle' ? 'hover:scale-105' : ''
        }`}
      >
        {/* Glow Ring behind Orgi */}
        <div
          className={`absolute -inset-1 rounded-full blur-xs transition-opacity duration-500 ${
            state === 'retrieving'
              ? 'bg-[#8EB892]/60 animate-pulse'
              : state === 'thinking'
              ? 'bg-[#5B755D]/40 animate-pulse'
              : state === 'telling'
              ? 'bg-[#8EB892]/40'
              : 'bg-transparent'
          }`}
        />

        {/* SVG Face Container */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Metallic Gradient for Casing */}
            <linearGradient id="orgiCasing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF8F5" />
              <stop offset="100%" stopColor="#E6E0D6" />
            </linearGradient>

            {/* Deep OLED Visor Screen */}
            <linearGradient id="orgiVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#121D14" />
              <stop offset="100%" stopColor="#1E2F21" />
            </linearGradient>

            {/* Glowing Mint LED Glow */}
            <linearGradient id="orgiLed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7D4AB" />
              <stop offset="100%" stopColor="#8EB892" />
            </linearGradient>

            {/* Leaf Sprout Antenna Gradient */}
            <linearGradient id="orgiLeaf" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#435845" />
              <stop offset="100%" stopColor="#8EB892" />
            </linearGradient>

            {/* Scanner Beam Filter */}
            <linearGradient id="scanBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#8EB892" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* 1. TOP SPROUT ANTENNA (Organiva's Nature-Inspired Identity) */}
          <g className={`transition-transform duration-500 origin-bottom ${state === 'retrieving' ? 'animate-sway' : ''}`}>
            {/* Little stem */}
            <path
              d="M50 20 Q50 12 48 8"
              stroke="#5B755D"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Organiva Sprout Leaf 1 */}
            <path
              d="M48 8 C44 4, 38 7, 42 12 C46 17, 50 13, 48 8 Z"
              fill="url(#orgiLeaf)"
            />
            {/* Organiva Sprout Leaf 2 (Smaller bud) */}
            <path
              d="M49 11 C54 7, 60 10, 56 15 C52 18, 49 15, 49 11 Z"
              fill="#A7D4AB"
            />
            {/* Glowing Node Tip */}
            <circle cx="48" cy="8" r="2" fill="#FAF8F5" className={state === 'thinking' ? 'animate-ping' : ''} />
          </g>

          {/* 2. OUTER PEBBLE ROBOTIC CASING */}
          <rect
            x="12"
            y="20"
            width="76"
            height="70"
            rx="30"
            fill="url(#orgiCasing)"
            stroke="#5B755D"
            strokeWidth="3.5"
          />

          {/* Side ear sensors */}
          <rect x="7" y="44" width="7" height="22" rx="3.5" fill="#5B755D" />
          <rect x="86" y="44" width="7" height="22" rx="3.5" fill="#5B755D" />

          {/* 3. OLED VISOR SCREEN */}
          <rect
            x="20"
            y="28"
            width="60"
            height="54"
            rx="22"
            fill="url(#orgiVisor)"
            stroke="#304332"
            strokeWidth="2"
          />

          {/* Visor Glare Reflection */}
          <path
            d="M26 34 Q50 30 74 34"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.18"
            strokeLinecap="round"
          />

          {/* 4. DYNAMIC EXPRESSION & EYES */}

          {/* RETRIEVING / SCANNING STATE */}
          {state === 'retrieving' && (
            <g>
              {/* Laser scanning bar sweeping */}
              <line
                x1="22"
                y1="40"
                x2="78"
                y2="40"
                stroke="url(#scanBeam)"
                strokeWidth="4"
                className="animate-scanner"
              />
              {/* Concentric Search Radar Rings */}
              <circle cx="50" cy="52" r="14" stroke="#8EB892" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin-slow origin-center" />
              {/* Focused Eye Pupils */}
              <circle cx="39" cy="52" r="4.5" fill="#8EB892" />
              <circle cx="61" cy="52" r="4.5" fill="#8EB892" />
              {/* Data ticks */}
              <rect x="36" y="66" width="28" height="2.5" rx="1.25" fill="#8EB892" opacity="0.7" />
            </g>
          )}

          {/* THINKING STATE */}
          {state === 'thinking' && (
            <g>
              {/* Concentrated Arched Eyes */}
              <path
                d="M34 52 Q39 46 44 50"
                stroke="url(#orgiLed)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M56 50 Q61 46 66 52"
                stroke="url(#orgiLed)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Thought dots bouncing in mouth area */}
              <circle cx="42" cy="65" r="2.5" fill="#8EB892" className="animate-pulse" />
              <circle cx="50" cy="65" r="2.5" fill="#8EB892" className="animate-pulse delay-100" />
              <circle cx="58" cy="65" r="2.5" fill="#8EB892" className="animate-pulse delay-200" />
            </g>
          )}

          {/* TELLING / SPEAKING STATE */}
          {state === 'telling' && (
            <g>
              {/* Happy Arched Sparkle Eyes `( ^ ^ )` */}
              <path
                d="M32 53 Q39 43 46 53"
                stroke="url(#orgiLed)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M54 53 Q61 43 68 53"
                stroke="url(#orgiLed)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Cute LED Blush on cheeks */}
              <circle cx="31" cy="59" r="3" fill="#F4A7A7" opacity="0.8" />
              <circle cx="69" cy="59" r="3" fill="#F4A7A7" opacity="0.8" />
              {/* Animated Speaking Waveform Mouth */}
              <g className="animate-voice-bars">
                <rect x="42" y="62" width="3" height="8" rx="1.5" fill="#8EB892" />
                <rect x="48" y="60" width="3" height="12" rx="1.5" fill="#A7D4AB" />
                <rect x="54" y="62" width="3" height="8" rx="1.5" fill="#8EB892" />
              </g>
            </g>
          )}

          {/* HAPPY / SUCCESS STATE */}
          {state === 'happy' && (
            <g>
              {/* Wink left eye */}
              <path
                d="M33 54 Q39 49 45 54"
                stroke="url(#orgiLed)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Big star/sparkle eye on right */}
              <circle cx="61" cy="50" r="6" fill="url(#orgiLed)" />
              <circle cx="63" cy="48" r="2" fill="white" />
              {/* Big cheerful smile */}
              <path
                d="M40 63 Q50 72 60 63"
                stroke="url(#orgiLed)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cute LED Blush */}
              <circle cx="31" cy="58" r="3" fill="#F4A7A7" opacity="0.8" />
              <circle cx="69" cy="58" r="3" fill="#F4A7A7" opacity="0.8" />
            </g>
          )}

          {/* IDLE STATE (Default Natural Blinking) */}
          {state === 'idle' && (
            <g>
              {isBlinking ? (
                // Closed eyes during blink
                <>
                  <path
                    d="M34 52 Q39 55 44 52"
                    stroke="url(#orgiLed)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M56 52 Q61 55 66 52"
                    stroke="url(#orgiLed)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                // Friendly Open Digital Eyes
                <>
                  <circle cx="39" cy="50" r="5.5" fill="url(#orgiLed)" />
                  <circle cx="41.5" cy="48" r="2" fill="white" />
                  <circle cx="61" cy="50" r="5.5" fill="url(#orgiLed)" />
                  <circle cx="63.5" cy="48" r="2" fill="white" />
                </>
              )}
              {/* Calm Friendly Curved Smile */}
              <path
                d="M43 64 Q50 69 57 64"
                stroke="url(#orgiLed)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
        </svg>

        {/* Small Active Status Dot */}
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#8EB892] border-2 border-white shadow-xs" />
      </div>

      {showStatusLabel && (
        <div className="flex flex-col text-left leading-none">
          <span className="text-xs font-bold text-[#171A18]">Orgi</span>
          <span className="text-[10px] text-[#5B755D] mt-0.5">{labelTexts[state]}</span>
        </div>
      )}
    </div>
  );
};
