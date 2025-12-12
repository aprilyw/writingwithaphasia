import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const GalleryContext = createContext(null);

export function GalleryProvider({ children }) {
  const [images, setImages] = useState([]); // { id, src, alt, caption }
  const [currentIndex, setCurrentIndex] = useState(null);

  const register = useCallback((img) => {
    setImages((prev) => {
      // Avoid duplicates (by src + caption)
      if (prev.some((p) => p.src === img.src && p.caption === img.caption)) return prev;
      return [...prev, { id: prev.length, ...img }];
    });
  }, []);

  const open = useCallback((src) => {
    setCurrentIndex((prev) => {
      const idx = images.findIndex((i) => i.src === src);
      return idx >= 0 ? idx : prev;
    });
  }, [images]);

  const close = useCallback(() => setCurrentIndex(null), []);
  const next = useCallback(() => setCurrentIndex((i) => (i == null ? i : (i + 1) % images.length)), [images.length]);
  const prev = useCallback(() => setCurrentIndex((i) => (i == null ? i : (i - 1 + images.length) % images.length)), [images.length]);

  const value = useMemo(() => ({ images, register, open, close, next, prev, currentIndex, setIndex: setCurrentIndex }), [images, register, open, close, next, prev, currentIndex]);
  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  return ctx;
}
