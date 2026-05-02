import type { Database } from './database'

export type { Database }

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type PaymentLog = Database['public']['Tables']['payment_logs']['Row']

export type OrderStatus = Order['status']
export type UserRole = Profile['role']

export interface ShippingAddress {
  full_name: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image: string | null
  stock: number
}

export interface ProductWithCategory extends Product {
  categories: Category | null
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { products: Product })[]
}
