import { VerifiedRentLanding } from '@/components/verified-rent-landing'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  const fallbackRegions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'].map((name) => ({ id: name, name }))
  return <VerifiedRentLanding regions={regions?.length ? regions : fallbackRegions} />
}

