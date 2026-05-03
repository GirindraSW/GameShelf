import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { ProductWithCategory } from '@/types'

export function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-800 mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Gamepad2 size={32} />
          </div>
        )}
      </div>
      <div>
        {product.categories && (
          <p className="text-xs text-zinc-500 mb-1">{product.categories.name}</p>
        )}
        <p className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </p>
        <p className="text-sm font-semibold text-white mt-1.5">{formatPrice(product.price)}</p>
        {product.stock === 0 && (
          <p className="text-xs text-red-400 mt-1">Stok habis</p>
        )}
      </div>
    </Link>
  )
}
