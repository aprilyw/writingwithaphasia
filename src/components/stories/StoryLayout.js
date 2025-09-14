import React from 'react';
import StoryImage from '../mdx/StoryImage';

export default function StoryLayout({ frontmatter, children }) {
  const { title, name, location, date, hero, tags } = frontmatter || {};
  return (
    <div className="story-layout mx-auto max-w-3xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-brandInk mb-4">{title || name}</h1>
        <div className="text-sm text-gray-600 flex flex-wrap gap-3 items-center">
          {name && <span className="font-medium text-gray-800">{name}</span>}
          {location && <span aria-label="Location" className="inline-flex items-center gap-1">📍 {location}</span>}
          {date && <time dateTime={date}>{date}</time>}
          {tags && tags.length > 0 && (
            <ul className="flex gap-2 flex-wrap">
              {tags.map((t) => (
                <li key={t} className="bg-surfaceAlt border border-gray-200 text-gray-700 rounded-full px-3 py-0.5 text-xs uppercase tracking-wide">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
        {hero && (
          <div className="mt-8">
            <StoryImage src={hero} alt={name || title} caption={name || title} priority />
          </div>
        )}
      </header>
      <main className="prose prose-neutral max-w-none">
        {children}
      </main>
    </div>
  );
}
