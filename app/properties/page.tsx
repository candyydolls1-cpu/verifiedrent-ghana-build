import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { PropertyResults } from '@/components/property-results'

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ region?: string; city?: string; district?: string; type?: string; bedrooms?: string; bathrooms?: string; minRent?: string; maxRent?: string; price?: string; furnished?: string; verified?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  const region = regions?.find((item) => item.id === params.region || item.name.toLowerCase() === params.region?.toLowerCase())
  const regionId = region?.id ?? params.region
  let query = supabase.from('properties').select('id,title,description,rent_amount,bedrooms,is_furnished,furnishing_status,property_type,region_id,city_id,neighborhood,property_images(image_url,is_primary,display_order)').eq('status', 'published').order('created_at', { ascending: false })
  if (params.city) query = query.eq('city_id', params.city)
  else if (regionId) query = query.eq('region_id', regionId)
  if (params.district) query = query.eq('district_id', Number(params.district))
  if (params.type) query = query.eq('property_type', params.type)
  if (params.bedrooms) query = params.bedrooms === '4+' ? query.gte('bedrooms', 4) : query.eq('bedrooms', Number(params.bedrooms))
  if (params.bathrooms) query = params.bathrooms === '3+' ? query.gte('bathrooms', 3) : query.eq('bathrooms', Number(params.bathrooms))
  if (params.minRent) query = query.gte('rent_amount', Number(params.minRent))
  if (params.maxRent) query = query.lte('rent_amount', Number(params.maxRent))
  if (params.price === 'under-1000') query = query.lt('rent_amount', 1000)
  if (params.price === '1000-2500') query = query.gte('rent_amount', 1000).lte('rent_amount', 2500)
  if (params.price === '2500-plus') query = query.gt('rent_amount', 2500)
  if (params.furnished === 'true') query = query.eq('is_furnished', true)
  if (params.furnished === 'false') query = query.eq('is_furnished', false)
  if (params.verified === 'true') query = query.eq('is_verified_landlord', true)
  query = query.order('display_order', { foreignTable: 'property_images', ascending: true })
  const { data: properties, error } = await query
  const allRegions = regions?.length ? regions : ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'].map((name) => ({ id: name, name }))
  const regionNames = new Map(allRegions.map((item) => [item.id, item.name]))
  const listings = (properties ?? []).map((property) => ({ ...property, region_name: regionNames.get(property.region_id) ?? 'Ghana' }))
  return <PropertyResults properties={listings} regions={allRegions} region={region?.name ?? ''} type={params.type ?? ''} district={params.district ?? ''} />
}
