import Head from 'next/head';
import { getFontFamilyVar } from '../styles/fonts';

export default function Resources() {
  return (
    <div className="resources-container">
      <Head>
        <title>Resources | Living With Aphasia: An Anthology</title>
      </Head>
      <h1>Resources</h1>
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
      <style jsx>{`
        .resources-container { max-width: 880px; margin: 0 auto; padding: 3rem 2.25rem 4rem; background:#ffffff; border-radius: 28px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 4px 28px -4px rgba(0,0,0,0.06),0 2px 8px -2px rgba(0,0,0,0.04); font-family:${getFontFamilyVar()}; }
        h1 { color:#2f2b24; font-size:clamp(2.1rem,3.8vw,2.7rem); margin:0 0 2rem; font-weight:700; letter-spacing:-0.5px; }
        p { font-size:1.04rem; line-height:1.65; color:#463f35; margin:0 0 0.95rem; }
        ul { list-style:disc; padding-left:1.35rem; margin:0 0 1.6rem; }
        li { margin-bottom:0.85rem; font-size:1.02rem; line-height:1.55; }
        a { color:#496586; text-decoration:underline; text-underline-offset:3px; }
        a:hover { color:#38506b; }
        @media (max-width:640px){ .resources-container { padding:2.5rem 1.25rem 3rem; border-radius:22px; } h1{ margin-bottom:1.6rem; } }
      `}</style>
    </div>
  );
}