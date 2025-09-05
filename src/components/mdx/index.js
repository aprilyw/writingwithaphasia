import ImageGallery from './ImageGallery'
import ImagePair from './ImagePair'
import StoryImage from './StoryImage'

// Custom components for MDX
export const mdxComponents = {
  ImageGallery,
  ImagePair,
  StoryImage,
  // Override default img tag with our StoryImage component
  img: (props) => <StoryImage {...props} />,
  // Add some custom styling for common elements
  h1: (props) => <h1 className="text-4xl font-bold text-gray-900 mb-6" {...props} />,
  h2: (props) => <h2 className="text-3xl font-semibold text-gray-800 mb-4 mt-8" {...props} />,
  h3: (props) => <h3 className="text-2xl font-semibold text-gray-800 mb-3 mt-6" {...props} />,
  p: (props) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
  a: (props) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
  ul: (props) => <ul className="list-disc list-inside mb-4 text-gray-700" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside mb-4 text-gray-700" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-blue-200 pl-4 my-6 italic text-gray-600" {...props} />,
  hr: (props) => <hr className="my-8 border-gray-300" {...props} />,
}

export { ImageGallery, ImagePair, StoryImage }
