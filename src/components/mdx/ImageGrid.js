import React from 'react';
import Figure from './Figure';

export default function ImageGrid({ images = [], columns = 2, children, gap = 'gap-6' }) {
  const colClass = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <div className={`my-8 grid ${gap} ${colClass}`}> 
      {images.length > 0
        ? images.map((img, i) => (
            <Figure key={i} {...img} />
          ))
        : children}
    </div>
  );
}
