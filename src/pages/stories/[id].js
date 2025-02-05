// pages/stories/[id].js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { stories } from '../../data/stories';

export default function StoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const story = stories.find(s => s.id === parseInt(id));

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Map
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img
        src={story.image}
        alt={story.name}
        className="w-full h-64 object-cover rounded-lg"
      />
      <h1 className="text-3xl font-bold mt-6">{story.name}</h1>
      <div className="mt-4 prose">
        <p>{story.story}</p>
      </div>
      <Link
        href="/"
        className="inline-block mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Back to Map
      </Link>
    </div>
  );
}