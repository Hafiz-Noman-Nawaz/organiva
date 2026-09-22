'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  defaultOpen?: boolean;
  openOnHover?: boolean;
  label?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(color.slice(0, 6), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const Folder: React.FC<FolderProps> = ({
  color = '#5B755D',
  size = 2.4,
  items = [],
  className = '',
  defaultOpen = false,
  openOnHover = true,
  label = 'Organiva Space Folio',
}) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const [open, setOpen] = useState(defaultOpen);
  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile & tablet devices
  useEffect(() => {
    const checkDevice = () => {
      const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const isSmall = typeof window !== 'undefined' && window.innerWidth < 1024;
      setIsMobileOrTablet(isTouch || isSmall);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Phone & Tablet: Open on scroll into view, smoothly close when user scrolls away
  useEffect(() => {
    if (!isMobileOrTablet) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            // Scrolled into view on phone/tablet -> open automatically
            setOpen(true);
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
            // Scrolled away on phone/tablet -> close automatically
            setOpen(false);
            setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
          }
        });
      },
      {
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
        rootMargin: '-5% 0px -5% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobileOrTablet, maxItems]);

  const folderBackColor = darkenColor(color, 0.14);
  const paper1 = '#F0ECE4';
  const paper2 = '#F8F6F1';
  const paper3 = '#FFFFFF';

  const handleMouseEnter = () => {
    if (openOnHover && !isMobileOrTablet) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover && !isMobileOrTablet) {
      setOpen(false);
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handleClick = () => {
    // Allows tap/click toggle on phone, tablet, and desktop
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.12;
    const offsetY = (e.clientY - centerY) * 0.12;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle: React.CSSProperties = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3,
  } as React.CSSProperties;

  const scaleStyle = { transform: `scale(${size})` };

  const getOpenTransform = (index: number) => {
    if (index === 0) return 'translate(-115%, -65%) rotate(-13deg)';
    if (index === 1) return 'translate(15%, -65%) rotate(13deg)';
    if (index === 2) return 'translate(-50%, -96%) rotate(3deg)';
    return '';
  };

  return (
    <div
      ref={containerRef}
      style={scaleStyle}
      className={`origin-center select-none p-6 -m-6 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`group relative transition-all duration-300 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B755D] focus-visible:ring-offset-2 ${
          !open ? 'hover:-translate-y-2.5' : ''
        }`}
        style={{
          ...folderStyle,
          transform: open ? 'translateY(18px)' : undefined,
        }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? 'Close folder' : 'Open folder'}
      >
        {/* Back of Folder */}
        <div
          className="relative w-[130px] h-[95px] rounded-tl-0 rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] shadow-lg"
          style={{ backgroundColor: folderBackColor }}
        >
          {/* Top Folder Tab with embossed label */}
          <span
            className="absolute z-0 bottom-[98%] left-0 w-[45px] h-[14px] rounded-tl-[6px] rounded-tr-[6px] rounded-bl-0 rounded-br-0 flex items-center justify-center shadow-xs"
            style={{ backgroundColor: folderBackColor }}
          >
            <span className="text-[5.5px] font-black uppercase tracking-widest text-[#8EB892] scale-90">
              ORGANIVA
            </span>
          </span>

          {/* Papers / Preview Items Inside Folder */}
          {papers.map((item, i) => {
            let sizeClasses = '';
            if (i === 0) sizeClasses = open ? 'w-[88%] h-[92%]' : 'w-[80%] h-[82%]';
            if (i === 1) sizeClasses = open ? 'w-[90%] h-[92%]' : 'w-[86%] h-[76%]' ;
            if (i === 2) sizeClasses = open ? 'w-[94%] h-[92%]' : 'w-[92%] h-[68%]';

            const transformStyle = open
              ? `${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`
              : undefined;

            return (
              <div
                key={i}
                onClick={(e) => e.stopPropagation()}
                onMouseMove={(e) => handlePaperMouseMove(e, i)}
                onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
                className={`absolute z-20 bottom-[8%] left-1/2 transition-all duration-500 ease-out overflow-hidden shadow-md ${
                  !open
                    ? 'transform -translate-x-1/2 translate-y-[8%] group-hover:translate-y-0'
                    : 'hover:scale-108 hover:shadow-xl hover:z-30'
                } ${sizeClasses}`}
                style={{
                  ...(!open ? {} : { transform: transformStyle }),
                  backgroundColor: i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                  borderRadius: '9px',
                }}
              >
                {item}
              </div>
            );
          })}

          {/* Front Left Skew Flap */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-400 ease-out shadow-inner ${
              !open ? 'group-hover:[transform:skew(14deg)_scaleY(0.62)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '6px 12px 12px 12px',
              ...(open && { transform: 'skew(14deg) scaleY(0.62)' }),
            }}
          >
            {/* Subtle stitch / foil accent */}
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between pointer-events-none opacity-80">
              <span className="text-[5.5px] font-bold text-[#E5ECE5] tracking-widest uppercase">
                {label}
              </span>
              <span className="text-[6px] font-black text-[#8EB892]">
                {open
                  ? (isMobileOrTablet ? 'TAP TO CLOSE' : 'HOVERING')
                  : (isMobileOrTablet ? 'TAP / SCROLL' : 'HOVER TO REVEAL')}
              </span>
            </div>
          </div>

          {/* Front Right Skew Flap */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-400 ease-out ${
              !open ? 'group-hover:[transform:skew(-14deg)_scaleY(0.62)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '6px 12px 12px 12px',
              opacity: 0.95,
              ...(open && { transform: 'skew(-14deg) scaleY(0.62)' }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Folder;
