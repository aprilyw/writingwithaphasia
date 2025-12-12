// pages/stories/[id].js
// This page now only provides a backward-compatible deep link redirect.
// The map + sidebar experience lives on the home page with ?id=<storyId>.
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { fonts } from '../../styles/fonts';

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' }; }
export async function getStaticProps({ params }) { return { props: { id: params.id } }; }

export default function StoryRedirect({ id }) {
  const router = useRouter();
  useEffect(() => {
    // Replace so back button does not return to intermediate page
    router.replace({ pathname: '/', query: { id } });
  }, [id, router]);
  return (
    <div style={{padding:'2rem', fontFamily:'var(--font-family, sans-serif)'}}>
      <Head><link href={fonts.googleFontsUrl} rel="stylesheet" /></Head>
      <p>Loading story…</p>
      <noscript>
        JavaScript required. Go back to <a href="/">map</a>.
      </noscript>
    </div>
  );
}