"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { createClient } from '@/lib/supabase/client'
import type { Category, ProductWithCategory } from '@/types'

interface ProductFormProps {
  categories: Category[]
  product?: ProductWithCategory
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category_id: product?.category_id ?? '',
      images: product?.images ?? [],
      is_active: product?.is_active ?? true,
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (!isEditing && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEditing, setValue])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (error) throw error
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
      const updated = [...images, ...newUrls]
      setImages(updated)
      setValue('images', updated)
    } catch {
      alert('Gagal upload gambar. Pastikan bucket "product-images" sudah dibuat di Supabase Storage.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(url: string) {
    const updated = images.filter((img) => img !== url)
    setImages(updated)
    setValue('images', updated)
  }

  async function onSubmit(data: ProductFormData) {
    setSubmitError('')
    try {
      const url = isEditing ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Terjadi kesalahan')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <Field label="Nama Produk" error={errors.name?.message}>
        <Input {...register('name')} placeholder="contoh: The Last of Us Part II" />
      </Field>

      <Field label="Slug (URL)" error={errors.slug?.message}>
        <Input {...register('slug')} placeholder="the-last-of-us-part-ii" />
        <p className="text-xs text-zinc-500 mt-1">
          Otomatis dibuat dari nama saat membuat produk baru
        </p>
      </Field>

      <Field label="Deskripsi" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Deskripsi produk..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Harga (Rp)" error={errors.price?.message}>
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="150000"
          />
        </Field>
        <Field label="Stok" error={errors.stock?.message}>
          <Input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            min={0}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Kategori" error={errors.category_id?.message}>
        <select
          {...register('category_id')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
        >
          <option value="">— Pilih kategori —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Gambar Produk">
        <div className="space-y-3">
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? 'Mengupload...' : 'Upload Gambar'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </Field>

      <div className="flex items-center gap-3">
        <input
          {...register('is_active')}
          type="checkbox"
          id="is_active"
          className="w-4 h-4 accent-white"
        />
        <label htmlFor="is_active" className="text-sm text-zinc-300 cursor-pointer">
          Produk aktif (ditampilkan ke customer)
        </label>
      </div>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/products')}
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
