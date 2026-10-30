'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Heart, MessageCircle, MapPin, X } from 'lucide-react'

const propertyTypes = ['Apartment', 'Single Room', 'Self-Contained', 'House', 'Compound House', 'Airbnb', 'Hotel', 'Guesthouse', 'Office Space', 'Land', 'Warehouse']
const regions = ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Volta', 'Northern']

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop()
    return id ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}

type ExploreProperty = {
  id: string
  title: string | null
  price: number | string | null
    property_type: string | null
  is_verified_landlord?: boolean | null
  region_id?: string | null
  district_id?: string | number | null
  city_id?: string | null
  cities?: { name: string } | { name: string }[] | null
  primary_image_url?: string | null
}

type ExploreVideo = { id: string; title: string | null; video_url: string | null }

export function ExploreFeed({ properties, videos, loadError }: { properties: ExploreProperty[]; videos: ExploreVideo[]; loadError?: string }) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [liked, setLiked] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState<Record<string, string[]>>({})
  function toggleLike(id: string) { setLiked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }
  function addComment(id: string) { if (!comment.trim()) return; setSubmitted((current) => ({ ...current, [id]: [...(current[id] ?? []), comment.trim()] })); setComment('') }

  return <main className="min-h-screen bg-[#07182d] text-white">
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07182d]/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">VerifiedRent Ghana</p><h1 className="text-2xl font-black tracking-tight">Explore homes</h1></div></header>
    <section className="mx-auto max-w-2xl snap-y snap-mandatory space-y-5 px-3 py-5">{loadError ? <div className="rounded-3xl border border-rose-300/20 bg-rose-950/30 p-8 text-center"><h2 className="text-xl font-black">Explore is temporarily unavailable</h2><p className="mt-2 text-sm text-blue-100/70">We could not load published homes right now.</p></div> : properties.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"><h2 className="text-xl font-black">No published homes yet</h2><p className="mt-2 text-sm text-blue-100/70">New properties will appear here as soon as they go live.</p></div> : properties.map((property) => { const listing = { id: property.id, title: property.title ?? 'Published property', type: property.property_type ?? 'Property', price: property.price ? `GH₵ ${property.price}` : 'Price on request', district: Array.isArray(property.cities) ? property.cities[0]?.name ?? 'Ghana' : property.cities?.name ?? 'Ghana', region: '', creator: 'VerifiedRent listing' }; return <article key={listing.id} className="relative min-h-[calc(100svh-110px)] snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#102b4a] shadow-2xl">
      {property.primary_image_url ? <img src={property.primary_image_url} alt={listing.title} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="absolute inset-0 grid place-items-center bg-[#102b4a] text-sm font-bold text-blue-100/70">No photo yet</div>}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07182d] via-transparent to-black/20" /><div className="absolute bottom-0 left-0 right-0 p-6"><div className="mb-4 flex items-center gap-2 text-sm text-emerald-200"><MapPin className="size-4" /> {listing.district}, {listing.region}</div><h2 className="text-3xl font-black leading-tight">{listing.title}</h2><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-[#07182d]">{listing.type}</span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${property.is_verified_landlord ? 'bg-amber-500 text-amber-950' : 'bg-red-100 text-red-700'}`}>{property.is_verified_landlord ? <Check size={13} /> : <X size={13} />}{property.is_verified_landlord ? 'Verified Landlord' : 'Landlord not verified'}</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{listing.price}</span></div><p className="mt-4 text-sm text-blue-100/75">Posted by {listing.creator}</p><div className="mt-5 flex items-center gap-3"><button onClick={() => toggleLike(listing.id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold ${liked.includes(listing.id) ? 'bg-rose-500' : 'bg-white/15'}`}><Heart className={`size-5 ${liked.includes(listing.id) ? 'fill-current' : ''}`} /> {liked.includes(listing.id) ? 'Liked' : 'Like'}</button><Link href={`/property/${listing.id}`} className="rounded-xl bg-white px-4 py-3 font-bold text-[#07182d]">View full listing</Link></div><div className="mt-4 flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Say something about this home" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-blue-100/45" /><button onClick={() => addComment(listing.id)} aria-label="Post comment" className="rounded-xl bg-white/15 p-3"><MessageCircle className="size-5" /></button></div>{submitted[listing.id]?.map((item) => <p key={item} className="mt-2 text-xs text-blue-100/70">{item}</p>)}</div>
    </article>})}{videos.map((tour) => { const embedUrl = getYouTubeEmbedUrl(tour.video_url); if (!embedUrl) return null; return <article key={`tour-${tour.id}`} className="relative min-h-[calc(100svh-110px)] snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#102b4a] shadow-2xl"><div className="absolute inset-0 bg-[#07182d]"><iframe src={embedUrl} title={tour.title ? `Tour: ${tour.title}` : 'Property tour'} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="size-full object-cover" /></div><div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07182d] via-[#07182d]/80 to-transparent p-6 pt-24"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Property tour</p><h2 className="mt-2 text-2xl font-black leading-tight">{tour.title ?? 'Property tour'}</h2></div></article>})}</section>
    {uploadOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"><form onSubmit={(event) => { event.preventDefault(); setUploadOpen(false) }} className="max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-[#10233d] shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Creator upload</p><h2 className="mt-1 text-2xl font-black">Show Ghana your home</h2></div><button type="button" onClick={() => setUploadOpen(false)} aria-label="Close upload"><X /></button></div><p className="mt-2 text-sm text-slate-500">Videos under 60 seconds. Supabase upload wiring will activate when the schema is available.</p><label className="mt-5 block text-sm font-bold">Video<input required type="file" accept="video/*" className="mt-2 w-full rounded-xl border p-3" /></label><label className="mt-4 block text-sm font-bold">Title<input required placeholder="Bright 2-bedroom with a compound" className="mt-2 w-full rounded-xl border p-3" /></label><label className="mt-4 block text-sm font-bold">Property type<select className="mt-2 w-full rounded-xl border p-3">{propertyTypes.map((item) => <option key={item}>{item}</option>)}</select></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Price<input required placeholder="GH₵ 2,500 / month" className="mt-2 w-full rounded-xl border p-3" /></label><label className="text-sm font-bold">Region<select className="mt-2 w-full rounded-xl border p-3">{regions.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="mt-4 block text-sm font-bold">District<input required placeholder="Exact district" className="mt-2 w-full rounded-xl border p-3" /></label><button className="mt-6 w-full rounded-xl bg-[#10B981] px-5 py-4 font-black text-white">Preview my video</button></form></div>}
  </main>
}

export default ExploreFeed
