import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Tambah Produk</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Isi form di bawah untuk menambah produk baru
        </p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
