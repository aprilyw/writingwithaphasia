// pages/stories/[id].js
import { getAllStoryIds, getStoryData } from '../../utils/markdown';
import Link from 'next/link';
import Head from 'next/head';

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
    <div className="container">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Source+Sans+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <nav className="nav">
        <Link href="/">
          <a>← Back to Map</a>
        </Link>
      </nav>
      
      <article className="story">
        <h1>{storyData.name || storyData.title}</h1>
        
        <div className="content">
          <div dangerouslySetInnerHTML={{ __html: storyData.contentHtml }} />
        </div>

        <div className="images-grid">
          {storyData.images && storyData.images.map((image, index) => (
            <div key={index} className="image-wrapper">
              <img src={image} alt={`Image ${index + 1} from ${storyData.name || storyData.title}`} />
            </div>
          ))}
        </div>
      </article>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .nav {
          margin-bottom: 2rem;
        }
        .nav a {
          color: #3498db;
          text-decoration: none;
          font-size: 1.1rem;
        }
        .nav a:hover {
          text-decoration: underline;
        }
        .story h1 {
          font-family: 'Inter', sans-serif;
          color: #2c3e50;
          font-size: 2.7rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          border-bottom: 2.5px solid #bcbcbc;
          padding-bottom: 0.5rem;
          letter-spacing: 0.01em;
          line-height: 1.15;
          text-align: left;
        }
        .content {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #333;
        }
        .content :global(p) {
          margin: 1.5em 0;
        }
        .content :global(a) {
          color: #217dbb;
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        .content :global(a:hover) {
          color: #3498db;
        }
        .content :global(hr) {
          border: none;
          height: auto;
          margin: 2.5em 0;
          text-align: center;
          background: none;
          position: relative;
        }
        
        .content :global(hr)::before {
          content: "*     *     *     *     *";
          font-size: 1.2em;
          color: #666;
          letter-spacing: 0.1em;
          font-weight: 300;
          display: block;
          text-align: center;
          line-height: 1;
        }
        /* External links are handled by markdown processing */
        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .image-wrapper {
          position: relative;
          padding-top: 75%;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .image-wrapper:hover {
          transform: scale(1.02);
        }
        .image-wrapper img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}