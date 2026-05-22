import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan tanda -'),
  description: z.string().optional(),
  price: z.number().int('Harga harus angka bulat').gt(0, 'Harga harus lebih dari 0'),
  stock: z.number().int('Stok harus angka bulat').min(0, 'Stok tidak boleh negatif'),
  category_id: z.string().optional(),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormData = z.output<typeof productSchema>
