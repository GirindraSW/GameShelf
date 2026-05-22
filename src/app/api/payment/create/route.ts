import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { snap } from '@/lib/midtrans'
import type { ShippingAddress } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order_id } = await req.json()
  if (!order_id) return NextResponse.json({ error: 'order_id wajib diisi' }, { status: 400 })

  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('id', order_id)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Order sudah diproses' }, { status: 400 })
  }

  // Pakai snap_token lama jika sudah ada
  if (order.midtrans_snap_token) {
    return NextResponse.json({ snap_token: order.midtrans_snap_token })
  }

  const shipping = order.shipping_address as unknown as ShippingAddress

  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.total_amount,
    },
    customer_details: {
      first_name: shipping.full_name,
      phone: shipping.phone,
      email: user.email,
      shipping_address: {
        first_name: shipping.full_name,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        postal_code: shipping.postal_code,
        country_code: 'IDN',
      },
    },
    item_details: (order.order_items as any[]).map((item) => ({
      id: item.product_id,
      price: item.price_at_purchase,
      quantity: item.quantity,
      name: (item.products?.name ?? 'Produk').substring(0, 50),
    })),
  }

  try {
    const transaction = await snap.createTransaction(parameter)

    await admin
      .from('orders')
      .update({
        midtrans_snap_token: transaction.token,
        midtrans_order_id: order.id,
      })
      .eq('id', order.id)

    return NextResponse.json({ snap_token: transaction.token })
  } catch (err: any) {
    console.error('[Midtrans] createTransaction error:', err?.message ?? err)
    return NextResponse.json(
      { error: err?.message ?? 'Gagal membuat transaksi Midtrans' },
      { status: 500 }
    )
  }
}
