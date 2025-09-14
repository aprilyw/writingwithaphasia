import React from 'react';

export function Separator({ decorative = false }) {
  return (
    <hr
      aria-hidden={decorative}
      className="my-12 border-none relative text-center before:content-['*_*_*_*_*'] before:tracking-[0.35em] before:text-grayMid before:font-light before:inline-block before:text-lg"
    />
  );
}

export default Separator;
