import Head from 'next/head';

export default function About() {
  return (
    <div className="about-container">
      <p>
        This page is under construction.
      </p>
      <style jsx>{`
        .about-container {
          max-width: 700px;
          margin: 3rem auto;
          padding: 2rem;
          background: #f7fafc;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(52,152,219,0.07);
          font-family: 'Source Sans Pro', sans-serif;
        }
        h1 {
          color: #3498db;
          font-size: 2.3rem;
          margin-bottom: 1.5rem;
        }
        p {
          font-size: 1.15rem;
          color: #2c3e50;
          margin-bottom: 1.2rem;
        }
      `}</style>
    </div>
  );
} 