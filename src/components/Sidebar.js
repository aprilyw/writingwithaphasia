import React from 'react';

export default function Sidebar({ selectedStory, onClose }) {
  if (!selectedStory) {
    return (
      <div className="sidebar">
        <p className="select-prompt">Select a location on the map to view its story.</p>
        <style jsx>{`
          .sidebar {
            padding: 20px;
            background: white;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Source Sans Pro', sans-serif;
          }
          .select-prompt {
            color: #666;
            text-align: center;
            font-style: italic;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>{selectedStory.name || selectedStory.title}</h2>
        {selectedStory.location && (
          <div className="location">{selectedStory.location}</div>
        )}
        {selectedStory.date && (
          <div className="date">{selectedStory.date}</div>
        )}
      </div>

      {selectedStory.images && selectedStory.images.length > 0 && (
        <div className="images-container">
          <div className="images-grid">
            {selectedStory.images.map((image, index) => (
              <figure key={index} className="image-figure">
                <div className="image-wrapper">
                  <img src={image.src} alt={image.alt} />
                </div>
                {image.caption && (
                  <figcaption>{image.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="story-content">
          <div dangerouslySetInnerHTML={{ __html: selectedStory.contentHtml }} />
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          padding: 20px;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          font-family: 'Source Sans Pro', sans-serif;
        }
        .header {
          position: relative;
          padding-right: 40px;
          margin-bottom: 20px;
          text-align: center;
        }
        .close-button {
          position: absolute;
          right: -10px;
          top: -10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #3498db;
          color: white;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          padding: 0;
          line-height: 1;
        }
        .close-button:hover {
          background: #2980b9;
        }
        h2 {
          font-family: 'Merriweather', serif;
          margin: 0;
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 700;
          padding-bottom: 10px;
          letter-spacing: 0.01em;
          text-align: center;
        }
        .location, .date {
          color: #666;
          margin-top: 8px;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
          text-align: center;
        }
        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        .story-content {
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 1.08rem;
          line-height: 1.55;
          color: #222;
          letter-spacing: 0.01em;
          max-width: 44rem;
          margin: 0 auto;
          text-align: left;
          word-break: break-word;
        }
        .story-content :global(p) {
          margin: 0.7em 0 0.7em 0;
        }
        .story-content :global(h1) {
          font-family: 'Merriweather', serif;
          color: #2c3e50;
          font-size: 1.6rem;
          margin: 1.8em 0 1em 0;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.3;
          text-align: left;
          border-bottom: none;
          padding-bottom: 0;
        }
        .story-content :global(h2) {
          color: #2c3e50;
          font-size: 1.25rem;
          margin: 1.2em 0 0.7em 0;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .story-content :global(h3) {
          color: #2c3e50;
          font-size: 1.08rem;
          margin: 1em 0 0.5em 0;
          font-weight: 600;
        }
        .story-content :global(ul),
        .story-content :global(ol) {
          margin: 0.5em 0 0.5em 1.5em;
          padding: 0;
        }
        .story-content :global(li) {
          margin-bottom: 0.3em;
        }
        .story-content :global(blockquote) {
          border-left: 3px solid #b3c6e0;
          margin: 1em 0;
          padding: 0.5em 1em;
          color: #555;
          background: #f7fafd;
          font-style: italic;
        }
        .story-content :global(hr) {
          border: none;
          border-top: 1px solid #e1e1e1;
          margin: 2em 0;
        }
        .story-content :global(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          font-size: 0.98em;
          border: none;
        }
        .story-content :global(th),
        .story-content :global(td) {
          border: none;
          padding: 0.2em 0.2em;
          text-align: left;
        }
        .images-container {
          margin: 20px 0 30px;
        }
        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .image-figure {
          margin: 0;
          display: flex;
          flex-direction: column;
          break-inside: avoid;
        }
        .image-wrapper {
          position: relative;
          padding-top: 75%;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s;
          margin-bottom: 0.5rem;
        }
        .image-wrapper:hover {
          transform: scale(1.02);
        }
        .image-wrapper img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        figcaption {
          color: #666;
          font-size: 0.9rem;
          text-align: center;
          line-height: 1.4;
          padding: 0.5rem;
        }
        .story-content :global(img) {
          max-width: 70%;
          max-height: 400px;
          object-fit: contain;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        .story-content :global(img:hover) {
          transform: scale(1.02);
        }
        .story-content :global(em) {
          display: block;
          text-align: center;
          color: #666;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .story-content :global(a) {
          color: #217dbb;
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        .story-content :global(a:hover) {
          color: #3498db;
        }
        /* External links are handled by markdown processing */
      `}</style>
    </div>
  );
} 