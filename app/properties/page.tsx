import { PropertyResults } from '@/components/property-results'
import { DistrictResults } from '@/components/district-results'
import { createClient } from '@/lib/supabase/server'

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ region?: string; district?: string; type?: string; price?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  let query = supabase.from('properties').select('id,title,description,property_type,rent_amount,rent_currency,rent_frequency,neighborhood,city_id,district_id,property_images(image_url,is_primary),regions(name),districts(name,capital_city),cities(name)').eq('status', 'published').order('created_at', { ascending: false })
  let selectedRegionName = ''
  if (params.region) {
    const byId = await supabase.from('regions').select('id,name').eq('id', params.region).maybeSingle()
    const selectedRegion = byId.data ?? (await supabase.from('regions').select('id,name').ilike('name', params.region).maybeSingle()).data
    if (selectedRegion) selectedRegionName = selectedRegion.name
  }
  if (params.region && !params.district) {
    const byId = await supabase.from('regions').select('id,name').eq('id', params.region).maybeSingle()
    const selectedRegion = byId.data ?? (await supabase.from('regions').select('id,name').ilike('name', params.region).maybeSingle()).data
    if (selectedRegion) {
      const { data: districts } = await supabase.from('districts').select('id,name,capital_city').eq('region_id', selectedRegion.id).order('name')
      return <DistrictResults region={selectedRegion.name} districts={districts ?? []} />
    }
  }
  if (params.region) {
    const byId = await supabase.from('regions').select('id,name').eq('id', params.region).maybeSingle()
    const selectedRegion = byId.data ?? (await supabase.from('regions').select('id,name').ilike('name', params.region).maybeSingle()).data
    if (selectedRegion) {
      query = query.eq('region_id', selectedRegion.id)
      selectedRegionName = selectedRegion.name
    } else {
      query = query.eq('region_id', params.region)
    }
  }
  if (params.district) query = query.eq('district_id', params.district)
  if (params.type) query = query.eq('property_type', params.type)
  if (params.price === 'under-1000') query = query.lt('rent_amount', 1000)
  if (params.price === '1000-2500') query = query.gte('rent_amount', 1000).lte('rent_amount', 2500)
  if (params.price === '2500-plus') query = query.gt('rent_amount', 2500)
  const { data } = await query
  return <PropertyResults properties={data ?? []} region={selectedRegionName || params.region || ''} type={params.type ?? ''} price={params.price ?? ''} />
}
