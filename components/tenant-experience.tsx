'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Property = {
  id: string
  title: string
  description: string | null
  property_type: string
  neighborhood: string | null
  approximate_location: string | null
  rent_amount: number
  rent_currency: string | null
  rent_frequency: string | null
  bedrooms: number | null
  bathrooms: number | null
  city_id: string | null
  region_id: string
  landlord_id: string
  is_verified_landlord: boolean | null
  property_images?: { image_url: string; is_primary: boolean | null }[]
  regions?: { name: string } | null
  cities?: { name: string } | null
}

type Lookup = { id: string; name: string }

export function TenantExperience({ userId, firstName, greeting, properties, regions, cities }: { userId: string; firstName: string; greeting: string; properties: Property[]; regions: Lookup[]; cities: Lookup[] }) {
  const supabase = createClient()
  const [filters, setFilters] = useState({ region: '', city: '', type: '', min: '', max: '', bedrooms: '' })
  const [saved, setSaved] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const visible = useMemo(() => properties.filter((property) => {
    const rent = property.rent_amount
    return (!filters.region || property.region_id === filters.region) && (!filters.city || property.city_id === filters.city) && (!filters.type || property.property_type === filters.type) && (!filters.min || rent >= Number(filters.min)) && (!filters.max || rent <= Number(filters.max)) && (!filters.bedrooms || (property.bedrooms ?? 0) >= Number(filters.bedrooms))
  }), [filters, properties])

  async function toggleSaved(propertyId: string) {
    setNotice('')
    if (saved.includes(propertyId)) {
      const { error } = await supabase.from('saved_properties').delete().eq('user_id', userId).eq('property_id', propertyId)
      if (!error) setSaved(saved.filter((id) => id !== propertyId))
      else setNotice('Could not remove this saved property.')
      return
    }
    const { error } = await supabase.from('saved_properties').insert({ user_id: userId, property_id: propertyId })
    if (!error) setSaved([...saved, propertyId])
    else setNotice('Could not save this property. It may already be saved.')
  }

  return <section className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Your home search</p><h2 className="mt-2 text-3xl font-bold">{greeting}, {firstName}.</h2><p className="mt-2 text-slate-500">Find a home you can trust, and connect directly with landlords.</p></div><div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-6"><select aria-label="Region" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value, city: '' })} className="rounded-xl border p-3 text-sm"><option value="">All regions</option>{regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="">All cities</option>{cities.filter((item) => !filters.region || properties.some((property) => property.city_id === item.id && property.region_id === filters.region)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Property type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="">Any type</option>{[...new Set(properties.map((property) => property.property_type))].map((type) => <option key={type} value={type}>{type}</option>)}</select><input aria-label="Minimum rent" inputMode="numeric" placeholder="Min rent" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} className="rounded-xl border p-3 text-sm" /><input aria-label="Maximum rent" inputMode="numeric" placeholder="Max rent" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} className="rounded-xl border p-3 text-sm" /><select aria-label="Bedrooms" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })} className="rounded-xl border p-3 text-sm"><option value="">Bedrooms</option>{[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}+ beds</option>)}</select></div>{notice && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((property) => { const image = property.property_images?.find((item) => item.is_primary)?.image_url ?? property.property_images?.[0]?.image_url; return <article key={property.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-44 bg-slate-100">{image && <img src={image} alt={property.title} className="h-full w-full object-cover" />}</div><div className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{property.title}</h3><p className="text-sm text-slate-500">{property.cities?.name ?? property.neighborhood ?? 'Ghana'}</p></div>{property.is_verified_landlord && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Verified landlord</span>}</div><p className="text-lg font-bold">{property.rent_currency ?? 'GHS'} {property.rent_amount.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ {property.rent_frequency ?? 'month'}</span></p><p className="text-sm text-slate-500">{property.bedrooms ?? 0} beds · {property.bathrooms ?? 0} baths · {property.property_type}</p><div className="flex gap-2"><Link href={`/properties/${property.id}`} className="flex-1 rounded-xl bg-[#1B2A4A] px-4 py-2.5 text-center text-sm font-semibold text-white">View details</Link><button aria-label={`Save ${property.title}`} onClick={() => toggleSaved(property.id)} className={`rounded-xl border px-3 ${saved.includes(property.id) ? 'border-emerald-600 text-emerald-700' : ''}`}>{saved.includes(property.id) ? 'Saved' : 'Save'}</button></div></div></article>})}</div>{visible.length === 0 && <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">No published properties match these filters.</div>}</section>
}

export async function submitTenantAction(userId: string, propertyId: string, landlordId: string, message: string, category?: string, details?: string) {
  const supabase = createClient()
  if (category) return supabase.from('fraud_reports').insert({ reporter_id: userId, property_id: propertyId, landlord_id: landlordId, category, details })
  return supabase.from('inquiries').insert({ sender_id: userId, property_id: propertyId, landlord_id: landlordId, message })
}
