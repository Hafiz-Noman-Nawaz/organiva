'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full border border-[#5B755D]/20 bg-transparent flex items-center justify-center opacity-60 ${className}`}>
        <Moon size={17} className="text-[#5B755D]" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="organiva-theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-full transition-all duration-300 border cursor-pointer flex items-center justify-center shadow-xs active:scale-95 ${
        isDark
          ? 'bg-[#1D3020] border-[#8ED496]/40 text-[#FCE570] hover:bg-[#253D29] hover:border-[#8ED496]/70 shadow-[0_0_12px_rgba(142,212,150,0.2)]'
          : 'bg-[#FAF8F5] border-[#5B755D]/25 text-[#435845] hover:bg-[#EBF1EB] hover:text-[#171A18]'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={17} className="transition-transform duration-500 hover:rotate-90 animate-spin-once" />
      ) : (
        <Moon size={17} className="transition-transform duration-500 hover:-rotate-12" />
      )}
    </button>
  );
};

