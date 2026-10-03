import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyDetail } from '@/components/property-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: property, error } = await supabase.from('properties').select('*, property_images(image_url,is_primary,display_order)').eq('id', id).eq('status', 'published').maybeSingle()
  if (error || !property) notFound()
  const [{ data: landlord }, { count: listingCount }, { data: contact }, { data: region }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', property.landlord_id).maybeSingle(),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('landlord_id', property.landlord_id).eq('status', 'published'),
    supabase.from('landlord_profiles').select('phone,whatsapp').eq('user_id', property.landlord_id).maybeSingle(),
    supabase.from('regions').select('name').eq('id', property.region_id).maybeSingle(),
  ])
  return <PropertyDetail property={{ ...property, region_name: region?.name }} landlord={landlord} contact={contact} listingCount={listingCount ?? 0} />
}
