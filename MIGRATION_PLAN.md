# Writing with Aphasia - Framework Migration Plan

## Current State Analysis
- **Framework**: Next.js with Pages Router
- **Markdown Processing**: remark + remark-html + gray-matter
- **Styling**: Custom CSS with global styles
- **Image Handling**: Manual file system scanning + custom modal logic
- **Content Structure**: Static markdown files in `/static/md/`

## Migration Progress Status

### ✅ COMPLETED STEPS

#### Phase 1.1: Dependencies Installation
- ✅ Installed @next/mdx, @mdx-js/loader, @mdx-js/react
- ✅ Installed next-mdx-remote
- ✅ Installed rehype plugins (highlight, slug, autolink-headings)
- ✅ Installed Tailwind CSS and @tailwindcss/typography
- ✅ Installed PostCSS and autoprefixer
- ✅ Installed @tailwindcss/postcss
- ✅ Installed Playwright for testing

#### Phase 1.2: Configuration Files
- ✅ Created next.config.js with MDX support
- ✅ Created tailwind.config.js with typography plugin
- ✅ Created postcss.config.js with correct PostCSS setup
- ✅ Created playwright.config.js for testing

#### Phase 1.3: MDX Components
- ✅ Created src/components/mdx/ImageGallery.js
- ✅ Created src/components/mdx/ImagePair.js  
- ✅ Created src/components/mdx/StoryImage.js
- ✅ Created src/components/mdx/index.js with component exports

#### Phase 1.4: Updated Utility Functions
- ✅ Created src/utils/mdx.js with new MDX processing
- ✅ Updated functions to use next-mdx-remote/serialize
- ✅ Added image discovery functionality

#### Phase 1.5: Updated Pages
- ✅ Updated src/pages/stories/[id].js to use MDX
- ✅ Partially updated src/pages/resources.js

#### Testing Setup
- ✅ Created tests/basic.spec.js with comprehensive test coverage
- ✅ Added test scripts to package.json

### ⚠️ ISSUES DISCOVERED & NEXT STEPS

#### Critical Issues to Fix:

1. **Runtime Errors in Stories**
   - Style prop errors from old markdown processing
   - Some stories still using old markdown.js utility
   - Need to finish conversion to MDX system

2. **Home Page Issues**
   - Title tag errors (React expects string, getting array)
   - Missing h1 elements causing test failures
   - Need to update index.js to use new system

3. **Styling Issues**
   - Tailwind classes not being applied correctly
   - Need to update global CSS import in _app.js
   - Font loading warnings in Next.js

4. **Image Processing**
   - Old onclick handlers still being generated
   - Style attributes as strings instead of objects
   - Need to complete migration from old system

### 🔧 IMMEDIATE FIX PLAN

#### Step 1: Fix Critical Runtime Errors
```bash
# Update _app.js to properly import Tailwind
# Fix title tag issues in pages
# Remove old markdown.js references
```

#### Step 2: Complete Story Migration
```bash
# Convert one story (ayse.md) to use new MDX components
# Test the conversion works properly
# Update image references to use new components
```

#### Step 3: Fix Home Page
```bash
# Update index.js to work with new system
# Fix title and heading structure
# Ensure map functionality works
```

#### Step 4: Complete Styling Migration
```bash
# Remove old CSS that conflicts
# Ensure Tailwind is properly loaded
# Update all components to use new styles
```

### 📊 Test Results Summary
- **Total Tests**: 55
- **Passed**: 36 
- **Failed**: 19
- **Main Issues**: Runtime errors, missing elements, style conflicts

### 🎯 SUCCESS CRITERIA
- [ ] All stories load without runtime errors
- [ ] Home page displays properly with title and h1
- [ ] Image modals work with new components
- [ ] Navigation between pages functions
- [ ] Responsive design maintained
- [ ] All tests pass
- [ ] Performance improved with optimized images

---

## Phase 2: Content Migration (PENDING)

### 2.1 Convert Existing Markdown Files
- ⏳ Transform markdown tables to MDX components
- ⏳ Update image references to use new components
- ⏳ Test each converted story

### 2.2 Enhanced Styling (PENDING)
- ⏳ Complete Tailwind integration
- ⏳ Remove old CSS conflicts
- ⏳ Optimize typography

## Phase 3: Performance & SEO Enhancements (PENDING)
- ⏳ Image optimization validation
- ⏳ SEO meta tag improvements
- ⏳ Accessibility audit

## Phase 4: Content Management Enhancements (PENDING)
- ⏳ Search functionality
- ⏳ Content categorization
- ⏳ Print-friendly versions

---

## Current Branch: `feature/mdx-migration`
## Next Actions: Fix runtime errors and complete basic functionality

### 1.1 Dependencies to Install
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install @next/image
npm install rehype-highlight rehype-slug rehype-autolink-headings
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npm install next-mdx-remote@latest
```

### 1.2 Configuration Changes

#### `next.config.js` (Create/Update)
```javascript
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      require('rehype-highlight'),
      require('rehype-slug'),
      require('rehype-autolink-headings')
    ],
  },
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    mdxRs: true,
  },
})
```

#### `tailwind.config.js` (Create)
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './static/md/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['TASA Orbiter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#333',
            a: {
              color: '#217dbb',
              '&:hover': {
                color: '#3498db',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

#### `postcss.config.js` (Create)
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 1.3 New Component Structure

#### `src/components/mdx/ImageGallery.js` (Create)
```javascript
import Image from 'next/image'
import { useState } from 'react'

export default function ImageGallery({ images, alt = "Gallery image" }) {
  const [selectedImage, setSelectedImage] = useState(null)
  
  if (!images || images.length === 0) return null
  
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="cursor-pointer" onClick={() => setSelectedImage(image)}>
            <Image
              src={image.src}
              alt={image.alt || alt}
              width={400}
              height={300}
              className="rounded-lg hover:opacity-80 transition-opacity"
              style={{ objectFit: 'cover' }}
            />
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 italic">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
             onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full p-4">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || alt}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

#### `src/components/mdx/ImagePair.js` (Create)
```javascript
import Image from 'next/image'

export default function ImagePair({ leftImage, rightImage, leftCaption, rightCaption }) {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Image
            src={leftImage}
            alt={leftCaption || "Left image"}
            width={400}
            height={300}
            className="rounded-lg w-full"
            style={{ objectFit: 'cover' }}
          />
          {leftCaption && (
            <p className="text-sm text-gray-600 mt-2 italic text-center">{leftCaption}</p>
          )}
        </div>
        <div>
          <Image
            src={rightImage}
            alt={rightCaption || "Right image"}
            width={400}
            height={300}
            className="rounded-lg w-full"
            style={{ objectFit: 'cover' }}
          />
          {rightCaption && (
            <p className="text-sm text-gray-600 mt-2 italic text-center">{rightCaption}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### `src/components/mdx/StoryImage.js` (Create)
```javascript
import Image from 'next/image'
import { useState } from 'react'

export default function StoryImage({ src, alt, caption, width = 600, height = 400 }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <div className="my-6 text-center">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity mx-auto"
          onClick={() => setIsModalOpen(true)}
          style={{ objectFit: 'cover' }}
        />
        {caption && (
          <p className="text-sm text-gray-600 mt-2 italic">{caption}</p>
        )}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
             onClick={() => setIsModalOpen(false)}>
          <div className="max-w-4xl max-h-full p-4">
            <Image
              src={src}
              alt={alt}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            {caption && (
              <p className="text-white text-center mt-4">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

#### `src/components/mdx/index.js` (Create)
```javascript
import ImageGallery from './ImageGallery'
import ImagePair from './ImagePair'
import StoryImage from './StoryImage'

export const mdxComponents = {
  ImageGallery,
  ImagePair,
  StoryImage,
  img: StoryImage, // Replace default img tags
}

export { ImageGallery, ImagePair, StoryImage }
```

### 1.4 Updated Utility Functions

#### `src/utils/mdx.js` (Create - New MDX utilities)
```javascript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const storiesDirectory = path.join(process.cwd(), 'static/md')

export async function getStoryData(id) {
  const fullPath = path.join(storiesDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  
  const { data, content } = matter(fileContents)
  
  // Serialize the MDX content
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [
        rehypeHighlight,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ],
    },
    scope: data,
  })
  
  // Get associated images
  const images = await getStoryImages(id)
  
  return {
    id,
    frontMatter: data,
    mdxSource,
    images,
    ...data
  }
}

export async function getStoryImages(id) {
  const imagesDirectory = path.join(process.cwd(), 'static/img', id)
  let images = []
  
  if (fs.existsSync(imagesDirectory)) {
    images = fs.readdirSync(imagesDirectory)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        src: `/static/img/${id}/${file}`,
        alt: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        caption: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      }))
  }
  
  return images
}

export function getAllStoryIds() {
  const fileNames = fs.readdirSync(storiesDirectory)
  return fileNames
    .filter(name => name.endsWith('.md'))
    .map(fileName => ({
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }))
}

export async function getAllStoriesData() {
  const fileNames = fs.readdirSync(storiesDirectory)
  const allStoriesData = await Promise.all(
    fileNames
      .filter(name => name.endsWith('.md'))
      .map(async fileName => {
        const id = fileName.replace(/\.md$/, '')
        return await getStoryData(id)
      })
  )
  
  return allStoriesData.sort((a, b) => {
    if (a.date < b.date) return 1
    return -1
  })
}
```

### 1.5 Updated Pages

#### `src/pages/stories/[id].js` (Update)
```javascript
import { getStoryData, getAllStoryIds } from '../../utils/mdx'
import { MDXRemote } from 'next-mdx-remote'
import { mdxComponents } from '../../components/mdx'
import Link from 'next/link'
import Head from 'next/head'

export async function getStaticPaths() {
  const paths = getAllStoryIds()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const storyData = await getStoryData(params.id)
  return {
    props: {
      storyData
    }
  }
}

export default function Story({ storyData }) {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{storyData.name || storyData.title} - Writing with Aphasia</title>
        <meta name="description" content={`Story by ${storyData.name}`} />
      </Head>
      
      <nav className="bg-blue-50 p-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Map
        </Link>
      </nav>
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {storyData.name || storyData.title}
          </h1>
          {storyData.location && (
            <p className="text-lg text-gray-600 mb-2">📍 {storyData.location}</p>
          )}
          {storyData.date && (
            <p className="text-gray-500">{storyData.date}</p>
          )}
        </header>
        
        <div className="prose prose-lg max-w-none">
          <MDXRemote {...storyData.mdxSource} components={mdxComponents} />
        </div>
        
        {storyData.images && storyData.images.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
            <ImageGallery images={storyData.images} />
          </div>
        )}
      </article>
    </div>
  )
}
```

## Phase 2: Markdown Content Migration

### 2.1 Convert Existing Markdown Files

Transform current markdown tables to MDX components. For example, in `ayse.md`:

**Before:**
```markdown
|  |  |
|--|--|
| ![](/static/img/ayse/Card1.png)  | ![](/static/img/ayse/Card2.png)  |
```

**After:**
```mdx
<ImagePair 
  leftImage="/static/img/ayse/Card1.png"
  rightImage="/static/img/ayse/Card2.png"
  leftCaption="Aphasia Card 1"
  rightCaption="Aphasia Card 2"
/>
```

**Before:**
```markdown
![](/static/img/ayse/Don.jpg)
*My husband Don.*
```

**After:**
```mdx
<StoryImage 
  src="/static/img/ayse/Don.jpg" 
  alt="Don, Ayse's husband"
  caption="My husband Don."
/>
```

### 2.2 Enhanced Styling

#### Update `src/styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@300;400;500;600;700&display=swap');

:root {
  --font-family-primary: 'TASA Orbiter', sans-serif;
}

@layer base {
  html {
    font-family: var(--font-family-primary);
  }
  
  body {
    @apply bg-white text-gray-900;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  body::-webkit-scrollbar {
    display: none;
  }
}

@layer components {
  .story-content {
    @apply prose prose-lg max-w-none;
  }
  
  .story-content h1 {
    @apply text-4xl font-bold text-gray-900 mb-6;
  }
  
  .story-content h2 {
    @apply text-3xl font-semibold text-gray-800 mb-4 mt-8;
  }
  
  .story-content p {
    @apply text-gray-700 leading-relaxed mb-4;
  }
  
  .story-content a {
    @apply text-blue-600 hover:text-blue-800 underline;
  }
  
  .story-content img {
    @apply rounded-lg shadow-md mx-auto;
  }
  
  .story-content table {
    @apply w-full border-collapse border border-gray-300 my-6;
  }
  
  .story-content th,
  .story-content td {
    @apply border border-gray-300 px-4 py-2;
  }
  
  .story-content th {
    @apply bg-gray-50 font-semibold;
  }
}
```

## Phase 3: Performance & SEO Enhancements

### 3.1 Image Optimization
- Use Next.js Image component with proper sizing
- Add blur placeholders for better UX
- Implement lazy loading
- WebP/AVIF format support

### 3.2 SEO Improvements
- Add proper meta tags for each story
- Implement structured data for stories
- Add Open Graph tags for social sharing
- Create XML sitemap

### 3.3 Accessibility
- Add proper alt text for all images
- Implement keyboard navigation for modals
- Add ARIA labels where needed
- Ensure proper heading hierarchy

## Phase 4: Content Management Enhancements

### 4.1 Story Discovery
- Add search functionality
- Implement tagging system
- Create category filtering
- Add story recommendations

### 4.2 Interactive Features
- Add story sharing capabilities
- Implement comment system (optional)
- Add print-friendly versions
- Create audio narration support

## Migration Steps Summary

1. **Backup current code** (git commit)
2. **Install dependencies** (Phase 1.1)
3. **Add configuration files** (Phase 1.2)
4. **Create MDX components** (Phase 1.3)
5. **Update utility functions** (Phase 1.4)
6. **Update page components** (Phase 1.5)
7. **Test with one story file** (convert ayse.md to ayse.mdx)
8. **Gradually convert other markdown files**
9. **Update styling system** (Phase 2.2)
10. **Add performance optimizations** (Phase 3)

## Rollback Plan
- Keep original `/src/utils/markdown.js` as backup
- Git branch for migration work
- Test thoroughly before deploying
- Have original package.json available for quick restore

## Testing Checklist
- [ ] Stories load correctly
- [ ] Images display with proper optimization
- [ ] Modal functionality works
- [ ] Responsive design maintained
- [ ] Map integration still works
- [ ] Navigation between stories works
- [ ] External links open correctly
- [ ] SEO meta tags present
- [ ] Performance metrics improved

---

This plan provides a comprehensive roadmap for upgrading your Writing with Aphasia platform with better content management, image handling, and styling capabilities while maintaining your current functionality.
