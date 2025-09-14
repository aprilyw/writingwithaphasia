import React from 'react';
import Image from 'next/image';

export function StoryImage(props) {
  const { src, alt = '', caption, width = 800, height = 600 } = props;
  return (
    <figure className="my-8">
      {/* Using next/image for optimization; layout responsive via Tailwind */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-xl shadow-sm mx-auto h-auto w-full max-w-[900px] object-cover"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-grayMid italic px-4 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default StoryImage;
