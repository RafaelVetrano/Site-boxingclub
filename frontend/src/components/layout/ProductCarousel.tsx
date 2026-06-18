import React, { useState, useEffect, useRef } from 'react';
import { ProductGlyph } from '@/components/ui';
import { IconChevronLeft, IconChevronRight } from '@/icons';

interface Props {
  images?: string[];
  glyph?: string;
  fallbackColor?: string;
  autoplay?: boolean;
  interval?: number;
  showControlsAlways?: boolean;
  alt?: string;
}

export function ProductCarousel({
  images = [],
  glyph,
  fallbackColor = '#0d6b3a',
  autoplay = false,
  interval = 4500,
  showControlsAlways = false,
  alt = '',
}: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => { if (idx >= count) setIdx(Math.max(0, count - 1)); }, [count, idx]);

  useEffect(() => {
    if (!autoplay || paused || count <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [autoplay, paused, count, interval]);

  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); e?.preventDefault(); setIdx((i) => (i + 1) % count); };
  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); e?.preventDefault(); setIdx((i) => (i - 1 + count) % count); };
  const go   = (i: number, e?: React.MouseEvent) => { e?.stopPropagation(); e?.preventDefault(); setIdx(i); };

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; setDragX(0); };
  const onTouchMove  = (e: React.TouchEvent) => { if (touchStart.current == null) return; setDragX(e.touches[0].clientX - touchStart.current); };
  const onTouchEnd   = () => {
    if (touchStart.current == null) return;
    if (Math.abs(dragX) > 40) {
      if (dragX < 0) setIdx((i) => (i + 1) % count);
      else setIdx((i) => (i - 1 + count) % count);
    }
    touchStart.current = null; setDragX(0);
  };

  if (count === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <ProductGlyph glyph={glyph || 'box'} color={fallbackColor} className="w-2/3 h-2/3" />
      </div>
    );
  }

  const arrowsHidden = !showControlsAlways && count > 1;

  return (
    <div
      className="absolute inset-0 select-none touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute inset-0 flex"
        style={{
          transform: `translateX(calc(${-idx * 100}% + ${dragX}px))`,
          transition: dragX ? 'none' : 'transform 500ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 relative">
            <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button onClick={prev} aria-label="Imagem anterior"
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink flex items-center justify-center shadow-[0_6px_15px_-5px_rgba(0,0,0,0.3)] transition-all ${arrowsHidden ? 'opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0' : 'opacity-100'}`}>
            <IconChevronLeft size={16} strokeWidth={2.4} />
          </button>
          <button onClick={next} aria-label="Próxima imagem"
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-ink flex items-center justify-center shadow-[0_6px_15px_-5px_rgba(0,0,0,0.3)] transition-all ${arrowsHidden ? 'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0' : 'opacity-100'}`}>
            <IconChevronRight size={16} strokeWidth={2.4} />
          </button>
          <div className="absolute top-3 right-3 bg-ink/70 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {idx + 1} / {count}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => go(i, e)} aria-label={`Ir para imagem ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'} shadow-[0_2px_5px_rgba(0,0,0,0.3)]`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
