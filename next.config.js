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
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/static/**',
      },
    ],
  },
  experimental: {
    mdxRs: false, // Set to false for compatibility
  },
})
