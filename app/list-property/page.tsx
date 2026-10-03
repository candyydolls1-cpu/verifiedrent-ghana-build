'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const regions = ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Western North', 'Ahafo', 'Bono East', 'Oti', 'North East', 'Savannah']
const propertyTypes = ['Apartment', 'House', 'Guest House', 'Hotel', 'Airbnb', 'Hostel', 'Townhouse', 'Office', 'Shop', 'Land', 'Event Space', 'Warehouse']
const photoPrompts = ['Show us your building from outside', 'Show us the main room inside', 'Something that makes this home special.', 'Show us the kitchen', 'Show us a bedroom', 'Show us the bathroom', 'Show us the compound or parking', 'Add another photo']
type FormState = { email: string; phone: string; whatsapp: string; title: string; type: string; region: string; neighborhood: string; rent: string; bedrooms: string; bathrooms: string; furnished: string; amenities: string; availability: string }

export default function ListPropertyPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ email: '', phone: '', whatsapp: '', title: '', type: 'Apartment', region: 'Greater Accra', neighborhood: '', rent: '', bedrooms: '1', bathrooms: '1', furnished: 'Unfurnished', amenities: '', availability: 'Available now' })
  const [photos, setPhotos] = useState<(File | null)[]>(Array(8).fill(null))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); router.replace('/auth?mode=signup&role=landlord'); return }
    const authUserId = user.id
    const selectedPhotos = photos.filter((photo): photo is File => Boolean(photo))
    if (!form.rent || Number(form.rent) <= 0 || selectedPhotos.length < 1) { setError('Add a monthly rent and at least one photo to publish.'); setLoading(false); return }
    const { data: region } = await supabase.from('regions').select('id').eq('name', form.region).maybeSingle()
    if (!region) { setError('Please choose a valid Ghana region.'); setLoading(false); return }
    const { error: contactError } = await supabase.from('landlord_profiles').upsert({ user_id: user.id, phone: form.phone, email: form.email || null, preferred_contact: form.whatsapp ? 'whatsapp' : 'phone' }, { onConflict: 'user_id' })
    if (contactError) { setError(contactError.message); setLoading(false); return }
    const propertyPayload = { landlord_id: authUserId, title: form.title.trim(), property_type: form.type, region_id: region.id, neighborhood: form.neighborhood.trim(), rent_amount: Number(form.rent), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), is_furnished: form.furnished === 'Furnished', amenities: form.amenities.trim() || null, availability: form.availability, status: 'published', is_verified_landlord: false }
    const { data: existingProperty } = await supabase.from('properties').select('id').eq('landlord_id', authUserId).eq('title', form.title.trim()).maybeSingle()
    const { data: property, error: propertyError } = await supabase.from('properties').upsert(existingProperty ? { id: existingProperty.id, ...propertyPayload } : propertyPayload, { onConflict: 'id' }).select('id').single()
    if (propertyError || !property) { setError(propertyError?.message ?? 'We could not publish your property.'); setLoading(false); return }
    for (const [index, photo] of selectedPhotos.entries()) {
      const displayOrder = index + 1
      const path = `${authUserId}/${property.id}/${crypto.randomUUID()}-${photo.name}`
      const upload = await supabase.storage.from('property-images').upload(path, photo, { contentType: photo.type, upsert: false })
      if (upload.error) { setError(upload.error.message); setLoading(false); return }
      const imageUrl = supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
      const { error: imageError } = await supabase.from('property_images').upsert({ property_id: property.id, image_url: imageUrl, is_primary: displayOrder === 1, display_order: displayOrder }, { onConflict: 'property_id,display_order' })
      if (imageError) { setError(imageError.message); setLoading(false); return }
    }
    router.push(`/property/${property.id}`)
  }

  const published = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('published') === 'true'
  if (published) { const propertyId = new URLSearchParams(window.location.search).get('propertyId'); return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div><h1 className="mt-6 text-3xl font-black">Your property is now live on VerifiedRent Ghana.</h1><p className="mt-4 text-slate-600">Complete verification to earn the Verified Landlord badge - verified landlords get 3x more views.</p>{propertyId && <button onClick={() => router.push(`/property/${propertyId}`)} className="mt-8 min-h-12 rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-600/20">View Your Listing</button>}</div></main> }

  return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto max-w-md"><h1 className="mt-3 text-3xl font-black">List your property</h1><p className="mt-2 text-slate-600">It&apos;s free, and it goes live immediately. Reach tenants across Ghana.</p><form onSubmit={publish} className="mt-7 grid gap-4"><fieldset className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><legend className="px-1 text-lg font-black">About you</legend><p className="text-sm text-slate-500">Tenants will use these to reach you.</p><label className="grid gap-1 text-sm font-semibold">Phone number<span className="font-normal text-slate-500">This is how tenants will reach you.</span><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="min-h-12 rounded-2xl border px-4 text-base" /></label><label className="grid gap-1 text-sm font-semibold">WhatsApp<span className="font-normal text-slate-500">If different from your phone.</span><input type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="min-h-12 rounded-2xl border px-4 text-base" /></label></fieldset><fieldset className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><legend className="px-1 text-lg font-black">Your property</legend><input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Property title" className="min-h-12 rounded-2xl border px-4 text-base" /><select value={form.type} onChange={(e) => update('type', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select><select value={form.region} onChange={(e) => update('region', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{regions.map((region) => <option key={region}>{region}</option>)}</select><input required value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} placeholder="Neighborhood" className="min-h-12 rounded-2xl border px-4 text-base" /><input required type="number" min="1" value={form.rent} onChange={(e) => update('rent', e.target.value)} placeholder="Monthly rent in GH₵" className="min-h-12 rounded-2xl border px-4 text-base" /><div className="grid grid-cols-2 gap-3"><select value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option value="1">1 bedroom</option><option value="2">2 bedrooms</option><option value="3">3 bedrooms</option><option value="4">4+ bedrooms</option></select><select value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option value="1">1 bathroom</option><option value="2">2 bathrooms</option><option value="3">3+ bathrooms</option></select></div><select value={form.furnished} onChange={(e) => update('furnished', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option>Furnished</option><option>Unfurnished</option></select><textarea value={form.amenities} onChange={(e) => update('amenities', e.target.value)} placeholder="Amenities: water, electricity, parking, security..." className="min-h-24 rounded-2xl border px-4 py-3 text-base" /><select value={form.availability} onChange={(e) => update('availability', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option>Available now</option><option>Available next month</option><option>Available in 2 months</option></select></fieldset><fieldset className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><legend className="px-1 text-lg font-black">Photos</legend><p className="text-sm text-slate-500">Add up to 8 real photos of your property.</p>{photoPrompts.map((prompt, index) => <label key={prompt} className="grid gap-2 rounded-2xl border border-dashed p-3 text-sm font-semibold"><span>{prompt}</span><input type="file" accept="image/*" onChange={(e) => setPhotos((current) => current.map((photo, photoIndex) => photoIndex === index ? (e.target.files?.[0] ?? null) : photo))} className="text-sm" /></label>)}</fieldset>{error && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="min-h-14 rounded-2xl bg-emerald-600 font-bold text-white disabled:opacity-60">{loading ? 'Publishing...' : 'Publish - free'}</button></form></div></main>
}
