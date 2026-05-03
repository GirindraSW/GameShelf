"use client"

import { useState } from 'react'

export function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-600 text-sm">
        Tidak ada gambar
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
