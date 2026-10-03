import ExploreFeed from '@/components/explore-feed'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id,title,rent_amount,property_type,region_id,city_id,created_at,cities(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return <ExploreFeed properties={(properties ?? []).map((property) => ({ ...property, price: property.rent_amount }))} loadError={error?.message} />
}
