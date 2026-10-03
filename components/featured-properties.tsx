'use client'

import Link from 'next/link'
import { VerificationInfoDialog } from '@/components/verification-info-dialog'

type FeaturedProperty = {
  id: string
  title: string
  rent_amount: number
  bedrooms: number | null
  is_verified_landlord: boolean | null
  region_name: string
  property_images: { image_url: string | null; is_primary: boolean | null; display_order: number | null }[]
}

export function FeaturedProperties({ properties }: { properties: FeaturedProperty[] }) {
  return <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 lg:px-12" aria-labelledby="featured-properties-heading">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-bold uppercase tracking-[0.2em] text-emerald-600">Worth a look</p><h2 id="featured-properties-heading" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Featured Properties</h2></div>
      {properties.length > 0 && <Link href="/properties" className="font-bold text-emerald-700 hover:text-emerald-800">View all properties →</Link>}
    </div>
    {properties.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map((property) => { const images = [...property.property_images].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.display_order ?? 0) - (b.display_order ?? 0)); const image = images[0]?.image_url; return <Link key={property.id} href={`/property/${property.id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">{image ? <img src={image} alt={property.title} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-emerald-50 text-emerald-700">No photo</div>}<div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-black text-[#10233d]">{property.title}</h3>{property.is_verified_landlord && <VerificationInfoDialog type="landlord" compact />}</div><p className="mt-3 text-lg font-black text-emerald-700">GH₵{Number(property.rent_amount).toLocaleString()} <span className="text-sm font-medium text-slate-500">/ month</span></p><p className="mt-2 text-sm text-slate-500">{property.bedrooms ?? '—'} bedrooms · {property.region_name}</p></div></Link>})}</div> : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><h3 className="text-2xl font-black text-[#10233d]">No properties listed yet.</h3><p className="mx-auto mt-3 max-w-md text-slate-600">Be the first - list your property for free.</p><Link href="/auth?mode=signup&role=landlord" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 font-bold text-white hover:bg-emerald-700">List Your Property Free</Link></div>}
  </section>
}
