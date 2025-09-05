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
