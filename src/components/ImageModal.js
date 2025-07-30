import { useEffect } from 'react';

export default function ImageModal({ image, isOpen, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={image.src} alt={image.alt || 'Enlarged image'} />
        {image.caption && <p className="image-caption">{image.caption}</p>}
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .modal-content img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          display: block;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          transition: background-color 0.2s;
        }
        .close-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }
        .image-caption {
          padding: 15px 20px;
          margin: 0;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 