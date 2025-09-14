import React from 'react';

function resolveProvider(src) {
  if (!src) return 'other';
  if (/youtube\.com|youtu\.be/.test(src)) return 'youtube';
  if (/vimeo\.com/.test(src)) return 'vimeo';
  if (/\.mp4($|\?)/.test(src)) return 'mp4';
  return 'other';
}

export default function VideoEmbed({ src, title = 'Video', aspect = '16/9', className = '' }) {
  const provider = resolveProvider(src);
  const [w, h] = aspect.split('/').map(Number);
  const padding = h && w ? (h / w) * 100 : (9 / 16) * 100;

  if (provider === 'mp4') {
    return (
      <div className={`my-8 ${className}`}>
        <video className="w-full rounded-lg shadow-md" controls playsInline>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className={`my-8 relative w-full overflow-hidden rounded-lg shadow-md ${className}`} style={{ paddingTop: `${padding}%` }}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
