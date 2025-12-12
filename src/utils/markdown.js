// DEPRECATED: Legacy markdown loader (static/md). Retained temporarily for reference.
// This module should not be imported by active pages now that MDX migration is complete.
// In production, we throw if any of its exports are invoked to surface lingering references.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const storiesDirectory = path.join(process.cwd(), 'static/md');
const imagesDirectory = path.join(process.cwd(), 'static/images');

function guard() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Legacy markdown loader invoked after MDX migration. Remove references to src/utils/markdown.js');
  }
}

export async function getStoryData(id) {
  guard();
  const fullPath = path.join(storiesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);

  // Create frontmatter HTML to include in the content
  let frontmatterHtml = '';
  if (data.name || data.title) {
    frontmatterHtml += `<h1>${data.name || data.title}</h1>\n`;
  }
  if (data.location) {
    frontmatterHtml += `<div class="location">${data.location}</div>\n`;
  }
  if (data.date) {
    frontmatterHtml += `<div class="date">${data.date}</div>\n`;
  }

  // Combine frontmatter with content
  const fullContent = frontmatterHtml + content;
  
  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm) // Enables GFM (tables, strikethrough, etc.)
    .use(html, { sanitize: false }) // Allow img tags
    .process(fullContent);
  
  let contentHtml = processedContent.toString();

  // Add target="_blank" and rel="noopener noreferrer" to external links
  contentHtml = contentHtml.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );

  // Add click handlers to images for modal functionality
  contentHtml = contentHtml.replace(
    /<img([^>]+)>/g,
    '<img$1 onclick="window.openImageModal && window.openImageModal(this.src, this.alt)" style="cursor: pointer;">'
  );

  // Convert asterisk page breaks to hr tags for styling
  contentHtml = contentHtml.replace(
    /<p>\*     \*     \*     \*     \*<\/p>/g,
    '<hr>'
  );

  // Get associated images
  const storyImagesDir = path.join(imagesDirectory, id);
  let images = [];
  
  if (fs.existsSync(storyImagesDir)) {
    images = fs.readdirSync(storyImagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        src: `/static/images/${id}/${file}`,
        alt: file.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
        caption: file.replace(/\.[^/.]+$/, "").replace(/-/g, " ") // Create caption from filename
      }));
  }

  // Handle frontmatter images if specified
  if (data.images) {
    const frontmatterImages = Array.isArray(data.images) ? data.images : [data.images];
    images = [
      ...images,
      ...frontmatterImages.map(img => {
        if (typeof img === 'string') {
          return {
            src: img,
            alt: path.basename(img).replace(/\.[^/.]+$/, ""),
            caption: path.basename(img).replace(/\.[^/.]+$/, "").replace(/-/g, " ")
          };
        }
        return img;
      })
    ];
  }

  // Process inline images in markdown content
  const inlineImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const inlineImages = [...contentHtml.matchAll(inlineImageRegex)].map(match => ({
    src: match[2],
    alt: match[1] || path.basename(match[2]).replace(/\.[^/.]+$/, ""),
    caption: match[1] || path.basename(match[2]).replace(/\.[^/.]+$/, "").replace(/-/g, " ")
  }));

  // Combine all unique images
  const allImages = [...images, ...inlineImages].filter((img, index, self) => 
    index === self.findIndex((t) => t.src === img.src)
  );

  // Combine the data with the id, contentHtml, and images
  return {
    id,
    contentHtml,
    images: allImages,
    ...data
  };
}

export function getAllStoryIds() {
  guard();
  const fileNames = fs.readdirSync(storiesDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    };
  });
}

export async function getAllStoriesData() {
  guard();
  const fileNames = fs.readdirSync(storiesDirectory);
  const allStoriesData = await Promise.all(fileNames.map(async fileName => {
    const id = fileName.replace(/\.md$/, '');
    return await getStoryData(id);
  }));

  return allStoriesData;
}

export async function getTrishTipsData() {
  guard();
  const fullPath = path.join(process.cwd(), 'static/articles', 'trish-tips.md');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
  let contentHtml = processedContent.toString();
  
  // Add target="_blank" and rel="noopener noreferrer" to external links
  contentHtml = contentHtml.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
  
  return {
    ...data,
    contentHtml,
  };
} 