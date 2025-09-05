import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const storiesDirectory = path.join(process.cwd(), 'static/md')
const mdxStoriesDirectory = path.join(process.cwd(), 'static/mdx')

export async function getStoryData(id) {
  // First check for MDX file, then fallback to MD file
  let fullPath = path.join(mdxStoriesDirectory, `${id}.mdx`)
  let fileContents
  
  if (fs.existsSync(fullPath)) {
    fileContents = fs.readFileSync(fullPath, 'utf8')
  } else {
    fullPath = path.join(storiesDirectory, `${id}.md`)
    fileContents = fs.readFileSync(fullPath, 'utf8')
  }
  
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
  let allFiles = []
  
  // Get MDX files from mdx directory
  if (fs.existsSync(mdxStoriesDirectory)) {
    const mdxFiles = fs.readdirSync(mdxStoriesDirectory)
      .filter(name => name.endsWith('.mdx'))
      .map(fileName => fileName.replace(/\.mdx$/, ''))
    allFiles = allFiles.concat(mdxFiles)
  }
  
  // Get MD files from md directory (but only if no MDX version exists)
  const mdFiles = fs.readdirSync(storiesDirectory)
    .filter(name => name.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
    .filter(id => !allFiles.includes(id)) // Exclude if MDX version exists
  
  allFiles = allFiles.concat(mdFiles)
  
  return allFiles.map(id => ({
    params: { id }
  }))
}

export async function getAllStoriesData() {
  let allFiles = []
  
  // Get MDX files from mdx directory
  if (fs.existsSync(mdxStoriesDirectory)) {
    const mdxFiles = fs.readdirSync(mdxStoriesDirectory)
      .filter(name => name.endsWith('.mdx'))
      .map(fileName => fileName.replace(/\.mdx$/, ''))
    allFiles = allFiles.concat(mdxFiles)
  }
  
  // Get MD files from md directory (but only if no MDX version exists)
  const mdFiles = fs.readdirSync(storiesDirectory)
    .filter(name => name.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
    .filter(id => !allFiles.includes(id)) // Exclude if MDX version exists
  
  allFiles = allFiles.concat(mdFiles)
  
  const allStoriesData = await Promise.all(
    allFiles.map(async id => {
      return await getStoryData(id)
    })
  )
  
  return allStoriesData.sort((a, b) => {
    if (a.date < b.date) return 1
    return -1
  })
}

export async function getTrishTipsData() {
  const fullPath = path.join(process.cwd(), 'static/articles', 'trish-tips.md')
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
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
  
  return {
    ...data,
    mdxSource,
  }
}
