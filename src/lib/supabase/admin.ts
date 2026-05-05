import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Client dengan service role — bypass RLS, hanya pakai di server side
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
