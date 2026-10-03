'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, ShieldCheck } from 'lucide-react'

type ImageRecord = { image_url: string; is_primary: boolean | null; display_order: number | null }
type Property = {
  id: string
  title: string
  description: string | null
  rent_amount: number
  bedrooms: number | null
  bathrooms: number | null
  furnishing_status: string | null
  property_type: string
  neighborhood: string | null
  is_verified_landlord: boolean | null
  property_images?: ImageRecord[]
}
type Landlord = { full_name: string | null }

export function PropertyDetail({ property, landlord }: { property: Property; landlord: Landlord | null }) {
  const images = [...(property.property_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.display_order ?? 0) - (b.display_order ?? 0))
  const [activeImage, setActiveImage] = useState(0)
  const currentImage = images[activeImage]?.image_url
  const landlordName = landlord?.full_name || 'VerifiedRent landlord'

  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-6 text-[#10233d] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/properties" className="text-sm font-bold text-emerald-700">← Back to listings</Link>
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-emerald-50 sm:aspect-[16/8]">
            {currentImage ? <img src={currentImage} alt={`${property.title} photo ${activeImage + 1}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-emerald-700">No property photos available</div>}
            {images.length > 1 && <>
              <button type="button" aria-label="Previous photo" onClick={() => setActiveImage((index) => (index - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow"><ChevronLeft /></button>
              <button type="button" aria-label="Next photo" onClick={() => setActiveImage((index) => (index + 1) % images.length)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-800 shadow"><ChevronRight /></button>
            </>}
          </div>
          {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-3">{images.map((image, index) => <button type="button" key={`${image.image_url}-${index}`} aria-label={`View photo ${index + 1}`} onClick={() => setActiveImage(index)} className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? 'border-emerald-600' : 'border-transparent'}`}><img src={image.image_url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{property.property_type}</span>{property.is_verified_landlord && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white"><ShieldCheck size={16} /> Verified Landlord</span>}</div>
            <h1 className="mt-4 text-3xl font-black sm:text-5xl">{property.title}</h1>
            {property.neighborhood && <p className="mt-2 text-slate-500">{property.neighborhood}</p>}
            <p className="mt-5 text-3xl font-black text-emerald-700">GHS {Number(property.rent_amount).toLocaleString()}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Bedrooms', property.bedrooms ?? '—'], ['Bathrooms', property.bathrooms ?? '—'], ['Furnishing', property.furnishing_status ?? '—'], ['Availability', 'Published']].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-black">{value}</p></div>)}</div>
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Posted by</p><p className="mt-1 text-xl font-black">{landlordName}</p>{property.is_verified_landlord && <p className="mt-1 text-sm font-semibold text-emerald-700">Verified Landlord</p>}</div>
            <div className="mt-8 border-t border-slate-100 pt-6"><h2 className="text-xl font-black">About this property</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{property.description || 'No description provided.'}</p></div>
          </div>
        </section>
      </div>
    </main>
  )
}
