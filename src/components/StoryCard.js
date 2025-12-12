import Link from 'next/link';
import Image from 'next/image';

// StoryCard: displays hero thumbnail (if any), title, date, excerpt (HTML-safe), and optional location/tags
// Props: story { id, title, date, excerpt, hero, heroAlt, location, tags }
export default function StoryCard({ story }) {
  const {
    id,
    title,
    date,
    excerpt,
    hero,
    heroAlt,
    location,
    tags = [],
    displayDate
  } = story;

  // Use pre-formatted date (SSR) for hydration safety.
  const formattedDate = displayDate || null;

  // Some excerpts contain inline HTML (links, italics). We'll dangerouslySetInnerHTML but constrain styling.
  const excerptHtml = excerpt ? { __html: excerpt } : null;

  return (
    <li className="group relative rounded-xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 shadow-sm hover:shadow-md transition overflow-hidden">
      <Link
        href={`/?id=${encodeURIComponent(id)}`}
        scroll={false}
        className="flex w-full items-stretch focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl"
      >
        {hero && (
          <div className="relative w-[140px] sm:w-[160px] md:w-[180px] aspect-[4/3] flex-shrink-0 overflow-hidden bg-neutral-100">
            <Image
              src={hero}
              alt={heroAlt || `${title} hero image`}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 200px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              priority={false}
            />
            <div className="absolute inset-0 ring-inset pointer-events-none group-hover:ring-1 group-hover:ring-black/5" />
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-neutral-800 line-clamp-2">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-neutral-500">
            {formattedDate && date && <time dateTime={date}>{formattedDate}</time>}
            {location && <span className="truncate max-w-[160px]" title={location}>{location}</span>}
            {tags.length > 0 && (
              <span className="inline-flex gap-1 items-center text-[10px] text-neutral-500">
                {tags.slice(0,2).map(t => <span key={t} className="uppercase tracking-wide bg-neutral-100 border border-neutral-200 rounded px-1 py-0.5">{t}</span>)}
                {tags.length > 2 && <span className="text-neutral-400">+{tags.length - 2}</span>}
              </span>
            )}
          </div>
          {excerptHtml && (
            <div
              className="mt-1 prose prose-xs max-w-none text-neutral-600 prose-a:underline prose-a:decoration-dotted prose-a:text-primary hover:prose-a:text-primaryHover prose-p:my-0 line-clamp-3"
              dangerouslySetInnerHTML={excerptHtml}
            />
          )}
          <span className="sr-only">Open story {title}</span>
        </div>
      </Link>
    </li>
  );
}
