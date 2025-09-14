import Head from 'next/head';
import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getFontFamilyVar } from '../styles/fonts';

export async function getStaticProps() {
  // Load MDX source for Trish Tips (frontmatter + raw body) and do minimal HTML segmentation for preview.
  const tipsPath = path.join(process.cwd(), 'src/content/stories', 'trish-tips.mdx');
  let trishTips = null;
  if (fs.existsSync(tipsPath)) {
    const raw = fs.readFileSync(tipsPath, 'utf8');
    const { data, content } = matter(raw);
    // Simple paragraph split for preview (avoid full MDX compile cost here)
    const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    trishTips = { frontmatter: data, paragraphs };
  }
  return { props: { trishTips } };
}

export default function Resources({ trishTips }) {
  const [activeTab, setActiveTab] = useState('websites');
  const [expanded, setExpanded] = useState(false);
  let trishTipsContent = null;
  if (trishTips) {
    const preview = trishTips.paragraphs.slice(0,2);
    const rest = trishTips.paragraphs.slice(2);
    trishTipsContent = (
      <div>
        <div className="trish-tips-preview">
          {preview.map((p,i)=>(<p key={i}>{p}</p>))}
        </div>
        {rest.length > 0 && !expanded && (
          <button className="expand-btn" onClick={() => setExpanded(true)}>Show more ▼</button>
        )}
        {expanded && (
          <>
            <div className="trish-tips-rest">
              {rest.map((p,i)=>(<p key={i}>{p}</p>))}
            </div>
            <button className="expand-btn" onClick={() => setExpanded(false)}>Show less ▲</button>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="resources-container">
      <Head>
        <title>Resources | Living With Aphasia: An Anthology</title>
      </Head>
      <h1>Resources</h1>
      <div className="tabs">
        <button
          className={activeTab === 'websites' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('websites')}
        >
          Websites
        </button>
        <button
          className={activeTab === 'trish' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('trish')}
        >
          Trish's Tips and Tricks
        </button>
      </div>
      {activeTab === 'websites' && (
        <>
          <p>
            Some resources here! Please reach out if you have any other resources you think would be important to highlight!
          </p>
          <ul>
            <li>
              <a href="https://www.aphasiarecoveryconnection.org/" target="_blank" rel="noopener noreferrer"><strong>Aphasia Recovery Connection</strong></a><br />
              Peer support, education, and advocacy for the aphasia community
            </li>
            <li>
              <a href="https://www.beyondstillness.org/" target="_blank" rel="noopener noreferrer"><strong>Beyond Stillness</strong></a><br />
              One of our key collaborators, which showcases stories from stroke survivors
            </li>
            <li>
              <a href="https://www.lingraphica.com/" target="_blank" rel="noopener noreferrer"><strong>Lingraphica</strong></a><br />
              Communication devices, therapy apps, and support for people with aphasia
            </li>
            <li>
              <a href="https://www.aphasia.org/" target="_blank" rel="noopener noreferrer"><strong>National Aphasia Association</strong></a><br />
              Information, support, and resources for people with aphasia and their families
            </li>
            <li>
              <a href="https://www.nationalaphasiasynergy.org/" target="_blank" rel="noopener noreferrer"><strong>National Aphasia Synergy</strong></a><br />
              National Aphasia Synergy is a peer-led group which seeks to raise awareness of aphasia and develop a rich peer network of people with aphasia. Learn more <a href="https://www.youtube.com/watch?v=GThkxrKbQTI" target="_blank" rel="noopener noreferrer">here</a>.
            </li>
            <li>
              <a href="https://virtualconnections.aphasia.com/" target="_blank" rel="noopener noreferrer"><strong>Virtual Connections</strong></a><br />
              Free online groups and activities for people with aphasia, hosted by Lingraphica and partners
            </li>
          </ul>
        </>
      )}
      {activeTab === 'trish' && (
        trishTipsContent || <p>Sorry, Trish's Tips and Tricks could not be loaded at this time.</p>
      )}
      <style jsx>{`
        .resources-container {
          max-width: 700px;
          margin: 3rem auto;
          padding: 2rem;
          background: #f7fafc;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(52,152,219,0.07);
          font-family: ${getFontFamilyVar()};
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
        .tabs {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 2rem;
        }
        .tab {
          background: none;
          border: none;
          font-size: 1.08rem;
          font-weight: 600;
          color: #217dbb;
          padding: 0.5rem 1.2rem;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: border-bottom 0.2s, color 0.2s;
        }
        .tab.active {
          color: #3a2c2a;
          border-bottom: 2px solid #3a2c2a;
        }
        .expand-btn {
          margin-bottom: 1.2rem;
          background: #eaf2fa;
          color: #217dbb;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1.2rem;
          font-size: 1.08rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .expand-btn:hover {
          background: #d4e6f7;
          color: #145a8a;
        }
        .trish-tips-preview {
          margin-bottom: 0.5rem;
        }
        .trish-tips-rest {
          margin-top: 0.5rem;
        }
        .trish-tips-preview :global(a),
        .trish-tips-rest :global(a) {
          color: #217dbb;
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        .trish-tips-preview :global(a:hover),
        .trish-tips-rest :global(a:hover) {
          color: #3498db;
        }
        /* External links are handled by markdown processing */
      `}</style>
    </div>
  );
} 