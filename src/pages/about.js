import Head from 'next/head';
import { getFontFamilyVar } from '../styles/fonts';

export default function About() {
  return (
    <div className="about-container">
      <h1>About Living With Aphasia</h1>
      
      <section className="intro">
        <p>
          Hello! I'm Elizabeth, and I founded Living With Aphasia in May 2024. My goal was to create space for those with aphasia to share their stories in their own words. To do so, I help those living with aphasia to weave their story together through the following process:
        </p>
      </section>

      <section className="process">
        <h2>The Process</h2>
        <ol>
          <li>
            <strong>1st session: Intake</strong> – where we get to know one another, and where I'll share more about the project details. If you're interested in participating, we will set up a recording session!
          </li>
          <li>
            <strong>2nd session: Recording via Zoom</strong> – Think of this as a conversation. I will ask questions to guide you :) After our recording session, I will “stitch” together the transcript from our Zoom recording into a story.
          </li>
          <li>
            <strong>3rd session: Editing</strong> – We will go through the story I've stitched together from your words. Then, you tell me what you like and don't like! I will offer some suggestions as well which you can take or reject.
          </li>
          <li>
            <strong>4th session and beyond: More editing and recording</strong> as you see fit, until you are happy with the final version of your story.
          </li>
        </ol>
      </section>

      <section className="faq">
        <h2>Common Questions</h2>
        
        <div className="faq-item">
          <h3>Q: How often do you meet with participants, and for how long?</h3>
          <p>A: Generally, I meet with participants once a week or once every two weeks. Each session is 1 hour long, and I've met with participants anywhere from one month to nine months. I'm flexible to the needs of each participant!</p>
        </div>

        <div className="faq-item">
          <h3>Q: Are there any eligibility criteria?</h3>
          <p>A: No! Anyone with aphasia can participate.</p>
        </div>

        <div className="faq-item">
          <h3>Q: Is sharing my story on this website mandatory to participate in Living with Aphasia?</h3>
          <p>A: Nope! While for many, sharing their story can feel empowering, I understand and respect that not everyone wants to. If you do not consent to having your story publicly shared, your story stays between me and you.</p>
        </div>
      </section>

      <section className="team">
        <h2>About the Team</h2>
        <ul>
          <li><strong>Elizabeth Lin</strong> (Founder)</li>
          <li><strong>April Wang</strong> (Website Developer)</li>
        </ul>
        <p>Interested in joining the team? Reach out to Elizabeth Lin at <a href="mailto:ejlin2003@gmail.com">ejlin2003@gmail.com</a>.</p>
      </section>

      <section className="contact">
        <p>Feel free to reach out if you have any other questions!</p>
      </section>

      <style jsx>{`
        .about-container {
          max-width: 880px;
          margin: 0 auto;
          padding: 3rem 2.25rem 4rem;
          background: #ffffff; /* removed blue background */
          border-radius: 28px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 28px -4px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.04);
          font-family: ${getFontFamilyVar()};
        }
        h1 {
          color: #2f2b24;
          font-size: clamp(2.2rem, 4vw, 2.9rem);
          margin: 0 0 2rem;
          text-align: center;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        h2 {
          color: #2f2b24;
            font-size: clamp(1.5rem, 2.2vw, 1.9rem);
          margin: 2.5rem 0 1rem;
          font-weight: 600;
        }
        h3 {
          color: #2f2b24;
          font-size: 1.1rem;
          margin: 1.1rem 0 0.35rem;
          font-weight: 600;
          letter-spacing: 0.25px;
        }
        section { margin-bottom: 2.2rem; }
        p, ol, ul { font-size: 1.04rem; line-height: 1.65; color: #463f35; }
        p { margin: 0 0 0.9rem; }
        ol, ul { padding-left: 1.35rem; }
        ol li, ul li { margin-bottom: 0.6rem; }
        .faq-item {
          margin-bottom: 1.4rem;
          padding: 1.05rem 1.15rem 1rem;
          background: linear-gradient(180deg,#ffffff,#fafafa);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 14px;
        }
        .faq-item h3 { margin-top: 0; }
        .faq-item p { margin: 0; }
        a { color: #496586; text-decoration: underline; text-underline-offset: 3px; }
        a:hover { color: #38506b; }
        strong { color: #2f2b24; font-weight: 600; }
        @media (max-width: 640px) {
          .about-container { padding: 2.5rem 1.25rem 3rem; border-radius: 22px; }
          h1 { margin-bottom: 1.6rem; }
        }
      `}</style>
    </div>
  );
}