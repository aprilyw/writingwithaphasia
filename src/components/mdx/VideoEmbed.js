import React from 'react';

function resolveProvider(src) {
  if (!src) return 'other';
  if (/youtube\.com|youtu\.be/.test(src)) return 'youtube';
  if (/vimeo\.com/.test(src)) return 'vimeo';
  if (/\.mp4($|\?)/.test(src)) return 'mp4';
  return 'other';
}

export default function VideoEmbed({ src, title = 'Video', aspect = '16/9', caption, className = '', maxWidth = '800px', align = 'center', controls = true }) {
  const provider = resolveProvider(src);
  const [w, h] = aspect.split('/').map(Number);
  const padding = h && w ? (h / w) * 100 : (9 / 16) * 100;
  const alignClass = align === 'left' ? 'ml-0 mr-auto' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto';

  if (provider === 'mp4') {
    return (
      <figure className={`my-10 ${alignClass} ${className}`} style={{ maxWidth }}>
        <video className="w-full rounded-lg shadow-md" {...(controls ? { controls: true } : {})} playsInline>
          <source src={src} type="video/mp4" />
        </video>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-grayMid italic leading-snug px-2">{caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`my-10 relative w-full overflow-hidden rounded-lg shadow-md ${alignClass} ${className}`} style={{ paddingTop: `${padding}%`, maxWidth }}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-grayMid italic leading-snug px-2">{caption}</figcaption>
      )}
    </figure>
  );
}
