// components/StoryCard.js
import Link from 'next/link';

export default function StoryCard({ story }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <img
        src={story.image}
        alt={story.name}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h2 className="text-xl font-bold mt-4">{story.name}</h2>
      <p className="mt-2 text-gray-600">{story.preview}</p>
      <Link
        href={`/stories/${story.id}`}
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Read Full Story
      </Link>
    </div>
  );
}