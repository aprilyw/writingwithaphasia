import React, { useEffect, useRef, useState } from 'react';
import { useGallery } from './GalleryContext';

export default function GalleryModal() {
  const { images, currentIndex, close, next, prev, setIndex } = useGallery() || {};
  const isOpen = currentIndex != null && images[currentIndex];
  const overlayRef = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);
  const [swiping, setSwiping] = useState(false);
  const deltaX = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, next, prev]);

  useEffect(() => {
    if (!isOpen) return;
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      deltaX.current = 0;
      setSwiping(false);
    };
    const handleTouchMove = (e) => {
      if (startX.current == null) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;
      if (!swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        setSwiping(true);
      }
      if (swiping) {
        deltaX.current = dx;
        const img = overlayRef.current?.querySelector('.gallery-current');
        if (img) {
          img.style.transform = `translateX(${dx}px)`;
        }
        e.preventDefault();
      }
    };
    const handleTouchEnd = () => {
      if (swiping) {
        const threshold = 80;
        if (deltaX.current > threshold) {
          prev();
        } else if (deltaX.current < -threshold) {
          next();
        }
        const img = overlayRef.current?.querySelector('.gallery-current');
        if (img) img.style.transform = '';
      }
      startX.current = null;
      startY.current = null;
      setSwiping(false);
    };
    const node = overlayRef.current;
    node?.addEventListener('touchstart', handleTouchStart, { passive: true });
    node?.addEventListener('touchmove', handleTouchMove, { passive: false });
    node?.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      node?.removeEventListener('touchstart', handleTouchStart);
      node?.removeEventListener('touchmove', handleTouchMove);
      node?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, next, prev, swiping]);

  if (!isOpen) return null;
  const current = images[currentIndex];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
    >
      <div className="absolute top-3 right-4 flex gap-2">
        <button
          onClick={close}
          className="px-3 py-2 rounded-md bg-white/15 text-white text-sm hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Close gallery"
        >✕</button>
      </div>
      <div className="relative max-w-[95vw] max-h-[80vh] flex items-center justify-center">
        <button aria-label="Previous" onClick={prev} className="hidden md:flex absolute left-0 -ml-14 text-white/70 hover:text-white text-4xl select-none font-light">‹</button>
        <figure className="m-0 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.alt || ''} className="gallery-current max-h-[70vh] max-w-[85vw] object-contain rounded-md transition-transform duration-200 will-change-transform" />
          {current.caption && (
            <figcaption className="mt-5 max-w-[70ch] text-center text-sm text-neutral-300 italic leading-snug px-4">
              {current.caption}
            </figcaption>
          )}
        </figure>
        <button aria-label="Next" onClick={next} className="hidden md:flex absolute right-0 -mr-14 text-white/70 hover:text-white text-4xl select-none font-light">›</button>
      </div>
      <div className="mt-6 w-full flex items-center justify-center gap-2 flex-wrap max-w-[900px]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex && setIndex(i)}
            className={`h-12 w-12 overflow-hidden rounded ${i === currentIndex ? 'ring-2 ring-sky-400' : 'ring-1 ring-white/10'} hover:ring-sky-300 transition`}
            aria-label={`Go to image ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
