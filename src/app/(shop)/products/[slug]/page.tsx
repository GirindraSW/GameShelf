import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ImageGallery } from '@/components/shop/ImageGallery'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/shop/AddToCartButton'
import { StockRealtimeDisplay } from '@/components/shop/StockRealtimeDisplay'
import { ProductRealtimeRefresh } from '@/components/shop/ProductRealtimeRefresh'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import type { ProductWithCategory } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()
  return {
    title: (data as { name: string; description: string | null } | null)?.name ?? 'Produk',
    description: (data as { name: string; description: string | null } | null)?.description ?? undefined,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, categories(id, name, slug, description)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) notFound()

  const product = data as ProductWithCategory

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProductRealtimeRefresh productId={product.id} />
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Kembali ke produk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <ImageGallery images={product.images ?? []} name={product.name} />

        <div className="space-y-6">
          {product.categories && (
            <Badge variant="secondary" className="text-xs">
              {product.categories.name}
            </Badge>
          )}

          <div>
            <h1 className="text-2xl font-bold text-white leading-snug">{product.name}</h1>
            <p className="text-3xl font-bold text-white mt-3">{formatPrice(product.price)}</p>
          </div>

          <div className="flex items-center gap-2">
            <StockRealtimeDisplay productId={product.id} initialStock={product.stock} />
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              images: product.images ?? [],
            }}
          />

          {product.description && (
            <div className="border-t border-zinc-800 pt-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">Deskripsi</h2>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
