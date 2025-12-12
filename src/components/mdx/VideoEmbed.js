import React from 'react';

function resolveProvider(src) {
  if (!src) return 'other';
  if (/youtube\.com|youtu\.be/.test(src)) return 'youtube';
  if (/vimeo\.com/.test(src)) return 'vimeo';
  if (/facebook\.com/.test(src)) return 'facebook';
  if (/\.mp4($|\?)/.test(src)) return 'mp4';
  return 'other';
}

export default function VideoEmbed({ src, title = 'Video', aspect = '16/9', caption, className = '', maxWidth = '800px', align = 'center', controls = true }) {
  const provider = resolveProvider(src);
  const [w, h] = aspect.split('/').map(Number);
  const padding = h && w ? (h / w) * 100 : (9 / 16) * 100;
  const alignClass = align === 'left' ? 'ml-0 mr-auto' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto';
  
  // Convert YouTube watch URLs to embed format
  let embedSrc = src;
  if (provider === 'youtube') {
    const youtubeIdMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeIdMatch && youtubeIdMatch[1]) {
      embedSrc = `https://www.youtube.com/embed/${youtubeIdMatch[1]}`;
    }
  }
  
  // Convert Facebook URLs to embed format
  if (provider === 'facebook') {
    const encodedUrl = encodeURIComponent(src);
    embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500`;
  }

  if (provider === 'mp4') {
    return (
      <figure className={`my-10 ${alignClass} ${className}`} style={{ maxWidth }}>
        <video className="w-full rounded-lg shadow-md" {...(controls ? { controls: true } : {})} playsInline>
          <source src={src} type="video/mp4" />
        </video>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-neutral-600 italic leading-snug px-2">{caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`my-10 ${alignClass} ${className}`} style={{ maxWidth }}>
      <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: `${padding}%` }}>
        <iframe
          src={embedSrc}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-neutral-600 italic leading-snug px-2">{caption}</figcaption>
      )}
    </figure>
  );
}
