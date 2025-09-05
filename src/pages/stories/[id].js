// pages/stories/[id].js
import { getStoryData, getAllStoryIds } from '../../utils/mdx'
import { MDXRemote } from 'next-mdx-remote'
import { mdxComponents, ImageGallery } from '../../components/mdx'
import Link from 'next/link'
import Head from 'next/head'

export async function getStaticPaths() {
  const paths = getAllStoryIds();
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const storyData = await getStoryData(params.id);
  return {
    props: {
      storyData
    }
  };
}

export default function Story({ storyData }) {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{storyData.name || storyData.title} - Writing with Aphasia</title>
        <meta name="description" content={`Story by ${storyData.name}`} />
        <link
          href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <nav className="bg-blue-50 p-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Map
        </Link>
      </nav>
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {storyData.name || storyData.title}
          </h1>
          {storyData.location && (
            <p className="text-lg text-gray-600 mb-2">📍 {storyData.location}</p>
          )}
          {storyData.date && (
            <p className="text-gray-500">{storyData.date}</p>
          )}
        </header>
        
        <div className="prose prose-lg max-w-none">
          <MDXRemote {...storyData.mdxSource} components={mdxComponents} />
        </div>
        
        {storyData.images && storyData.images.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
            <ImageGallery images={storyData.images} />
          </div>
        )}
      </article>
    </div>
  )
}