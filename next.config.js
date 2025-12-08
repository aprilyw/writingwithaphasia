/** @type {import('next').NextConfig} */
const path = require('path');
const remarkFrontmatterExport = require(path.join(__dirname, 'src/lib/mdx/remark-frontmatter-export.js'));

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  experimental: {},
  turbopack: {},
  webpack: (config, { defaultLoaders }) => {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        defaultLoaders.babel,
        {
          loader: require.resolve('@mdx-js/loader'),
          options: {
            remarkPlugins: [remarkFrontmatterExport],
            rehypePlugins: []
          }
        }
      ]
    });
    return config;
  }
};

module.exports = nextConfig;
