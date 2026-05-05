import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import type { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { shipping_address, items } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(shipping_address)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const total_amount = (items as CartItem[]).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount,
      shipping_address: parsed.data,
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItems = (items as CartItem[]).map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({ order_id: order.id }, { status: 201 })
}
