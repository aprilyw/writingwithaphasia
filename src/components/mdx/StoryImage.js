import React from 'react';
import Image from 'next/image';

// Low-level image building block used by higher-level MDX components.
// Does NOT wrap in a <figure>; that is handled by Figure to avoid nested figures.
export function StoryImage(props) {
  const { src, alt = '', width = 800, height = 600, className = '', fit = 'cover', position } = props;
  // fit: 'cover' (default legacy) | 'contain' (avoid cropping) | 'natural' (no enforced object-fit)
  const fitClass = fit === 'natural' ? '' : `object-${fit}`; // empty means let intrinsic sizing handle it
  const posClass = position ? `object-[${position}]` : '';
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-xl shadow-sm mx-auto h-auto w-full max-w-[840px] ${fitClass} ${posClass} ${className}`}
      sizes="(min-width: 1280px) 960px, (min-width: 1024px) 800px, 100vw"
    />
  );
}

export default StoryImage;
