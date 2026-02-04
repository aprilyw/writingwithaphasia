import Head from 'next/head';
import { getFontFamilyVar } from '../styles/fonts';
import { useState } from 'react';

export default function Resources() {
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(false);

  return (
    <div className="resources-container">
      <Head>
        <title>Resources | Living With Aphasia: An Anthology</title>
      </Head>
      <h1>Resources</h1>
      <p>
        Some resources here - Please reach out if you have any other resources you think would be important to highlight!
      </p>

      <section className="aphasia-forward-section">
        <h2>Aphasia Forward Groups</h2>
        <p className="intro-text">
          A Zoom group started by Cindy Yee Lam Walker in 2023 for Aphasia friends. There are currently 14 groups.
        </p>
        <button 
          className="dropdown-toggle"
          onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}
          aria-expanded={isGroupsExpanded}
        >
          {isGroupsExpanded ? '▼' : '▶'} Click for more information from Cindy!
        </button>
        
        {isGroupsExpanded && (
          <div className="groups-content">
            <div className="group-item">
              <strong>Wake Up the Week</strong> - Every Monday from 10 am to 11:00 am EST. Cindy Lam Walker &amp; Leeann LaCarbonara are the hosts.<br />
              We will talk about our weekend &amp; our week!
            </div>

            <div className="group-item">
              <strong>Words in Motion (Songs &amp; Lyrics)</strong> - Every Monday from 1:00 pm to 2:00 pm EST. Cindy Lam Walker is the host.<br />
              We will listen to the songs. Then, we will read the lyrics.
            </div>

            <div className="group-item">
              <strong>Music Appreciation</strong> - Every Monday from 2:00 pm to 3:00 pm EST. Josh D. Smith is the host.<br />
              We will read the article about music. Each one will read a paragraph. Then we will listen to the music. Then, we will play Jeopardy!
            </div>

            <div className="group-item">
              <strong>Classic Book - Pilgrims' Progress</strong> - Every Tuesday from 10:00 am to 11:00 am EST. Cindy Lam Walker is the host.<br />
              We will read the book online &amp; will discuss the story.
            </div>

            <div className="group-item">
              <strong>Book Club</strong> - Every OTHER Tuesday from 1:00 pm EST to 2:00 pm EST. Brian Bassett, Leeann LaCarbonara &amp; Joelle Sisto are the hosts.<br />
              We will read the book &amp; we will discuss about it.
            </div>

            <div className="group-item">
              <strong>Reading Crew - CNN/People.com articles</strong> - Every OTHER Tuesday from 1:00 pm to 2:00 pm EST. Cindy Lam Walker &amp; Leeann LaCarbonara are the hosts.<br />
              We will be reading the news. Each one will read a paragraph.
            </div>

            <div className="group-item">
              <strong>Talk of the Town (News)</strong> - Every Tuesday from 3:00 pm to 4:00 pm EST. James Bardunias is the host.<br />
              We will be reading the news. Each one will read a sentence.
            </div>

            <div className="group-item">
              <strong>The Bible 1</strong> - Every Wednesday from 10 am to 11 am EST. Cindy Lam Walker &amp; Joelle Sisto are the hosts.<br />
              We will read Old Testament &amp; New Testament &amp; we will talk about them.
            </div>

            <div className="group-item">
              <strong>Talk of the Town (History Articles)</strong> - Every Wednesday from 5:00 pm to 6:00 pm EST. Joelle Sisto is the host.<br />
              We will be reading the history articles. Each one will read a sentence.
            </div>

            <div className="group-item">
              <strong>Storytelling</strong> - Every Thursday from 11 am EST to Noon. Cindy Lam Walker &amp; Joelle Sisto are the hosts.<br />
              We will be doing stories about things that happened to us. Serious, funny, happy, angry, sad, crazy stories… 2 to 5 minutes only.
            </div>

            <div className="group-item">
              <strong>The Bible 2</strong> - Every Thursday from 2 pm to 3 pm EST. Cindy Lam Walker &amp; Josh D. Smith are the hosts.<br />
              We will read Old Testament &amp; New Testament &amp; we will talk about them.
            </div>

            <div className="group-item">
              <strong>Conversation</strong> - Every Thursday from 3:00 pm to 4:00 pm EST. Leeann LaCarbonara &amp; Cindy Lam Walker are the hosts.<br />
              We will converse with each other by playing games. We will watch short movies &amp; will discuss about them.
            </div>

            <div className="group-item">
              <strong>Talk of the Town (Entertainment News)</strong> - Every Friday at 1 pm EST to 2 pm EST. Cindy Lam Walker is the host.<br />
              We will be reading the entertainment news. Each one will read a sentence.
            </div>

            <div className="group-item">
              <strong>Sing &amp; Dance</strong> - Every Friday from 3:00 pm to 4:00 pm EST. Cindy Lam Walker is the host.<br />
              We will be listening to the songs. From YouTube, we will find songs with lyrics.
            </div>

            <div className="mission-statement">
              <p>
                For these classes, the most important goal is for Aphasia friends to read, to talk &amp; to help with each other.
              </p>
              <p>
                With my stroke, my entire life changed. I knew how difficult it was to read &amp; talk. Now, I can read &amp; talk but I still want to be better!
              </p>
              <p>
                I had gained many Aphasia friends. We are part of our journeys together. That's why Aphasia Forward will be here for all of us to help each other &amp; to grow together!
              </p>
              <p className="signature">— Cindy Lam Walker<br />
                <a href="mailto:cindylamwalker@gmail.com">cindylamwalker@gmail.com</a>
              </p>
            </div>

            <div className="zoom-info">
              <strong>Join Zoom Meeting:</strong><br />
              <a href="https://us06web.zoom.us/j/89436377594?pwd=dU93cGJqdWdyLzB4MXBUaXc1c2MxQT09" target="_blank" rel="noopener noreferrer">
                https://us06web.zoom.us/j/89436377594?pwd=dU93cGJqdWdyLzB4MXBUaXc1c2MxQT09
              </a><br />
              <strong>Meeting ID:</strong> 894 3637 7594<br />
              <strong>Passcode:</strong> 960180
            </div>

            <p className="sponsor-note">
              <em>Aphasia Forward is sponsored by Just A.S.K. Aphasia Stroke Knowledge.</em>
            </p>
          </div>
        )}
      </section>

      <h2>Additional Resources</h2>
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
      <style jsx>{`
        .resources-container { max-width: 880px; margin: 0 auto; padding: 3rem 2.25rem 4rem; background:#ffffff; border-radius: 28px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 4px 28px -4px rgba(0,0,0,0.06),0 2px 8px -2px rgba(0,0,0,0.04); font-family:${getFontFamilyVar()}; }
        h1 { color:#2f2b24; font-size:clamp(2.1rem,3.8vw,2.7rem); margin:0 0 2rem; font-weight:700; letter-spacing:-0.5px; }
        h2 { color:#2f2b24; font-size:clamp(1.5rem,2.5vw,1.85rem); margin:2.5rem 0 1.2rem; font-weight:700; letter-spacing:-0.3px; }
        p { font-size:1.04rem; line-height:1.65; color:#463f35; margin:0 0 0.95rem; }
        ul { list-style:disc; padding-left:1.35rem; margin:0 0 1.6rem; }
        li { margin-bottom:0.85rem; font-size:1.02rem; line-height:1.55; }
        a { color:#496586; text-decoration:underline; text-underline-offset:3px; }
        a:hover { color:#38506b; }
        
        .aphasia-forward-section { background:#f8f9fa; padding:2rem; border-radius:16px; margin-bottom:2.5rem; border:1px solid rgba(0,0,0,0.04); }
        .aphasia-forward-section h2 { margin-top:0; color:#2f2b24; }
        .intro-text { font-size:1.06rem; color:#463f35; margin-bottom:1rem; }
        
        .dropdown-toggle { background:#496586; color:#ffffff; border:none; padding:0.75rem 1.25rem; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:0.5rem; font-family:${getFontFamilyVar()}; }
        .dropdown-toggle:hover { background:#38506b; transform:translateY(-1px); box-shadow:0 4px 12px rgba(73,101,134,0.2); }
        .dropdown-toggle:active { transform:translateY(0); }
        
        .groups-content { margin-top:1.5rem; animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        
        .group-item { background:#ffffff; padding:1.25rem; margin-bottom:1rem; border-radius:10px; border-left:4px solid #496586; box-shadow:0 2px 8px rgba(0,0,0,0.04); line-height:1.6; }
        .group-item strong { color:#2f2b24; font-weight:700; }
        
        .mission-statement { background:#fefaf5; padding:1.5rem; border-radius:10px; margin:1.5rem 0; border:1px solid rgba(180,140,90,0.15); }
        .mission-statement p { font-size:1.02rem; line-height:1.7; color:#463f35; margin-bottom:1rem; }
        .mission-statement p:last-of-type { margin-bottom:0; }
        .signature { font-style:italic; color:#5a5248; margin-top:1.2rem; }
        
        .zoom-info { background:#e8f4f8; padding:1.25rem; border-radius:10px; margin:1.5rem 0; border:1px solid rgba(73,101,134,0.2); }
        .zoom-info strong { color:#2f2b24; }
        .zoom-info a { word-break:break-all; }
        
        .sponsor-note { font-size:0.95rem; color:#6b6358; text-align:center; margin-top:1.5rem; }
        
        @media (max-width:640px){ 
          .resources-container { padding:2.5rem 1.25rem 3rem; border-radius:22px; } 
          h1{ margin-bottom:1.6rem; }
          .aphasia-forward-section { padding:1.5rem; }
          .group-item { padding:1rem; }
          .dropdown-toggle { width:100%; justify-content:center; }
        }
      `}</style>
    </div>
  );
}