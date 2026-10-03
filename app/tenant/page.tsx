import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TenantSignOut } from '@/components/tenant-sign-out'

export default async function TenantPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?mode=signin')
  const { data: profile } = await supabase.from('profiles').select('full_name,role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'tenant') redirect('/dashboard')
  const firstName = profile.full_name?.trim().split(/\s+/)[0] || 'there'

  return (
    <main className="min-h-screen bg-[#f7fafc] px-5 py-8 text-[#1B2A4A] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">VerifiedRent Ghana</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Welcome, {firstName}</h1></div>
          <TenantSignOut />
        </header>
        <section className="mt-10 rounded-3xl bg-[#1B2A4A] p-6 text-white shadow-xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">Your tenant space</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Find a home that feels right.</h2>
          <p className="mt-3 max-w-xl text-slate-200">Explore published rental properties across Ghana with search, region, type, rent, furnishing, and verified-only filters.</p>
          <Link href="/properties" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 font-bold text-white transition hover:bg-emerald-400">Explore properties</Link>
        </section>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-xl font-black">Browse rental homes</h2><p className="mt-2 text-slate-600">Use the full Explore page to search and filter listings by area and what matters to you.</p><Link href="/properties" className="mt-5 inline-flex min-h-11 items-center font-bold text-emerald-700 underline underline-offset-4">Open search and filters</Link></section>
      </div>
    </main>
  )
}
