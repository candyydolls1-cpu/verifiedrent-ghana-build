'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Lookup = { id: string; name: string }
type Listing = {
  id: string
  title: string
  description: string | null
  property_type: string
  region_id: string
  city_id: string | null
  neighborhood: string | null
  approximate_location: string | null
  rent_amount: number
  bedrooms: number | null
  bathrooms: number | null
  status: string
  property_images?: { image_url: string; is_primary: boolean | null }[]
  property_likes?: { id: string }[]
  reviews?: { id: string; rating: number; feedback: string | null }[]
  analytics?: { views: number; likes: number; inquiries: number }
}

const initialForm = { title: '', description: '', property_type: 'Apartment', region_id: '', city_id: '', neighborhood: '', approximate_location: '', rent_amount: '', bedrooms: '', bathrooms: '', amenities: '' }

export function LandlordFeed({ userId, properties, regions, cities, analytics }: { userId: string; properties: Listing[]; regions: Lookup[]; cities: Lookup[]; analytics: Record<string, { views: number; likes: number; inquiries: number }> }) {
  const supabase = createClient()
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [created, setCreated] = useState(properties)

  const filteredCities = useMemo(() => cities.filter((city) => !form.region_id || properties.some((property) => property.city_id === city.id && property.region_id === form.region_id)), [cities, form.region_id, properties])

  function setField(field: keyof typeof initialForm, value: string) { setForm((current) => ({ ...current, [field]: value })) }
  function pickPhotos(event: ChangeEvent<HTMLInputElement>) { setPhotos(Array.from(event.target.files ?? []).slice(0, 8)) }

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setNotice('')
    const { data: property, error } = await supabase.from('properties').insert({ landlord_id: userId, title: form.title.trim(), description: form.description.trim(), property_type: form.property_type, region_id: form.region_id, city_id: form.city_id || null, neighborhood: form.neighborhood.trim() || null, approximate_location: form.approximate_location.trim() || null, rent_amount: Number(form.rent_amount), bedrooms: form.bedrooms ? Number(form.bedrooms) : null, bathrooms: form.bathrooms ? Number(form.bathrooms) : null, status: 'draft' }).select('id').single()
    if (error || !property) { setNotice(error?.message ?? 'Could not save this listing.'); setBusy(false); return }
    const amenities = form.amenities.split(',').map((amenity) => amenity.trim()).filter(Boolean)
    if (amenities.length) await supabase.from('property_amenities').insert(amenities.map((amenity) => ({ property_id: property.id, amenity })))
    if (photos.length) {
      const imageRows: { property_id: string; image_url: string; is_primary: boolean }[] = []
      for (const [index, photo] of photos.entries()) {
        const path = `${userId}/${property.id}/${crypto.randomUUID()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
        const upload = await supabase.storage.from('property-images').upload(path, photo, { contentType: photo.type, upsert: false })
        if (!upload.error) { const { data: publicFile } = supabase.storage.from('property-images').getPublicUrl(path); imageRows.push({ property_id: property.id, image_url: publicFile.publicUrl, is_primary: index === 0 }) }
      }
      if (imageRows.length) await supabase.from('property_images').insert(imageRows)
    }
    setCreated([{ id: property.id, ...form, rent_amount: Number(form.rent_amount), bedrooms: form.bedrooms ? Number(form.bedrooms) : null, bathrooms: form.bathrooms ? Number(form.bathrooms) : null, status: 'draft', description: form.description, neighborhood: form.neighborhood, approximate_location: form.approximate_location, property_images: [], property_likes: [], reviews: [] } as Listing, ...created])
    setForm(initialForm); setPhotos([]); setNotice('Saved as a draft.'); setBusy(false)
  }

  return <div className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Landlord feed</p><h2 className="mt-2 text-3xl font-bold">Put your property in front of trusted tenants.</h2><p className="mt-2 text-slate-500">Every listing starts as a draft so you can review it before publishing.</p></div><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] vr-fade-up-delay-1"><div className="grid gap-3 sm:grid-cols-3">{[['Views', Object.values(analytics).reduce((sum, item) => sum + item.views, 0)], ['Likes', Object.values(analytics).reduce((sum, item) => sum + item.likes, 0)], ['Inquiries', Object.values(analytics).reduce((sum, item) => sum + item.inquiries, 0)]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}</div><form onSubmit={createListing} className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xl font-bold">Create a property post</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Draft by default</span></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Listing title" value={form.title} onChange={(e) => setField('title', e.target.value)} required placeholder="Bright 2-bedroom near Osu" /><Field label="Property type" as="select" value={form.property_type} onChange={(e) => setField('property_type', e.target.value)}><option>Apartment</option><option>House</option><option>Chamber and hall</option><option>Studio</option><option>Commercial</option></Field><Field label="Region" as="select" value={form.region_id} onChange={(e) => setField('region_id', e.target.value)} required><option value="">Select region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</Field><Field label="City" as="select" value={form.city_id} onChange={(e) => setField('city_id', e.target.value)}><option value="">Select city</option>{filteredCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</Field><Field label="Monthly rent (GHS)" type="number" min="1" value={form.rent_amount} onChange={(e) => setField('rent_amount', e.target.value)} required /><Field label="Neighborhood" value={form.neighborhood} onChange={(e) => setField('neighborhood', e.target.value)} placeholder="East Legon" /><Field label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(e) => setField('bedrooms', e.target.value)} /><Field label="Bathrooms" type="number" min="0" value={form.bathrooms} onChange={(e) => setField('bathrooms', e.target.value)} /></div><Field label="Description" as="textarea" value={form.description} onChange={(e) => setField('description', e.target.value)} required placeholder="Tell tenants what makes this home a good fit." /><Field label="Approximate location" value={form.approximate_location} onChange={(e) => setField('approximate_location', e.target.value)} placeholder="Near A&C Mall, not an exact address" /><Field label="Amenities" value={form.amenities} onChange={(e) => setField('amenities', e.target.value)} placeholder="Parking, water tank, security, fitted kitchen" /><label className="block text-sm font-semibold text-slate-700">Photos<div className="mt-2 rounded-2xl border-2 border-dashed border-slate-200 p-5"><input type="file" accept="image/*" multiple onChange={pickPhotos} className="block w-full text-sm" /><p className="mt-2 text-xs text-slate-500">Up to 8 photos. They upload to Supabase Storage when you save.</p>{photos.length > 0 && <p className="mt-2 text-sm font-medium text-emerald-700">{photos.length} photo{photos.length === 1 ? '' : 's'} selected</p>}</div></label>{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{notice}</p>}<button disabled={busy} className="vr-lift w-full rounded-xl bg-[#1B2A4A] px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Saving draft...' : 'Save property draft'}</button></form><aside className="space-y-4"><div className="rounded-3xl bg-[#1B2A4A] p-6 text-white"><p className="text-sm font-semibold text-emerald-300">Your feed promise</p><h3 className="mt-2 text-2xl font-bold">Real homes. Clear details. Direct landlord engagement.</h3><p className="mt-3 text-sm leading-6 text-slate-300">Tenants can like a listing or leave a review tied to the landlord. There is no tenant-to-tenant messaging.</p></div><div className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="font-bold">Your posts</h3><div className="mt-4 space-y-3">{created.length === 0 ? <p className="text-sm text-slate-500">Your saved drafts will appear here.</p> : created.slice(0, 5).map((property) => <div key={property.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{property.title}</p><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">{property.status}</span></div><p className="mt-1 text-sm text-slate-500">GHS {Number(property.rent_amount).toLocaleString()} · {property.property_type}</p><p className="mt-2 text-xs text-slate-400">{property.property_likes?.length ?? 0} likes · {property.reviews?.length ?? 0} comments</p></div>)}</div></div></aside></div></div>
}

function Field({ label, as = 'input', ...props }: { label: string; as?: 'input' | 'select' | 'textarea'; [key: string]: any }) { const Component = as; return <label className="block text-sm font-semibold text-slate-700">{label}<Component className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500" {...props} /></label> }
