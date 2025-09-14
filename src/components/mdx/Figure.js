import React, { useEffect } from 'react';
import StoryImage from './StoryImage';
import { useGallery } from './GalleryContext';

export default function Figure({ src, alt = '', caption, className = '', noOuterSpacing = false, enableGallery = true, fit, position, maxWidth = 'max-w-[880px]', align = 'center', size = 'md', ...rest }) {
  const gallery = useGallery();

  useEffect(() => {
    if (enableGallery && gallery && src) {
      gallery.register({ src, alt, caption });
    }
  }, [enableGallery, gallery, src, alt, caption]);

  const clickable = enableGallery && gallery;
  const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
  const sizeClamp =
    size === 'sm'
      ? 'max-w-[660px]'
      : size === 'lg'
        ? 'max-w-[1080px]'
        : size === 'full'
          ? 'w-full max-w-[1250px]'
          : maxWidth;
  return (
    <figure className={`${noOuterSpacing ? '' : 'my-10'} ${sizeClamp} w-full ${alignClass} ${className} flex flex-col items-center`}>      
      <div className="w-full flex justify-center">
        <button
          type="button"
          onClick={() => clickable && gallery.open(src)}
          className={`group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 rounded-xl overflow-hidden`}
          aria-label={alt || caption || 'View image'}
        >
          <StoryImage src={src} alt={alt} fit={fit} position={position} {...rest} className="group-hover:brightness-[1.05] transition duration-200" />
          {clickable && (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
          )}
        </button>
      </div>
      {!noOuterSpacing && caption && (
        <figcaption className="mt-4 text-center text-sm text-grayMid italic leading-snug px-2 md:px-4 max-w-[92%] mx-auto">{caption}</figcaption>
      )}
    </figure>
  );
}
