import { createClient } from '@/lib/supabase/server'
import { PropertyResults } from '@/components/property-results'
import { DistrictResults } from '@/components/district-results'

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ region?: string; city?: string; district?: string; type?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  const region = regions?.find((item) => item.id === params.region || item.name.toLowerCase() === params.region?.toLowerCase())
  if (region && !params.district && !params.city) { const { data: districts } = await supabase.from('districts').select('id,name,capital_city').eq('region_id', region.id).order('name'); return <DistrictResults regionId={region.id} region={region.name} districts={districts ?? []} /> }
  let query = supabase.from('properties').select('id,title,description,price,location,property_type,region_id,city_id,district_id,property_images(image_url,is_cover),regions(name),cities(name),districts(name,capital_city),property_likes(id)').eq('status', 'published').order('created_at', { ascending: false })
  if (params.city) query = query.eq('city_id', params.city)
  else if (region) query = query.eq('region_id', region.id)
  if (params.district) query = query.eq('district_id', Number(params.district))
  if (params.type) query = query.eq('property_type', params.type)
  const { data: properties } = await query
  return <PropertyResults properties={properties ?? []} region={region?.name ?? ''} type={params.type ?? ''} district={params.district ?? ''} />
}
