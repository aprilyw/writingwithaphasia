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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .header {
          position: relative;
          padding-right: 40px;
          margin-bottom: 20px;
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
          margin: 0;
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 600;
          padding-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .location, .date {
          color: #666;
          margin-top: 8px;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
        }
        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
        .story-content {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #333;
          letter-spacing: 0.01em;
        }
        .story-content :global(p) {
          margin: 1em 0;
        }
        .story-content :global(h2) {
          color: #2c3e50;
          font-size: 1.5rem;
          margin: 1.5em 0 1em;
          border-bottom: none;
          padding-bottom: 0;
          font-weight: 600;
        }
        .story-content :global(h3) {
          color: #2c3e50;
          font-size: 1.2rem;
          margin: 1.2em 0 0.8em;
          font-weight: 600;
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
      `}</style>
    </div>
  );
} 