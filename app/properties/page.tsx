import { createClient } from '@/lib/supabase/server'
import { PropertyResults } from '@/components/property-results'

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ region?: string; city?: string; district?: string; type?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  const region = regions?.find((item) => item.id === params.region || item.name.toLowerCase() === params.region?.toLowerCase())
  const regionId = region?.id ?? params.region
  let query = supabase.from('properties').select('id,title,description,rent_amount,property_type,region_id,city_id,neighborhood,property_images!inner(image_url,is_primary,display_order)').eq('status', 'published').order('created_at', { ascending: false })
  if (params.city) query = query.eq('city_id', params.city)
  else if (regionId) query = query.eq('region_id', regionId)
  if (params.district) query = query.eq('district_id', Number(params.district))
  if (params.type) query = query.eq('property_type', params.type)
  query = query.eq('property_images.is_primary', true)
  const { data: properties, error } = await query
  return <PropertyResults properties={properties ?? []} region={region?.name ?? ''} type={params.type ?? ''} district={params.district ?? ''} />
}
