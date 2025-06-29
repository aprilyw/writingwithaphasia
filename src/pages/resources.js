import Head from 'next/head';

export default function Resources() {
  return (
    <div className="resources-container">
      <Head>
        <title>Resources | Writing With Aphasia</title>
      </Head>
      <h1>Resources</h1>
      <p>
        Here are some helpful organizations, tools, and communities for people with aphasia and their loved ones:
      </p>
      <ul>
        <li>
          <a href="https://www.aphasia.org/" target="_blank" rel="noopener noreferrer"><strong>National Aphasia Association</strong></a><br />
          Information, support, and resources for people with aphasia and their families.
        </li>
        <li>
          <a href="https://virtualconnections.aphasia.com/" target="_blank" rel="noopener noreferrer"><strong>Virtual Connections</strong></a><br />
          Free online groups and activities for people with aphasia, hosted by Lingraphica and partners.
        </li>
        <li>
          <a href="https://www.aphasiarecoveryconnection.org/" target="_blank" rel="noopener noreferrer"><strong>Aphasia Recovery Connection</strong></a><br />
          Peer support, education, and advocacy for the aphasia community.
        </li>
        <li>
          <a href="https://www.stroke.org/en/about-stroke/effects-of-stroke/physical-impact-of-stroke/aphasia" target="_blank" rel="noopener noreferrer"><strong>American Stroke Association: Aphasia</strong></a><br />
          Medical information and resources about aphasia after stroke.
        </li>
        <li>
          <a href="https://www.lingraphica.com/" target="_blank" rel="noopener noreferrer"><strong>Lingraphica</strong></a><br />
          Communication devices, therapy apps, and support for people with aphasia.
        </li>
      </ul>
      <style jsx>{`
        .resources-container {
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
        ul {
          list-style: disc inside;
          padding-left: 0;
        }
        li {
          margin-bottom: 1.3rem;
          font-size: 1.08rem;
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