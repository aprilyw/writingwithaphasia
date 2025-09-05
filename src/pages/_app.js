// pages/_app.js
import '../styles/global.css';
import Link from 'next/link';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <nav className="bg-blue-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">Living With Aphasia: An Anthology</div>
            <div className="flex space-x-6">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                Home
              </Link>
              <Link href="/about" className="text-blue-600 hover:text-blue-800 font-medium">
                About
              </Link>
              <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium">
                Resources
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  );
}