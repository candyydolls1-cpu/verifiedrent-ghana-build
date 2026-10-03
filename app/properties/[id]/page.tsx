import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyDetail } from '@/components/property-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: property, error } = await supabase
    .from('properties')
    .select('id,title,description,rent_amount,bedrooms,bathrooms,furnishing_status,property_type,neighborhood,landlord_id,is_verified_landlord,property_images(image_url,is_primary,display_order)')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !property) notFound()
  const { data: landlord } = await supabase.from('profiles').select('full_name').eq('id', property.landlord_id).maybeSingle()
  return <PropertyDetail property={property} landlord={landlord} />
}
