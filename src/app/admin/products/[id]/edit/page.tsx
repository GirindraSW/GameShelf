import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
import type { ProductWithCategory } from '@/types'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(id, name, slug, description)')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Edit Produk</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{product.name}</p>
      </div>
      <ProductForm
        categories={categories ?? []}
        product={product as ProductWithCategory}
      />
    </div>
  )
}
