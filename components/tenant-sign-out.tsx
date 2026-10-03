'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TenantSignOut() {
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/auth?mode=signin')
    router.refresh()
  }
  return <button type="button" onClick={signOut} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#1B2A4A] transition hover:border-emerald-500">Sign out</button>
}
