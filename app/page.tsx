import { VerifiedRentLanding } from '@/components/verified-rent-landing'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  const fallbackRegions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'].map((name) => ({ id: name, name }))
  const { data: properties } = await supabase.from('properties').select('id,title,rent_amount,bedrooms,is_verified_landlord,region_id,property_images(image_url,is_primary,display_order)').eq('status', 'published').order('created_at', { ascending: false }).limit(6)
  const regionNames = new Map((regions?.length ? regions : fallbackRegions).map((region) => [region.id, region.name]))
  const featured = (properties ?? []).map((property) => ({ ...property, region_name: regionNames.get(property.region_id) ?? 'Ghana' }))
  return <VerifiedRentLanding regions={regions?.length ? regions : fallbackRegions} featuredProperties={featured} />
}

