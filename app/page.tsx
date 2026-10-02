import { VerifiedRentLanding } from '@/components/verified-rent-landing'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: regions } = await supabase.from('regions').select('id,name').order('name')
  return <VerifiedRentLanding regions={regions ?? []} />
}

