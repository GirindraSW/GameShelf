import { z } from 'zod'

export const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .max(15, 'Nomor HP terlalu panjang')
    .regex(/^[0-9+]+$/, 'Nomor HP hanya boleh angka'),
  address: z.string().min(10, 'Alamat terlalu pendek'),
  city: z.string().min(2, 'Kota harus diisi'),
  province: z.string().min(2, 'Provinsi harus diisi'),
  postal_code: z
    .string()
    .length(5, 'Kode pos harus 5 digit')
    .regex(/^\d+$/, 'Kode pos hanya angka'),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
