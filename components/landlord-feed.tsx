'use client'

import Link from 'next/link'

type Listing = { id: string; title: string; property_type: string; rent_amount: number; status: string; cities?: { name: string } | null }

export function LandlordFeed({ properties }: { userId: string; properties: Listing[]; regions: { id: string; name: string }[]; analyticsByType?: Record<string, { views: number; likes: number; inquiries: number }> }) {
  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-3xl font-black">Your listings</h2>
      <Link href="/list-property" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 font-bold text-white">Post New Property</Link>
    </div>
    {properties.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{properties.map((property) => <article key={property.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{property.title}</h3><div className="flex gap-2"><Link href={`/property/${property.id}`} className="rounded-lg border px-3 py-2 text-sm font-bold">View</Link><Link href={`/list-property?edit=${property.id}`} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Edit</Link></div></div><p className="mt-1 text-sm text-slate-500">{property.cities?.name ?? 'City not set'} · {property.status} · GH₵ {property.rent_amount.toLocaleString()}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">You have not posted a property yet.</div>}
  </section>
}
