// pages/_app.js
import '../styles/global.css';
import '../styles/tailwind.css';
import { MDXComponentsProvider } from '../components/mdx/MDXComponents';
import { GalleryProvider } from '../components/mdx/GalleryContext';
import GalleryModal from '../components/mdx/GalleryModal';
import Link from 'next/link';
import Head from 'next/head';
import { fonts } from '../styles/fonts';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isHome = router.pathname === '/';
  return (
    <MDXComponentsProvider>
      <GalleryProvider>
      <>
        {/* Accessible, responsive Tailwind navbar */}
        <nav aria-label="Main" className="w-full border-b border-neutral-300 bg-slate-50/90 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
          <div className="mx-6 md:mx-8 flex flex-col md:flex-row md:items-end md:justify-start gap-2 md:gap-0 py-4">
            <div className="text-[1.35rem] md:text-[2.1rem] font-semibold text-[#3a2c2a] tracking-[0.01em] leading-tight select-none">
              Living With Aphasia: <span className="whitespace-nowrap">An Anthology</span>
            </div>
            <div className="flex gap-6 md:ml-auto uppercase tracking-[0.18em] font-semibold text-[0.8rem] md:text-[1.05rem]">
              <Link href="/" className="px-1 py-1 rounded transition-colors hover:text-sky-700 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2">Home</Link>
              <Link href="/about" className="px-1 py-1 rounded transition-colors hover:text-sky-700 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2">About</Link>
              <Link href="/resources" className="px-1 py-1 rounded transition-colors hover:text-sky-700 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2">Resources</Link>
            </div>
          </div>
        </nav>
        {isHome ? (
          <Component {...pageProps} />
        ) : (
          <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-10 md:py-12 min-h-[calc(100vh-70px)]"> 
            <Component {...pageProps} />
          </main>
        )}
        <Head>
          <link href={fonts.googleFontsUrl} rel="stylesheet" />
        </Head>
        <GalleryModal />
      </>
      </GalleryProvider>
    </MDXComponentsProvider>
  );
}