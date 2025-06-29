import Head from 'next/head';

export default function About() {
  return (
    <div className="about-container">
      <Head>
        <title>About | Writing With Aphasia</title>
      </Head>
      <h1>About Writing With Aphasia</h1>
      <p>
        <strong>Writing With Aphasia</strong> is a community storytelling project that shares the journeys, challenges, and triumphs of people living with aphasia. Our goal is to foster understanding, connection, and hope through personal stories and resources.
      </p>
      <p>
        This project is built by and for people with aphasia, their families, and supporters. We believe in the power of words, images, and community to inspire recovery and resilience.
      </p>
      <p>
        If you would like to contribute your story or get involved, please contact us!
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