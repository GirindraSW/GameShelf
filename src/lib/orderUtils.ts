import { createAdminClient } from './supabase/admin'
import { sendOrderPaidEmail } from './email'

/**
 * Update order ke status 'paid' dan kurangi stok produk.
 * Atomic: hanya berjalan jika status order masih 'pending'
 * (mencegah double-decrement jika webhook + status check keduanya terpicu)
 */
export async function markOrderPaid(orderId: string): Promise<boolean> {
  const admin = createAdminClient()

  // Update hanya jika status masih 'pending'
  const { data: updated } = await admin
    .from('orders')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('*, order_items(product_id, quantity)')

  if (!updated || updated.length === 0) {
    // Sudah paid sebelumnya atau order tidak ditemukan — skip
    return false
  }

  const order = updated[0] as any

  // Kurangi stok setiap produk
  for (const item of order.order_items as { product_id: string; quantity: number }[]) {
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    if (product && product.stock >= item.quantity) {
      await admin
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.product_id)
    }
  }

  // Kirim email terima kasih (non-blocking)
  const { data: userData } = await admin.auth.admin.getUserById(order.user_id)
  const userEmail = userData?.user?.email
  if (userEmail) {
    const shipping = order.shipping_address as { full_name?: string } | null
    sendOrderPaidEmail({
      orderId: order.id,
      userEmail,
      customerName: shipping?.full_name ?? 'Pelanggan',
      totalAmount: order.total_amount,
      itemCount: (order.order_items as any[]).reduce((sum: number, i: any) => sum + i.quantity, 0),
    })
  }

  return true
}
