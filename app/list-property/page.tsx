'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const regions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North']
const propertyTypes = ['Apartment', 'House', 'Guest House', 'Hotel', 'Airbnb', 'Hostel', 'Townhouse', 'Office', 'Shop', 'Land', 'Event Space', 'Warehouse']

export default function ListPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState<'start' | 'signup' | 'listing' | 'success'>('start')
  const [form, setForm] = useState({ phone: '', name: '', password: '', title: '', type: 'Apartment', region: 'Greater Accra', neighborhood: '', rent: '', bedrooms: '1', bathrooms: '1', furnished: 'No' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }))

  async function createAccount(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({ phone: form.phone.trim(), password: form.password, options: { data: { full_name: form.name.trim(), role: 'landlord' } } })
    if (authError || !data.user) { setError(authError?.message ?? 'We could not create your account.'); setLoading(false); return }
    if (!data.session) { setError('Check your phone for the verification code, then return to continue.'); setLoading(false); return }
    const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.name.trim(), display_name: form.name.trim().split(/\s+/)[0], role: 'landlord' }, { onConflict: 'id' })
    if (profileError) { setError(profileError.message); setLoading(false); return }
    setStep('listing'); setLoading(false)
  }

  async function publish(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Your session expired. Please start again.'); setLoading(false); return }
    const { data: region } = await supabase.from('regions').select('id').eq('name', form.region).maybeSingle()
    if (!region) { setError('Please choose a valid Ghana region.'); setLoading(false); return }
    const { data: property, error: propertyError } = await supabase.from('properties').insert({ landlord_id: user.id, title: form.title.trim(), property_type: form.type, region_id: region.id, neighborhood: form.neighborhood.trim(), rent_amount: Number(form.rent), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), is_furnished: form.furnished === 'Yes', status: 'published', is_verified_landlord: false }).select('id').single()
    if (propertyError || !property) { setError(propertyError?.message ?? 'We could not publish your property.'); setLoading(false); return }
    if (photo) {
      const path = `${user.id}/${property.id}/${crypto.randomUUID()}-${photo.name}`
      const upload = await supabase.storage.from('property-images').upload(path, photo, { contentType: photo.type, upsert: false })
      if (upload.error) { setError(upload.error.message); setLoading(false); return }
      const imageUrl = supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
      await supabase.from('property_images').insert({ property_id: property.id, image_url: imageUrl, is_primary: true, display_order: 0 })
    }
    setStep('success'); setLoading(false)
  }

  if (step === 'start') return <main className="min-h-screen bg-[#f6f9fc] px-5 py-10 text-[#10233f]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">VerifiedRent Ghana</p><h1 className="mt-4 text-4xl font-black leading-tight">List your property free.</h1><p className="mt-4 text-lg text-slate-600">Put your home in front of renters across Ghana in under two minutes.</p><button onClick={() => setStep('signup')} className="mt-8 min-h-12 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-600/20">List Your Property Free</button><p className="mt-4 text-center text-sm font-semibold text-emerald-800">Join hundreds of verified landlords across Ghana.</p></div></main>

  if (step === 'signup') return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto max-w-md"><button onClick={() => setStep('start')} className="min-h-11 font-bold text-emerald-700">← Back</button><h1 className="mt-10 text-3xl font-black">Create your landlord account</h1><p className="mt-2 text-slate-600">No Ghana Card, payment, or email needed.</p><form onSubmit={createAccount} className="mt-8 grid gap-4"><input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" className="min-h-12 rounded-2xl border px-4 text-base" /><input required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone number (+233...)" className="min-h-12 rounded-2xl border px-4 text-base" /><input required minLength={6} type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Create a password" className="min-h-12 rounded-2xl border px-4 text-base" />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="min-h-12 rounded-2xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{loading ? 'Creating account…' : 'Continue to listing'}</button></form></div></main>

  if (step === 'listing') return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto max-w-md"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">Step 2 of 2</p><h1 className="mt-3 text-3xl font-black">Tell renters about your place</h1><p className="mt-2 text-slate-600">Your listing goes live immediately.</p><form onSubmit={publish} className="mt-7 grid gap-4"><input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="Property title" className="min-h-12 rounded-2xl border px-4 text-base" /><select value={form.type} onChange={e => update('type', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{propertyTypes.map(type => <option key={type}>{type}</option>)}</select><select value={form.region} onChange={e => update('region', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base">{regions.map(region => <option key={region}>{region}</option>)}</select><input required value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Neighborhood or city" className="min-h-12 rounded-2xl border px-4 text-base" /><input required min="0" type="number" value={form.rent} onChange={e => update('rent', e.target.value)} placeholder="Monthly rent in GHS" className="min-h-12 rounded-2xl border px-4 text-base" /><div className="grid grid-cols-2 gap-3"><input required min="0" type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} placeholder="Bedrooms" className="min-h-12 rounded-2xl border px-4 text-base" /><input required min="0" type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="Bathrooms" className="min-h-12 rounded-2xl border px-4 text-base" /></div><select value={form.furnished} onChange={e => update('furnished', e.target.value)} className="min-h-12 rounded-2xl border bg-white px-4 text-base"><option>No</option><option>Yes</option></select><label className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-center font-semibold text-emerald-800"><span className="block">Add one property photo</span><input required type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] ?? null)} className="mt-3 w-full text-sm" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="min-h-12 rounded-2xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{loading ? 'Publishing…' : 'Publish property free'}</button></form></div></main>

  return <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 text-[#10233f]"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div><h1 className="mt-6 text-3xl font-black">Your property is now live on VerifiedRent Ghana.</h1><p className="mt-4 text-slate-600">Complete verification to earn the Verified Landlord badge. Landlords with the badge get 3x more views.</p><button onClick={() => router.push('/explore')} className="mt-8 min-h-12 rounded-2xl bg-emerald-600 px-6 font-bold text-white">View Explore</button></div></main>
}
