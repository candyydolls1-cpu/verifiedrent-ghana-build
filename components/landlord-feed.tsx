'use client'

import Link from 'next/link'

type Listing = { id: string; title: string; property_type: string; price: number; status: string }

export function LandlordFeed({ properties }: { userId: string; properties: Listing[]; regions: { id: string; name: string }[]; analyticsByType?: Record<string, { views: number; likes: number; inquiries: number }> }) {
  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-3xl font-black">Your listings</h2>
      <Link href="/list-property" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 font-bold text-white">Post New Property</Link>
    </div>
    {properties.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{properties.map((property) => <article key={property.id} className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-500">{property.property_type} · {property.status}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">You have not posted a property yet.</div>}
  </section>
}
