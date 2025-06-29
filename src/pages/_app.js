// pages/_app.js
import 'ol/ol.css';
import '../styles/global.css';
import Link from 'next/link';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-title">Writing With Aphasia</div>
          <div className="navbar-links">
            <Link href="/" legacyBehavior>
              <a onClick={e => { if (typeof window !== 'undefined' && window.handleHomeClick) { e.preventDefault(); window.handleHomeClick(); } }}>Home</a>
            </Link>
            <Link href="/about">About</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        .navbar {
          width: 100vw;
          background: #f7fafc;
          border-bottom: 1.5px solid #bcbcbc;
          padding: 1.2rem 0 0.7rem 0;
          font-family: 'Source Sans Pro', sans-serif;
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .navbar-title {
          font-family: 'Merriweather', serif;
          font-size: 2.1rem;
          font-weight: 700;
          color: #3a2c2a;
          letter-spacing: 0.01em;
          margin-left: 0;
        }
        .navbar-links {
          display: flex;
          gap: 2.2rem;
          border-bottom: 1px solid #bcbcbc;
          padding-bottom: 0.2rem;
          margin-left: 0;
          justify-content: flex-end;
          font-family: 'Source Sans Pro', sans-serif;
        }
        .navbar-links a, .navbar-links :global(a) {
          color: #3a2c2a;
          text-decoration: none;
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 1.08rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0 0.2rem;
          transition: border-bottom 0.2s, color 0.2s;
          border-bottom: 2px solid transparent;
        }
        .navbar-links a:hover, .navbar-links :global(a:hover) {
          border-bottom: 2px solid #3a2c2a;
          color: #217dbb;
        }
        @media (max-width: 700px) {
          .navbar-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.7rem;
          }
          .navbar-title {
            font-size: 1.2rem;
          }
          .navbar-links {
            gap: 1.1rem;
            font-size: 0.98rem;
            margin-left: 0;
            width: 100%;
            border-bottom: none;
            padding-bottom: 0;
          }
        }
      `}</style>
    </>
  );
}