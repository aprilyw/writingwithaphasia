import React from 'react';
import StoryImage from './StoryImage';

export default function Figure({ src, alt = '', caption, className = '', ...rest }) {
  return (
    <figure className={`my-8 ${className}`}>
      <StoryImage src={src} alt={alt} {...rest} />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-grayMid italic px-4 leading-snug">{caption}</figcaption>
      )}
    </figure>
  );
}
