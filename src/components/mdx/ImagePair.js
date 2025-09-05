import Image from 'next/image'

export default function ImagePair({ leftImage, rightImage, leftCaption, rightCaption }) {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <Image
            src={leftImage}
            alt={leftCaption || "Left image"}
            width={400}
            height={300}
            className="rounded-lg w-full shadow-md"
            style={{ objectFit: 'cover' }}
          />
          {leftCaption && (
            <p className="text-sm text-gray-600 mt-3 italic">{leftCaption}</p>
          )}
        </div>
        <div className="text-center">
          <Image
            src={rightImage}
            alt={rightCaption || "Right image"}
            width={400}
            height={300}
            className="rounded-lg w-full shadow-md"
            style={{ objectFit: 'cover' }}
          />
          {rightCaption && (
            <p className="text-sm text-gray-600 mt-3 italic">{rightCaption}</p>
          )}
        </div>
      </div>
    </div>
  )
}
