import Head from 'next/head';
import { getFontFamilyVar } from '../styles/fonts';
import { useState } from 'react';

export default function Resources() {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'

  const weeklySchedule = {
    Monday: [
      { time: '10:00 AM - 11:00 AM', name: 'Wake Up the Week', hosts: 'Cindy Lam Walker & Leeann LaCarbonara', description: 'We will talk about our weekend & our week!' },
      { time: '1:00 PM - 2:00 PM', name: 'Words in Motion (Songs & Lyrics)', hosts: 'Cindy Lam Walker', description: 'We will listen to the songs. Then, we will read the lyrics.' },
      { time: '2:00 PM - 3:00 PM', name: 'Music Appreciation', hosts: 'Josh D. Smith', description: 'We will read the article about music. Each one will read a paragraph. Then we will listen to the music. Then, we will play Jeopardy!' }
    ],
    Tuesday: [
      { time: '10:00 AM - 11:00 AM', name: "Classic Book - Pilgrims' Progress", hosts: 'Cindy Lam Walker', description: 'We will read the book online & will discuss the story.' },
      { time: '1:00 PM - 2:00 PM', name: 'Book Club (Every OTHER Tuesday)', hosts: 'Brian Bassett, Leeann LaCarbonara & Joelle Sisto', description: 'We will read the book & we will discuss about it.' },
      { time: '1:00 PM - 2:00 PM', name: 'Reading Crew - CNN/People.com (Every OTHER Tuesday)', hosts: 'Cindy Lam Walker & Leeann LaCarbonara', description: 'We will be reading the news. Each one will read a paragraph.' },
      { time: '3:00 PM - 4:00 PM', name: 'Talk of the Town (News)', hosts: 'James Bardunias', description: 'We will be reading the news. Each one will read a sentence.' }
    ],
    Wednesday: [
      { time: '10:00 AM - 11:00 AM', name: 'The Bible 1', hosts: 'Cindy Lam Walker & Joelle Sisto', description: 'We will read Old Testament & New Testament & we will talk about them.' },
      { time: '5:00 PM - 6:00 PM', name: 'Talk of the Town (History Articles)', hosts: 'Joelle Sisto', description: 'We will be reading the history articles. Each one will read a sentence.' }
    ],
    Thursday: [
      { time: '11:00 AM - 12:00 PM', name: 'Storytelling', hosts: 'Cindy Lam Walker & Joelle Sisto', description: 'We will be doing stories about things that happened to us. Serious, funny, happy, angry, sad, crazy stories… 2 to 5 minutes only.' },
      { time: '2:00 PM - 3:00 PM', name: 'The Bible 2', hosts: 'Cindy Lam Walker & Josh D. Smith', description: 'We will read Old Testament & New Testament & we will talk about them.' },
      { time: '3:00 PM - 4:00 PM', name: 'Conversation', hosts: 'Leeann LaCarbonara & Cindy Lam Walker', description: 'We will converse with each other by playing games. We will watch short movies & will discuss about them.' }
    ],
    Friday: [
      { time: '1:00 PM - 2:00 PM', name: 'Talk of the Town (Entertainment News)', hosts: 'Cindy Lam Walker', description: 'We will be reading the entertainment news. Each one will read a sentence.' },
      { time: '3:00 PM - 4:00 PM', name: 'Sing & Dance', hosts: 'Cindy Lam Walker', description: 'We will be listening to the songs. From YouTube, we will find songs with lyrics.' }
    ]
  };

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
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            📅 Weekly Calendar
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Full Details
          </button>
        </div>

        {viewMode === 'timeline' ? (
          <div className="weekly-timeline">
            {Object.entries(weeklySchedule).map(([day, events]) => (
              <div key={day} className="day-column">
                <div className="day-header">{day}</div>
                <div className="events-list">
                  {events.map((event, idx) => (
                    <div key={idx} className="timeline-event">
                      <div className="event-time">{event.time}</div>
                      <div className="event-name">{event.name}</div>
                      <div className="event-hosts">{event.hosts}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="groups-content">
            {Object.entries(weeklySchedule).map(([day, events]) => (
              events.map((event, idx) => (
                <div key={`${day}-${idx}`} className="group-item">
                  <strong>{event.name}</strong> - {day} from {event.time} EST. {event.hosts} {event.hosts.includes('&') ? 'are' : 'is'} the {event.hosts.includes('&') ? 'hosts' : 'host'}.<br />
                  {event.description}
                </div>
              ))
            ))}

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
          </div>
        )}

        <div className="zoom-info-section">
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
        
        .view-toggle { display:flex; gap:0.75rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .toggle-btn { background:#ffffff; color:#496586; border:2px solid #496586; padding:0.65rem 1.25rem; border-radius:8px; font-size:0.98rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; font-family:${getFontFamilyVar()}; }
        .toggle-btn:hover { background:#f0f4f8; transform:translateY(-1px); }
        .toggle-btn.active { background:#496586; color:#ffffff; box-shadow:0 4px 12px rgba(73,101,134,0.2); }
        
        .weekly-timeline { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1.5rem; }
        .day-column { background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .day-header { background:linear-gradient(135deg, #496586 0%, #5a7a9e 100%); color:#ffffff; padding:1rem; font-weight:700; font-size:1.1rem; text-align:center; }
        .events-list { padding:0.75rem; }
        .timeline-event { background:#f8f9fa; padding:0.85rem; margin-bottom:0.75rem; border-radius:8px; border-left:3px solid #496586; transition:all 0.2s ease; }
        .timeline-event:hover { background:#eef2f6; transform:translateX(3px); box-shadow:0 2px 8px rgba(0,0,0,0.08); }
        .timeline-event:last-child { margin-bottom:0; }
        .event-time { color:#6b6358; font-size:0.88rem; font-weight:600; margin-bottom:0.4rem; }
        .event-name { color:#2f2b24; font-weight:700; font-size:0.95rem; margin-bottom:0.3rem; line-height:1.3; }
        .event-hosts { color:#5a5248; font-size:0.85rem; line-height:1.4; }
        
        .groups-content { animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        
        .group-item { background:#ffffff; padding:1.25rem; margin-bottom:1rem; border-radius:10px; border-left:4px solid #496586; box-shadow:0 2px 8px rgba(0,0,0,0.04); line-height:1.6; }
        .group-item strong { color:#2f2b24; font-weight:700; }
        
        .mission-statement { background:#fefaf5; padding:1.5rem; border-radius:10px; margin:1.5rem 0; border:1px solid rgba(180,140,90,0.15); }
        .mission-statement p { font-size:1.02rem; line-height:1.7; color:#463f35; margin-bottom:1rem; }
        .mission-statement p:last-of-type { margin-bottom:0; }
        .signature { font-style:italic; color:#5a5248; margin-top:1.2rem; }
        
        .zoom-info-section { background:#e8f4f8; padding:1.25rem; border-radius:10px; margin:1.5rem 0; border:1px solid rgba(73,101,134,0.2); }
        .zoom-info-section strong { color:#2f2b24; }
        .zoom-info-section a { word-break:break-all; }
        
        .sponsor-note { font-size:0.95rem; color:#6b6358; text-align:center; margin-top:1rem; margin-bottom:0; }
        
        @media (max-width:640px){ 
          .resources-container { padding:2.5rem 1.25rem 3rem; border-radius:22px; } 
          h1{ margin-bottom:1.6rem; }
          .aphasia-forward-section { padding:1.5rem; }
          .group-item { padding:1rem; }
          .weekly-timeline { grid-template-columns:1fr; }
          .toggle-btn { flex:1; min-width:140px; }
        }
      `}</style>
    </div>
  );
}