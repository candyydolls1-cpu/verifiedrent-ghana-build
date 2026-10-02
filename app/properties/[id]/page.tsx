import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyDetail } from '@/components/property-detail'

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: property } = await supabase.from('properties').select('id,title,description,property_type,neighborhood,approximate_location,rent_amount,rent_currency,rent_frequency,bedrooms,bathrooms,landlord_id,is_verified_landlord,property_images(image_url,is_primary),property_amenities(amenity),landlord_profiles!properties_landlord_id_fkey(full_legal_name,profile_photo_url,verification_status)').eq('id', id).eq('status', 'published').maybeSingle()
  if (!property) notFound()
  return <PropertyDetail property={property} userId={user.id} />
}
