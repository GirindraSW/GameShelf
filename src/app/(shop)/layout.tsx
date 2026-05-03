import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shop/Navbar'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user ? { email: user.email ?? '' } : null} />
      <main>{children}</main>
    </div>
  )
}
