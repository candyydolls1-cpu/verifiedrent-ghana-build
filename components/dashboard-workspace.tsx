'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = { user: { id: string; email?: string }; profile: any; verified?: boolean; properties: any[]; applications: any[]; notifications: any[]; inquiries: any[] }

export function DashboardWorkspace({ user, profile, verified = false, properties, applications, notifications, inquiries }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const role = profile?.role === 'landlord' ? 'landlord' : 'tenant'
  const [tab, setTab] = useState('Overview')
  const [nameValue, setNameValue] = useState(profile?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [notice, setNotice] = useState('')
  const tabs = ['Overview', ...(role === 'landlord' ? ['Tenant inquiries'] : ['Saved homes', 'Applications']), 'Notifications']

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSavingName(true); setNotice('')
    const { error } = await supabase.from('profiles').update({ full_name: nameValue.trim() || null }).eq('id', user.id)
    setSavingName(false); setNotice(error ? error.message : 'Your name has been saved.'); if (!error) router.refresh()
  }
  async function signOut() { await supabase.auth.signOut(); router.push('/auth') }

  return <main className={`${role === 'tenant' ? 'min-h-screen ' : ''}bg-[#f7fafc] text-[#1B2A4A]`}><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">VerifiedRent Ghana</p><h1 className="mt-1 text-xl font-bold">{role === 'landlord' ? 'Landlord workspace' : 'Tenant workspace'}</h1></div><button onClick={signOut} className="rounded-lg border px-4 py-2 text-sm font-semibold">Sign out</button></div></header><div className="mx-auto flex max-w-7xl gap-8 px-6 py-8"><aside className="hidden w-56 shrink-0 flex-col gap-2 md:flex">{tabs.map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${tab === item ? 'bg-[#1B2A4A] text-white' : 'text-slate-500 hover:bg-white'}`}>{item}</button>)}</aside><section className="min-w-0 flex-1"><div className="mb-8 flex items-end justify-between"><div><p className="text-slate-500">Good to see you,</p>{profile?.full_name ? <h2 className="flex items-center gap-2 text-3xl font-bold">{profile.full_name}{verified && <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white" aria-label="Verified landlord">✓</span>}</h2> : <form onSubmit={saveName} className="mt-2 flex max-w-md gap-2"><input required value={nameValue} onChange={event => setNameValue(event.target.value)} placeholder="Add your name" className="min-h-11 min-w-0 flex-1 rounded-xl border px-3 text-base" /><button disabled={savingName} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white">{savingName ? 'Saving...' : 'Save'}</button></form>}</div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{role}</span></div>{notice && <p role="status" className="mb-4 text-sm font-semibold text-slate-600">{notice}</p>}{tab === 'Overview' && <div className="grid gap-5 md:grid-cols-3"><Stat label={role === 'landlord' ? 'Your properties' : 'Saved homes'} value={role === 'landlord' ? properties.length : 0} /><Stat label="Notifications" value={notifications.length} /><Stat label="Applications" value={applications.length} /></div>}{tab === 'Tenant inquiries' && <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Tenant inquiries</h2>{inquiries.length ? <div className="mt-5 grid gap-3">{inquiries.map(item => <article key={item.id} className="rounded-xl border p-4"><p className="font-semibold">{item.message ?? item.subject ?? 'New inquiry'}</p></article>)}</div> : <p className="mt-3 text-slate-500">No tenant messages yet.</p>}</section>}{tab === 'Notifications' && <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Notifications</h2>{notifications.length ? notifications.map(item => <p key={item.id} className="mt-3 text-slate-600">{item.message ?? item.title ?? 'Notification'}</p>) : <p className="mt-3 text-slate-500">You are all caught up.</p>}</section>}</section></div></main>
}
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div> }
