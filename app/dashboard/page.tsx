import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardWorkspace } from '@/components/dashboard-workspace'
import { LandlordFeed } from '@/components/landlord-feed'
import { TenantExperience } from '@/components/tenant-experience'
import { TenantFeedEngagement } from '@/components/tenant-feed-engagement'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('full_name,display_name,email,role').eq('id', user.id).maybeSingle()
  const metadataName = String(user.user_metadata?.full_name ?? '').trim()
  const profileName = profile?.display_name?.trim() || profile?.full_name?.trim() || metadataName
  if (profile?.role === 'tenant' || user.user_metadata?.role === 'tenant') {
    const tenantFirstName = profileName.split(/\s+/)[0] || 'there'
    const firstName = tenantFirstName
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const [{ data: properties }, { data: regions }, { data: cities }] = await Promise.all([
      supabase.from('properties').select('id,title,description,property_type,neighborhood,approximate_location,rent_amount,rent_currency,rent_frequency,bedrooms,bathrooms,city_id,region_id,landlord_id,is_verified_landlord,property_images(image_url,is_primary),landlord_profiles(phone,preferred_contact,email),regions(name),cities(name)').eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('regions').select('id,name').order('name'),
      supabase.from('cities').select('id,name').order('name'),
    ])
    return <main className="min-h-screen bg-[#f7fafc] px-6 py-10 text-[#1B2A4A]"><div className="mx-auto max-w-7xl"><TenantExperience userId={user.id} firstName={firstName} greeting={greeting} properties={properties ?? []} regions={regions ?? []} cities={cities ?? []} /><TenantFeedEngagement userId={user.id} properties={properties ?? []} /></div></main>
  }
  const [{ data: properties }, { data: applications }, { data: notifications }, { data: inquiries }, { data: regions }, { data: cities }, { data: viewed }, { data: liked }, { data: inquiryEvents }] = await Promise.all([supabase.from('properties').select('id,title,description,property_type,region_id,district_id,city_id,neighborhood,approximate_location,rent_amount,bedrooms,bathrooms,status,property_images(image_url,is_primary),property_likes(id),reviews(id,rating,feedback)').eq('landlord_id', user.id).order('created_at', { ascending: false }).limit(20), supabase.from('verification_applications').select('id,status,submitted_at,created_at').eq('landlord_id', user.id).order('created_at', { ascending: false }).limit(5), supabase.from('notifications').select('id,title,message,is_read,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5), supabase.from('inquiries').select('id,message,created_at,sender_id,property_id,properties(title),profiles:sender_id(full_name,display_name,email)').eq('landlord_id', user.id).order('created_at', { ascending: false }).limit(20), supabase.from('regions').select('id,name').order('name'), supabase.from('cities').select('id,name').order('name'), supabase.from('recently_viewed_properties').select('property_id').in('property_id', (await supabase.from('properties').select('id').eq('landlord_id', user.id)).data?.map((item) => item.id) ?? []), supabase.from('property_likes').select('property_id').in('property_id', (await supabase.from('properties').select('id').eq('landlord_id', user.id)).data?.map((item) => item.id) ?? []), supabase.from('inquiries').select('property_id').eq('landlord_id', user.id)])
  const analytics = (properties ?? []).reduce<Record<string, { views: number; likes: number; inquiries: number }>>((result, property) => { result[property.id] = { views: (viewed ?? []).filter((item) => item.property_id === property.id).length, likes: (liked ?? []).filter((item) => item.property_id === property.id).length, inquiries: (inquiryEvents ?? []).filter((item) => item.property_id === property.id).length }; return result }, {})
  const analyticsByType = (properties ?? []).reduce<Record<string, { views: number; likes: number; inquiries: number }>>((result, property) => { const current = result[property.property_type] ?? { views: 0, likes: 0, inquiries: 0 }; const metric = analytics[property.id]; result[property.property_type] = { views: current.views + metric.views, likes: current.likes + metric.likes, inquiries: current.inquiries + metric.inquiries }; return result }, {})
  return <><DashboardWorkspace user={user} profile={profile} properties={properties ?? []} applications={applications ?? []} notifications={notifications ?? []} inquiries={inquiries ?? []} /><div className="mx-auto max-w-7xl px-6 pb-12"><LandlordFeed userId={user.id} properties={properties ?? []} regions={regions ?? []} analytics={analytics} analyticsByType={analyticsByType} /></div></>
}
