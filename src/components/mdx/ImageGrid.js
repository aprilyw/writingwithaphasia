import React from 'react';
import Figure from './Figure';

/*
 * ImageGrid
 * ---------
 * Goals of redesign:
 *  - Lighter appearance (previous always-on dark gradient felt heavy)
 *  - Maintain aligned bottoms via a fixed aspect box (configurable via `aspect` prop)
 *  - Provide two caption display variants: "minimal" (default) and legacy "overlay"
 *  - Subtle hover affordance without aggressive cropping or contrast loss
 */
export default function ImageGrid({
  images = [],
  columns = 2,
  children,
  gap = 'gap-10',
  aspect = 'aspect-[4/3]',
  natural = true, // default now uses intrinsic image aspect ratios
  variant = 'below',
  captionClamp = 3,
  imageFit = 'cover',
  alignY = 'bottom', // 'bottom' | 'top' -> controls how images sit inside fixed aspect (when not natural)
  fullBleed = false, // if true stretch to container edges, else match prose width rhythm
  spacing = 'my-12', // vertical margin spacing (e.g., 'my-4', 'my-6', 'my-12')
}) {
  const colClass = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  const nodes = images.length > 0 ? images.map((img, i) => ({ ...img, key: i })) : React.Children.toArray(children);

  const verticalClass = natural 
    ? (alignY === 'bottom' ? 'items-end' : 'items-start')
    : (alignY === 'top' ? 'items-start' : 'items-end');
  const widthClamp = fullBleed ? '' : 'mx-auto max-w-[1100px] px-2 md:px-4';
  return (
    <div className={`${spacing} ${widthClamp} grid ${gap} ${colClass} ${verticalClass}` + (natural ? ' auto-rows-auto' : '')}>
      {nodes.map((node, i) => {
        const isElement = React.isValidElement(node);
        const figureEl = isElement ? node : <Figure {...node} />;
        const caption = figureEl.props.caption;
        const id = figureEl.key || i;

        // BELOW VARIANT (default) --------------------------------------------------
        if (variant === 'below') {
          const imageContainerClass = natural 
            ? (alignY === 'bottom' 
              ? 'relative w-full overflow-hidden rounded-xl bg-white flex flex-col justify-end'
              : 'relative w-full overflow-hidden rounded-xl bg-white')
            : (alignY === 'top'
              ? 'relative w-full overflow-hidden rounded-xl bg-white'
              : 'relative w-full h-full overflow-hidden rounded-xl bg-white flex flex-col justify-end');
          return (
            <div key={id} className={`group flex flex-col ${natural ? '' : aspect}`}>
              <div className={imageContainerClass}>
                {React.cloneElement(figureEl, {
                  className: `${figureEl.props.className || ''} w-full m-0 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-[1.02]`,
                  noOuterSpacing: true,
                  fit: natural ? 'natural' : imageFit,
                  position: (natural && alignY === 'bottom') || (!natural && alignY === 'bottom') ? 'bottom' : figureEl.props.position,
                })}
              </div>
              {caption && (
                <div className="pt-3 px-1">
                  <p className={`m-0 text-center text-[12px] leading-snug text-neutral-600 italic line-clamp-${captionClamp}`}>{caption}</p>
                </div>
              )}
            </div>
          );
        }

        // HOVER VARIANT -----------------------------------------------------------
        if (variant === 'hover') {
          return (
            <div key={id} className={`group relative flex flex-col ${natural ? '' : aspect} overflow-hidden rounded-xl`}>
              <div className="absolute inset-0">
                {React.cloneElement(figureEl, {
                  className: `${figureEl.props.className || ''} w-full m-0 rounded-none shadow-sm transition-transform duration-300 group-hover:scale-[1.03]`,
                  noOuterSpacing: true,
                  fit: natural ? 'natural' : imageFit,
                })}
              </div>
              {caption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <div className="mx-2 mb-2 rounded-md bg-black/60 backdrop-blur-sm px-3 py-2">
                    <p className={`m-0 text-[12px] leading-snug text-white italic line-clamp-${captionClamp}`}>{caption}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // OVERLAY VARIANT (legacy) -----------------------------------------------
        return (
            <div key={id} className={`group relative flex flex-col ${natural ? '' : aspect} overflow-hidden rounded-xl`}>
              <div className="absolute inset-0">
                {React.cloneElement(figureEl, {
                  className: `${figureEl.props.className || ''} w-full m-0 rounded-none shadow-none transition-transform duration-300 group-hover:scale-[1.02]`,
                  noOuterSpacing: true,
                  fit: natural ? 'natural' : imageFit,
                })}
              </div>
              {caption && (
                <div className="pointer-events-none mt-auto relative z-10 p-3 pt-10 bg-gradient-to-t from-black/60 via-black/25 to-transparent flex flex-col justify-end text-white text-[12px] leading-snug">
                  <span className="italic drop-shadow-sm">{caption}</span>
                </div>
              )}
            </div>
        );
      })}
    </div>
  );
}
