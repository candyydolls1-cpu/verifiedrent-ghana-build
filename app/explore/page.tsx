import ExploreFeed from '@/components/explore-feed'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ExplorePage() {
  const supabase = await createClient()
  const [{ data: properties, error }, { data: videos }, { data: likes }] = await Promise.all([
    supabase
      .from('properties')
      .select('id,title,rent_amount,view_count,landlord_id,property_type,region_id,city_id,is_verified_landlord,created_at,cities(name),property_images(image_url,is_primary,display_order)')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase.from('property_videos').select('id,title,video_url,view_count,created_at').eq('property_type', 'tour').order('created_at', { ascending: false }),
    supabase.from('property_likes').select('property_id'),
  ])

  const landlordIds = [...new Set((properties ?? []).map((property) => property.landlord_id).filter(Boolean))]
  const { data: landlordProfiles } = landlordIds.length ? await supabase.from('landlord_profiles').select('user_id,full_name,full_legal_name').in('user_id', landlordIds) : { data: [] }
  const landlordNames = new Map((landlordProfiles ?? []).map((profile) => [profile.user_id, profile.full_name?.trim() || profile.full_legal_name?.trim() || null]))
  const listings = (properties ?? []).map((property) => {
    const images = Array.isArray(property.property_images) ? property.property_images : []
    const primaryImage = [...images].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.display_order ?? 0) - (b.display_order ?? 0))[0]?.image_url ?? null
    return { ...property, primary_image_url: primaryImage, landlord_name: landlordNames.get(property.landlord_id) ?? null, price: property.rent_amount }
  })

  const likeCounts = (likes ?? []).reduce<Record<string, number>>((counts, like) => { counts[like.property_id] = (counts[like.property_id] ?? 0) + 1; return counts }, {})
  return <ExploreFeed properties={listings} videos={videos ?? []} likeCounts={likeCounts} loadError={error?.message} />
}
