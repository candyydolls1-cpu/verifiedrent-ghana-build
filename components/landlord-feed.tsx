'use client'

import Link from 'next/link'

type Listing = { id: string; title: string; property_type: string; rent_amount: number; status: string; cover_image_url?: string | null; cities?: { name: string } | null }

export function LandlordFeed({ properties }: { userId: string; properties: Listing[]; regions: { id: string; name: string }[]; analyticsByType?: Record<string, { views: number; likes: number; inquiries: number }> }) {
  return <section className="space-y-6 bg-[#f7fafc]">
    <h2 className="text-3xl font-black text-slate-900">Your listings</h2>
    {properties.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{properties.map((property) => <article key={property.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-4 h-40 overflow-hidden rounded-xl bg-slate-100">{property.cover_image_url ? <img src={property.cover_image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-slate-400">No cover photo</div>}</div><h3 className="mt-1 break-words text-lg font-bold leading-snug text-slate-900">{property.title}</h3><p className="mt-2 text-sm text-slate-600">{property.cities?.name ?? 'City not set'} · {property.status} · GH₵ {property.rent_amount.toLocaleString()}</p><div className="mt-4 flex gap-2"><Link href={`/property/${property.id}`} className="min-h-11 flex-1 rounded-lg border px-3 py-2 text-center text-sm font-bold">View</Link><Link href={`/list-property?edit=${property.id}`} className="min-h-11 flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-bold text-white">Edit</Link></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">You have not posted a property yet.</div>}
    <Link href="/list-property" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 font-bold text-white shadow-sm">Post New Property</Link>
  </section>
}
