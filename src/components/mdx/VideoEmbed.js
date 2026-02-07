import React, { useRef, useLayoutEffect } from 'react';

function MP4Video({ src, className, controls, caption }) {
  const videoRef = useRef(null);
  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.autoplay = false;
    el.removeAttribute('autoplay');
    el.pause();
  }, [src]);

  const handleLoadedData = () => {
    const el = videoRef.current;
    if (el && el.currentTime < 0.5) el.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        className={className}
        {...(controls ? { controls: true } : {})}
        playsInline
        preload="metadata"
        onLoadedData={handleLoadedData}
        onCanPlay={handleLoadedData}
      >
        <source src={src} type="video/mp4" />
      </video>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-neutral-600 italic leading-snug px-2">{caption}</figcaption>
      )}
    </>
  );
}

function resolveProvider(src) {
  if (!src) return 'other';
  if (/youtube\.com|youtu\.be/.test(src)) return 'youtube';
  if (/vimeo\.com/.test(src)) return 'vimeo';
  if (/soundcloud\.com/.test(src)) return 'soundcloud';
  if (/facebook\.com/.test(src)) return 'facebook';
  if (/\.mp4($|\?)/.test(src)) return 'mp4';
  return 'other';
}

export default function VideoEmbed({ src, title = 'Video', aspect = '16/9', caption, className = '', maxWidth = '800px', align = 'center', controls = true, natural = false }) {
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
  if (provider === 'vimeo') {
    const vimeoIdMatch = src.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/);
    if (vimeoIdMatch && vimeoIdMatch[1]) {
      embedSrc = `https://player.vimeo.com/video/${vimeoIdMatch[1]}`;
    }
  }
  if (provider === 'soundcloud') {
    const trackUrl = src.split('?')[0];
    embedSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=ff5500`;
  }

  // Facebook embeds (reels, etc.) often fail in iframes (blocked/CSP). Use a link instead so the page doesn't crash.
  if (provider === 'facebook') {
    return (
      <figure className={`my-10 ${alignClass} ${className}`} style={{ maxWidth }}>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
          <p className="text-neutral-600 mb-3">{caption || title}</p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-[#1877f2] px-4 py-2 text-white font-medium hover:opacity-90"
          >
            Watch on Facebook
          </a>
        </div>
      </figure>
    );
  }

  if (provider === 'soundcloud') {
    const soundcloudPaddingPercent = 20;
    return (
      <figure className={`my-10 ${alignClass} ${className}`} style={{ maxWidth }}>
        <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: `${soundcloudPaddingPercent}%` }}>
          <iframe
            src={embedSrc}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay"
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-neutral-600 italic leading-snug px-2">{caption}</figcaption>
        )}
      </figure>
    );
  }

  if (provider === 'mp4') {
    const videoClass = natural 
      ? 'rounded-lg shadow-md max-w-full h-auto' 
      : 'w-full rounded-lg shadow-md';
    return (
      <figure className={`my-10 ${alignClass} ${className}`} style={natural ? {} : { maxWidth }}>
        <MP4Video
          src={src}
          className={videoClass}
          controls={controls}
          caption={caption}
        />
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
