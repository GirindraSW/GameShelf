export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'admin'
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          stock: number
          category_id: string | null
          images: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          stock?: number
          category_id?: string | null
          images?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          price?: number
          stock?: number
          category_id?: string | null
          images?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          midtrans_order_id: string | null
          midtrans_snap_token: string | null
          shipping_address: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          midtrans_order_id?: string | null
          midtrans_snap_token?: string | null
          shipping_address: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          midtrans_order_id?: string | null
          midtrans_snap_token?: string | null
          shipping_address?: Json
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
        }
        Update: {
          quantity?: number
          price_at_purchase?: number
        }
      }
      payment_logs: {
        Row: {
          id: string
          order_id: string
          midtrans_transaction_id: string | null
          status: string
          raw_response: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          midtrans_transaction_id?: string | null
          status: string
          raw_response: Json
          created_at?: string
        }
        Update: never
      }
    }
  }
}
