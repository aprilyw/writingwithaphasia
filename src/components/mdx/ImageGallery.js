import Image from 'next/image'
import { useState } from 'react'

export default function ImageGallery({ images, alt = "Gallery image" }) {
  const [selectedImage, setSelectedImage] = useState(null)
  
  if (!images || images.length === 0) return null
  
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="cursor-pointer" onClick={() => setSelectedImage(image)}>
            <Image
              src={image.src}
              alt={image.alt || alt}
              width={400}
              height={300}
              className="rounded-lg hover:opacity-80 transition-opacity w-full"
              style={{ objectFit: 'cover' }}
            />
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 italic text-center">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
             onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full p-4 relative">
            <button 
              className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
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
