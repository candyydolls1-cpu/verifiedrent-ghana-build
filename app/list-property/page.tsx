'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const regions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North']
const propertyTypes = ['Apartment', 'House', 'Guest House', 'Hotel', 'Airbnb', 'Hostel', 'Townhouse', 'Office', 'Shop', 'Land', 'Event Space', 'Warehouse']
const photoPrompts = ['Show us your building from outside', 'Show us the main room inside', 'Something that makes this home special.']

type FormState = { phone: string; whatsapp: string; title: string; type: string; region: string; neighborhood: string; rent: string; bedrooms: string; furnished: string }

export default function ListPropertyPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ phone: '', whatsapp: '', title: '', type: 'Apartment', region: 'Greater Accra', neighborhood: '', rent: '', bedrooms: '1', furnished: 'No' })
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }))

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth?mode=signup&role=landlord'); return }
    const region = (await supabase.from('regions').select('id').eq('name', form.region).maybeSingle()).data
    if (!region) { setError('Please choose a valid Ghana region.'); setLoading(false); return }
    const selectedPhotos = photos.filter((photo): photo is File => Boolean(photo))
    if (selectedPhotos.length !== 3) { setError('Please add all three photos before publishing.'); setLoading(false); return }
    const { error: contactError } = await supabase.from('landlord_profiles').upsert({ user_id: user.id, email: user.email, phone: form.phone.trim() || null, whatsapp: form.whatsapp.trim() || null, preferred_contact: form.whatsapp.trim() ? 'whatsapp' : form.phone.trim() ? 'phone' : null }, { onConflict: 'user_id' })
    if (contactError) { setError('We could not save your contact details. Please try again.'); setLoading(false); return }
    const { data: property, error: propertyError } = await supabase.from('properties').insert({ landlord_id: user.id, title: form.title.trim(), property_type: form.type, region_id: region.id, neighborhood: form.neighborhood.trim(), rent_amount: Number(form.rent), bedrooms: Number(form.bedrooms), is_furnished: form.furnished === 'Yes', status: 'published', is_verified_landlord: false }).select('id').single()
    if (propertyError || !property) { setError(propertyError?.message ?? 'We could not publish your property.'); setLoading(false); return }
    for (const [index, photo] of selectedPhotos.entries()) {
      const displayOrder = index + 1
      const path = `${user.id}/${property.id}/${crypto.randomUUID()}-${photo.name}`
      const upload = await supabase.storage.from('property-images').upload(path, photo, { contentType: photo.type, upsert: false })
      if (upload.error) { setError(upload.error.message); setLoading(false); return }
      const imageUrl = supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
      const { error: imageError } = await supabase.from('property_images').insert({ property_id: property.id, image_url: imageUrl, is_primary: displayOrder === 1, display_order: displayOrder })
      if (imageError) { setError(imageError.message); setLoading(false); return }
    }
    setLoading(false); router.push(`/list-property?published=true&propertyId=${property.id}`)
  }

  const published = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('published') === 'true'
  if (published) { const propertyId = new URLSearchParams(window.location.search).get('propertyId'); return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div><h1 className="mt-6 text-3xl font-black">Your property is now live on VerifiedRent Ghana.</h1><p className="mt-4 text-slate-600">Complete verification to earn the Verified Landlord badge - verified landlords get 3x more views.</p>{propertyId && <button onClick={() => router.push(`/properties/${propertyId}`)} className="mt-8 min-h-12 rounded-2xl bg-emerald-600 px-6 font-bold text-white">View Your Listing</button>}</div></main> }

  return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto max-w-md"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">VerifiedRent Ghana</p><h1 className="mt-3 text-3xl font-black">List your property</h1><p className="mt-2 text-slate-600">Your listing goes live immediately.</p><form onSubmit={publish} className="mt-7 grid gap-4"><fieldset className="grid gap-3 rounded-3xl border bg-white p-4"><legend className="px-1 text-lg font-black">About you</legend><p className="text-sm text-slate-500">A phone number increases trust and shows on your listing.</p><label className="grid gap-1 text-sm font-semibold">Phone number<span className="font-normal text-slate-500">This is how tenants will reach you.</span><input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Your phone number" className="min-h-12 rounded-2xl border px-4 text-base" /></label><label className="grid gap-1 text-sm font-semibold">WhatsApp number <span className="font-normal text-slate-500">If different from your phone.</span><input type="tel" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="Your WhatsApp number" className="min-h-12 rounded-2xl border px-4 text-base" /></label></fieldset><fieldset className="grid gap-4 rounded-3xl border bg-white p-4"><legend className="px-1 text-lg font-black">Your property</legend><input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="Property title" className="min-h-12 rounded-2xl border px-4 text-base" /><select value={form.type} onChange={e => update('type', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{propertyTypes.map(type => <option key={type}>{type}</option>)}</select><select value={form.region} onChange={e => update('region', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{regions.map(region => <option key={region}>{region}</option>)}</select><input required value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Neighborhood or city" className="min-h-12 rounded-2xl border px-4 text-base" /><input required min="0" type="number" value={form.rent} onChange={e => update('rent', e.target.value)} placeholder="Monthly rent in GHS" className="min-h-12 rounded-2xl border px-4 text-base" /><input required min="0" type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} placeholder="Bedrooms" className="min-h-12 rounded-2xl border px-4 text-base" /><label className="grid gap-1 text-sm font-semibold">Furnished status<select value={form.furnished} onChange={e => update('furnished', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option>No</option><option>Yes</option></select></label>{photoPrompts.map((prompt, index) => <label key={prompt} className="grid gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4"><span className="font-bold text-emerald-900">Photo {index + 1}</span><span className="text-sm text-emerald-800">{prompt}</span><input required accept="image/*" type="file" onChange={e => setPhotos(current => current.map((photo, photoIndex) => photoIndex === index ? e.target.files?.[0] ?? null : photo))} className="text-sm" /></label>)}</fieldset>{error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<button disabled={loading} className="min-h-12 rounded-2xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{loading ? 'Publishing...' : 'Publish my property'}</button></form></div></main>
}
