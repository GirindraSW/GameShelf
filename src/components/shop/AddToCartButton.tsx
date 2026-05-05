"use client"

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    images: string[]
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  if (product.stock === 0) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Stok Habis
      </Button>
    )
  }

  function handleAdd() {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? null,
      stock: product.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      size="lg"
      onClick={handleAdd}
      className="w-full sm:w-auto gap-2"
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {added ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
    </Button>
  )
}
