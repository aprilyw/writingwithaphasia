import Image from 'next/image'
import { useState } from 'react'

export default function StoryImage({ src, alt, caption, width = 600, height = 400, className = "" }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <div className={`my-6 text-center ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity mx-auto shadow-md"
          onClick={() => setIsModalOpen(true)}
          style={{ objectFit: 'cover' }}
        />
        {caption && (
          <p className="text-sm text-gray-600 mt-3 italic">{caption}</p>
        )}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
             onClick={() => setIsModalOpen(false)}>
          <div className="max-w-4xl max-h-full p-4 relative">
            <button 
              className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(false)
              }}
            >
              ×
            </button>
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
