import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import StoryImage from './StoryImage';
import Separator from './Separator';
import Figure from './Figure';
import ImageGrid from './ImageGrid';
import VideoEmbed from './VideoEmbed';

// Heading wrappers for automatic anchor ids (simple slug implementation)
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const H1 = (props) => {
  const id = slugify(props.children);
  return <h1 id={id} className="text-3xl font-semibold text-brandInk mb-6 text-center" {...props} />;
};
const H2 = (props) => {
  const id = slugify(props.children);
  return <h2 id={id} className="text-2xl font-semibold text-brandInk mt-10 mb-4" {...props} />;
};
const H3 = (props) => {
  const id = slugify(props.children);
  return <h3 id={id} className="text-xl font-semibold text-brandInk mt-8 mb-3" {...props} />;
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
  h1: H1,
  h2: H2,
  h3: H3,
  a: Anchor
};

export function MDXComponentsProvider({ children }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}

export default MDXComponentsProvider;
