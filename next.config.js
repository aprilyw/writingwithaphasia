/** @type {import('next').NextConfig} */
// MDX custom config (frontmatter plugin temporarily removed for debugging empty preset error)

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  experimental: {},
  webpack: (config, { defaultLoaders }) => {
    // MDX pipeline: run source through Next's babel, then MDX with remark plugins.
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        defaultLoaders.babel,
        {
          loader: require.resolve('@mdx-js/loader'),
          options: {
            remarkPlugins: [],
            rehypePlugins: []
          }
        }
      ]
    });
    return config;
  }
};

module.exports = nextConfig;
