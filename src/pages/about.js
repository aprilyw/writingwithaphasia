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
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: #f7fafc;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(52,152,219,0.07);
          font-family: ${getFontFamilyVar()};
        }
        
        h1 {
          color: #2c3e50;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 700;
        }
        
        h2 {
          color: #3498db;
          font-size: 1.8rem;
          margin: 1.5rem 0 0.8rem 0;
          font-weight: 600;
        }
        
        h3 {
          color: #2c3e50;
          font-size: 1.2rem;
          margin: 1rem 0 0.3rem 0;
          font-weight: 600;
        }
        
        section {
          margin-bottom: 2rem;
        }
        
        p {
          font-size: 1.1rem;
          color: #2c3e50;
          line-height: 1.6;
          margin-bottom: 0.8rem;
        }
        
        ol {
          font-size: 1.1rem;
          color: #2c3e50;
          line-height: 1.6;
          padding-left: 1.5rem;
        }
        
        ol li {
          margin-bottom: 0.8rem;
        }
        
        ul {
          font-size: 1.1rem;
          color: #2c3e50;
          line-height: 1.6;
          padding-left: 1.5rem;
        }
        
        ul li {
          margin-bottom: 0.3rem;
        }
        
        .faq-item {
          margin-bottom: 1.5rem;
          padding: 1.2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .faq-item h3 {
          margin-top: 0;
          color: #3498db;
        }
        
        .faq-item p {
          margin-bottom: 0;
        }
        
        a {
          color: #3498db;
          text-decoration: underline;
        }
        
        a:hover {
          color: #2980b9;
        }
        
        strong {
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
} 