import { useEffect } from 'react';

export default function ImageStyler() {
  useEffect(() => {
    // Function to determine CSS class based on aspect ratio
    function getImageClass(width, height) {
      const aspectRatio = width / height;
      
      // Check for document-style images (close to letter/A4 ratio)
      if (Math.abs(aspectRatio - 0.773) < 0.1) { // 8.5/11 ≈ 0.773
        return 'document';
      }
      
      if (Math.abs(aspectRatio - 1) < 0.1) {
        return 'square';
      } else if (aspectRatio < 1) {
        return 'portrait';
      } else {
        return 'landscape';
      }
    }

    // Function to detect if table contains mixed content types
    function detectMixedContent(table) {
      const images = table.querySelectorAll('img');
      const classes = new Set();
      
      images.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          const imageClass = getImageClass(img.naturalWidth, img.naturalHeight);
          classes.add(imageClass);
        }
      });
      
      return classes.size > 1; // Multiple different content types
    }

    // Function to detect three-column layouts
    function detectThreeColumn(table) {
      const rows = table.querySelectorAll('tr');
      if (rows.length > 0) {
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('td, th');
        return cells.length === 3;
      }
      return false;
    }

    // Function to style images based on their dimensions
    function styleImages() {
      const images = document.querySelectorAll('img[data-auto-style="true"]');
      
      images.forEach(img => {
        // Skip if already processed
        if (img.classList.contains('styled')) {
          return;
        }

        // If image is already loaded
        if (img.complete && img.naturalWidth > 0) {
          const imageClass = getImageClass(img.naturalWidth, img.naturalHeight);
          img.classList.add(imageClass, 'styled');
        } else {
          // Wait for image to load
          img.addEventListener('load', function() {
            const imageClass = getImageClass(this.naturalWidth, this.naturalHeight);
            this.classList.add(imageClass, 'styled');
          });
          
          // Handle error case
          img.addEventListener('error', function() {
            // Fallback to landscape class
            this.classList.add('landscape', 'styled');
          });
        }
      });

      // Style tables based on content
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        // Skip if already processed
        if (table.classList.contains('styled')) {
          return;
        }

        // Check for three-column layout
        if (detectThreeColumn(table)) {
          table.classList.add('three-column', 'styled');
        }
        
        // Check for mixed content
        if (detectMixedContent(table)) {
          table.classList.add('mixed-content', 'styled');
        }
      });

      // Style captions based on content type
      const captions = document.querySelectorAll('em');
      captions.forEach(caption => {
        // Skip if already processed
        if (caption.classList.contains('styled')) {
          return;
        }

        // Check if this caption is in a table with document images
        const table = caption.closest('table');
        if (table) {
          const documentImages = table.querySelectorAll('img.document');
          if (documentImages.length > 0) {
            caption.classList.add('document-caption', 'styled');
          } else {
            caption.classList.add('photo-caption', 'styled');
          }
        }
      });
    }

    // Run styling when component mounts
    styleImages();

    // Also run when images might be dynamically added
    const observer = new MutationObserver(styleImages);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
