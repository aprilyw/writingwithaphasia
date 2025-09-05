// pages/_app.js
import '../styles/global.css';
import Link from 'next/link';
import Head from 'next/head';
import { fonts, getFontFamilyVar } from '../styles/fonts';

export default function App({ Component, pageProps }) {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-title">Living With Aphasia: An Anthology</div>
          <div className="navbar-links">
            <Link href="/" legacyBehavior>
              <a>Home</a>
            </Link>
            <Link href="/about">About</Link>
            <Link href="/resources">Resources</Link>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
      <Head>
        <link
          href={fonts.googleFontsUrl}
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        .navbar {
          width: 100vw;
          background: #f7fafc;
          border-bottom: 1.5px solid #bcbcbc;
          padding: 1.2rem 0 0.7rem 0;
          font-family: ${getFontFamilyVar()};
        }
        .navbar-inner {
          margin: 0 2rem;
          display: flex;
          align-items: bottom;
          justify-content: flex-start;
          width: calc(100% - 4rem);
        }
        .navbar-title {
          font-family: ${getFontFamilyVar()};
          font-size: 2.1rem;
          font-weight: 600;
          color: #3a2c2a;
          letter-spacing: 0.01em;
          margin-left: 0;
          text-decoration: none;
          line-height: 1.2;
        }
        .navbar-links {
          display: flex;
          gap: 2.2rem;
          border-bottom: none;
          padding-bottom: 0;
          margin-left: auto;
          justify-content: flex-start;
          font-family: ${getFontFamilyVar()};
          align-items: bottom;
          height: 100%;
        }
        .navbar-links a, .navbar-links :global(a) {
          color: #3a2c2a;
          text-decoration: none;
          font-family: ${getFontFamilyVar()};
          font-size: 1.08rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.5rem 0.2rem;
          transition: color 0.2s, background-color 0.2s;
          border-radius: 4px;
          display: flex;
          align-items: center;
          height: 100%;
        }
        .navbar-links a:hover, .navbar-links :global(a:hover) {
          color: #217dbb;
          background-color: rgba(33, 125, 187, 0.1);
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