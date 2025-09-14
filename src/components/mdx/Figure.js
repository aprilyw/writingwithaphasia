import React from 'react';
import StoryImage from './StoryImage';

export default function Figure({ src, alt = '', caption, ...rest }) {
  return (
    <figure className="my-6">
      <StoryImage src={src} alt={alt} {...rest} />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 italic text-center">{caption}</figcaption>
      )}
    </figure>
  );
}
