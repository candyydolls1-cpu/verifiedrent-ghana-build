'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
type Verification = { status: 'pending' | 'submitted' | 'approved' | 'rejected'; created_at?: string; submitted_at?: string; reviewed_at?: string; expires_at?: string } | null

type Profile = { full_legal_name?: string | null; full_name?: string | null; phone: string | null; verification_status?: string | null; verification_expires_at?: string | null }

export function LandlordVerification({ userId, verification, profile }: { userId: string; verification: Verification; profile: Profile | null }) {
  const supabase = createClient()
  const [current, setCurrent] = useState(verification)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [ghanaCard, setGhanaCard] = useState<File | null>(null)
  const [ownershipProof, setOwnershipProof] = useState<File | null>(null)
  const [fullLegalName, setFullLegalName] = useState((profile?.full_legal_name || profile?.full_name || '').trim())
  const [phone, setPhone] = useState(profile?.phone || '')
  const [existingChecked, setExistingChecked] = useState(false)

  useEffect(() => { let active = true; void supabase.from('verification_applications').select('id,status,created_at,submitted_at,reviewed_at,expires_at').eq('landlord_id', userId).in('status', ['submitted', 'pending', 'approved']).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => { if (active) { if (data) setCurrent(data); setExistingChecked(true) } }); return () => { active = false } }, [userId])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage('')
    if (current?.status === 'submitted' || current?.status === 'pending' || profile?.verification_status === 'approved') { setMessage('Your documents are under review.'); return }
    if (!fullLegalName.trim() || !phone.trim()) { setMessage('Full legal name and phone number are required.'); return }
    if (!ghanaCard || !ownershipProof) { setMessage('Upload both your Ghana Card and proof you own the house.'); return }
    setBusy(true)
    const { data: activeApplication } = await supabase.from('verification_applications').select('id,status').eq('landlord_id', userId).in('status', ['submitted', 'pending']).limit(1).maybeSingle()
    if (activeApplication) { setCurrent(activeApplication as Verification); setMessage('Your documents are under review.'); setBusy(false); return }
    async function upload(file: File, label: string) { const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'; const path = `${userId}/${label}-${crypto.randomUUID()}.${extension}`; const result = await supabase.storage.from('verification-docs').upload(path, file, { contentType: file.type, upsert: false }); if (result.error) throw result.error; return path }
    try {
      const governmentIdUrl = await upload(ghanaCard, 'ghana-card'); const ownershipProofUrl = await upload(ownershipProof, 'ownership-proof')
      const { data: application, error } = await supabase.from('verification_applications').insert({ landlord_id: userId, full_legal_name: fullLegalName.trim(), phone: phone.trim(), status: 'submitted' }).select('id,status,created_at,submitted_at').single()
      if (error || !application) throw error ?? new Error('Application was not returned.')
      const documents = [{ application_id: application.id, document_type: 'ghana_card', file_url: governmentIdUrl }, { application_id: application.id, document_type: 'ownership_proof', file_url: ownershipProofUrl }]
      const documentResult = await supabase.from('verification_documents').insert(documents)
      if (documentResult.error) throw documentResult.error
      setCurrent(application); setGhanaCard(null); setOwnershipProof(null); setMessage('Your documents were submitted for review.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'We could not submit your documents. Please try again.') } finally { setBusy(false) }
  }
  function chooseFile(setter: (file: File | null) => void, event: ChangeEvent<HTMLInputElement>) { setter(event.target.files?.[0] ?? null) }
  const expiry = current?.expires_at || profile?.verification_expires_at
  const date = current?.submitted_at || current?.created_at
  const reviewedDate = current?.reviewed_at
  if (!existingChecked) return null
  if (profile?.verification_status === 'approved') return <section className="mt-4 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm"><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">Verified landlord</span><p className="mt-3 text-sm text-slate-600">Identity and documents reviewed by VerifiedRent</p>{reviewedDate && <p className="mt-2 text-sm text-slate-500">Verified {new Date(reviewedDate).toLocaleDateString()}</p>}{expiry && <p className="mt-1 text-sm text-slate-500">Valid until {new Date(expiry).toLocaleDateString()}</p>}</section>
  if (current?.status === 'submitted' || current?.status === 'pending') return <section className="mt-4 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">Under review</span><p className="mt-3 text-sm text-slate-600">Your documents are under review.</p>{date && <p className="mt-2 text-sm text-slate-500">Submitted {new Date(date).toLocaleDateString()}</p>}{expiry && <p className="mt-1 text-sm text-slate-500">Valid until {new Date(expiry).toLocaleDateString()}</p>}</section>
  return <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Identity verification</p><h2 className="mt-1 text-2xl font-bold">Get Verified</h2><p className="mt-2 text-sm text-slate-600">Upload both documents for review by VerifiedRent.</p><form onSubmit={submit} className="mt-6 flex flex-col gap-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Full legal name<input required value={fullLegalName} onChange={event => setFullLegalName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base" /></label><label className="text-sm font-semibold text-slate-700">Phone number<input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base" /></label></div><label className="text-sm font-semibold text-slate-700">Upload your Ghana Card<input required type="file" accept="image/*,.pdf" onChange={event => chooseFile(setGhanaCard, event)} className="mt-2 block min-h-12 w-full rounded-xl border p-3 text-base" /></label><label className="text-sm font-semibold text-slate-700">Upload proof you own the house<input required type="file" accept="image/*,.pdf" onChange={event => chooseFile(setOwnershipProof, event)} className="mt-2 block min-h-12 w-full rounded-xl border p-3 text-base" /></label>{message && <p role="status" className="text-sm font-semibold text-slate-600">{message}</p>}<button disabled={busy} className="min-h-12 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting...' : 'Submit documents'}</button></form></section>
}
