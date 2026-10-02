import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin-dashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('role,full_name,display_name').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect('/dashboard')
  const [{ data: applications }, { data: reports }, { data: listings }, { data: audit }] = await Promise.all([
    supabase.from('verification_applications').select('id,landlord_id,legal_name,status,submitted_at,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('fraud_reports').select('id,property_id,reporter_id,category,details,status,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('properties').select('id,title,status,is_verified_landlord,created_at,landlord_id,regions(name),cities(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('admin_audit_logs').select('id,admin_id,action,entity_type,entity_id,created_at').order('created_at', { ascending: false }).limit(50),
  ])
  return <AdminDashboard adminId={user.id} applications={applications ?? []} reports={reports ?? []} listings={listings ?? []} audit={audit ?? []} />
}
