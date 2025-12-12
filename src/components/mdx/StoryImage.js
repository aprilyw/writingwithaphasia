import React from 'react';
import Image from 'next/image';

// Low-level image building block used by higher-level MDX components.
// Does NOT wrap in a <figure>; that is handled by Figure to avoid nested figures.
export function StoryImage(props) {
  const {
    src,
    alt = '',
    width = 800,
    height = 600,
    className = '',
    fit = 'cover',
    position,
    layout = 'intrinsic', // future proof if we move to fill/ responsive patterns
  } = props;
  // fit: 'cover' (default legacy) | 'contain' (avoid cropping) | 'natural' (no enforced object-fit)
  const fitClass = fit === 'natural' ? '' : `object-${fit}`;
  // default center object position unless overridden
  const posClass = position ? `object-[${position}]` : (fit !== 'natural' ? 'object-center' : '');

  // Remove hardcoded internal max-width so the parent Figure / grid governs width.
  // Use block + mx-auto to center even if width < container.
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-xl shadow-sm mx-auto block h-auto w-full max-w-full ${fitClass} ${posClass} ${className}`}
      sizes="(min-width: 1280px) 960px, (min-width: 1024px) 800px, 100vw"
      data-centered
      data-fit={fit}
    />
  );
}

export default StoryImage;
