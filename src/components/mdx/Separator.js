import React from 'react';

// Accessible decorative section break of five spaced asterisks.
// Usage: <Separator /> in MDX. '***' in raw MDX still produces a normal hr (simple break).
export function Separator({ decorative = false, className = '' }) {
  return (
    <div
      role="separator"
      aria-label={decorative ? undefined : 'Section break'}
      aria-hidden={decorative}
      className={`my-12 flex w-full items-center justify-center ${className}`}
    >
      <span aria-hidden="true" className="select-none font-light tracking-[0.4em] text-grayMid text-lg">* * * * *</span>
    </div>
  );
}

export default Separator;
