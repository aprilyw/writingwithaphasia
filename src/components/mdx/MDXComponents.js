import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import StoryImage from './StoryImage';
import Separator from './Separator';
import Figure from './Figure';
import ImageGrid from './ImageGrid';
import VideoEmbed from './VideoEmbed';

// Heading wrappers for automatic anchor ids with resilient text extraction
function extractText(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (typeof node === 'object' && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return '';
}

function slugify(node) {
  const text = extractText(node);
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const H1 = ({ children, ...rest }) => {
  const id = slugify(children);
  return <h1 id={id} className="text-3xl font-semibold text-brandInk mb-6 text-center" {...rest}>{children}</h1>;
};
const H2 = ({ children, ...rest }) => {
  const id = slugify(children);
  return <h2 id={id} className="text-2xl font-semibold text-brandInk mt-10 mb-4" {...rest}>{children}</h2>;
};
const H3 = ({ children, ...rest }) => {
  const id = slugify(children);
  return <h3 id={id} className="text-xl font-semibold text-brandInk mt-8 mb-3" {...rest}>{children}</h3>;
};

const Anchor = (props) => (
  <a
    {...props}
    className="text-primary underline decoration-1 underline-offset-2 hover:text-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    target={props.href?.startsWith('http') ? '_blank' : undefined}
    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
  />
);

export const components = {
  img: (props) => <StoryImage {...props} />,
  StoryImage,
  Separator,
  Figure,
  ImageGrid,
  Video: VideoEmbed,
  VideoEmbed,
  h1: H1,
  h2: H2,
  h3: H3,
  a: Anchor
};

export function MDXComponentsProvider({ children }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}

export default MDXComponentsProvider;
