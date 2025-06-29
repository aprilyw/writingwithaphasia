import Head from 'next/head';

export default function Contact() {
  return (
    <div className="contact-container">
      <Head>
        <title>Contact | Writing With Aphasia</title>
      </Head>
      <h1>Contact</h1>
      <p>
        We'd love to hear from you! For questions, feedback, or to share your story, please email us at:
      </p>
      <p>
        <a href="mailto:ejlin2003@gmail.com">ejlin2003@gmail.com</a>
      </p>
      <style jsx>{`
        .contact-container {
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
        a {
          color: #217dbb;
          text-decoration: underline;
        }
        a:hover {
          color: #3498db;
        }
      `}</style>
    </div>
  );
} 