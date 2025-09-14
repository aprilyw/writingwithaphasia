import React from 'react';
import Image from 'next/image';

// Low-level image building block used by higher-level MDX components.
// Does NOT wrap in a <figure>; that is handled by Figure to avoid nested figures.
export function StoryImage(props) {
  const { src, alt = '', width = 800, height = 600, className = '' } = props;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-xl shadow-sm mx-auto h-auto w-full max-w-[900px] object-cover ${className}`}
    />
  );
}

export default StoryImage;
