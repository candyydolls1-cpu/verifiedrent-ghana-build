'use client'

import { useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Verification = { status: 'pending' | 'approved' | 'rejected' } | null

type Profile = { full_legal_name: string | null; phone: string | null }

export function LandlordVerification({ userId, verification, profile }: { userId: string; verification: Verification; profile: Profile | null }) {
  const supabase = createClient()
  const [ghanaCard, setGhanaCard] = useState<File | null>(null)
  const [ownershipProof, setOwnershipProof] = useState<File | null>(null)
  const [current, setCurrent] = useState(verification)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [fullLegalName, setFullLegalName] = useState(profile?.full_legal_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullLegalName.trim()) { setMessage('Full legal name is required.'); return }
    if (!phone.trim()) { setMessage('Phone number is required.'); return }
    if (!ghanaCard || !ownershipProof) { setMessage('Upload both your Ghana Card and proof you own the house.'); return }
    setBusy(true)
    setMessage('')
    async function upload(file: File, label: string) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/${label}-${crypto.randomUUID()}.${extension}`
      try {
        const result = await supabase.storage.from('verification-docs').upload(path, file, { contentType: file.type, upsert: false })
        if (result.error) throw result.error
        return path
      } catch (error) {
        throw new Error(`Uploading ${label} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    const governmentIdUrl = await upload(ghanaCard, 'ghana-card').catch((error) => { setMessage(error instanceof Error ? error.message : String(error)); setBusy(false); return null })
    if (!governmentIdUrl) return
    const ownershipProofUrl = await upload(ownershipProof, 'ownership-proof').catch((error) => { setMessage(error instanceof Error ? error.message : String(error)); setBusy(false); return null })
    if (!ownershipProofUrl) return
    let application: { id: string; status: 'pending' | 'approved' | 'rejected' }
    try {
      const result = await supabase.from('verification_applications').insert({ landlord_id: userId, full_legal_name: fullLegalName.trim(), phone: phone.trim() }).select('id,status').single()
      if (result.error || !result.data) throw result.error ?? new Error('No application was returned.')
      application = result.data
    } catch (error) {
      setMessage(`Creating application failed: ${error instanceof Error ? error.message : String(error)}`)
      setBusy(false)
      return
    }
    for (const document of [{ document_type: 'ghana_card', file_url: governmentIdUrl }, { document_type: 'ownership_proof', file_url: ownershipProofUrl }]) {
      try {
        const result = await supabase.from('verification_documents').insert({ application_id: application.id, ...document })
        if (result.error) throw result.error
      } catch (error) {
        setMessage(`Saving ${document.document_type} failed: ${error instanceof Error ? error.message : String(error)}`)
        setBusy(false)
        return
      }
    }
    setCurrent({ status: application.status })
    setGhanaCard(null)
    setOwnershipProof(null)
    setMessage('Your documents were submitted for review.')
    setBusy(false)
  }

  function chooseFile(setter: (file: File | null) => void, event: ChangeEvent<HTMLInputElement>) { setter(event.target.files?.[0] ?? null) }
  const status = current?.status ?? 'unverified'

  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="get-verified-heading"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Optional</p><h2 id="get-verified-heading" className="mt-1 text-2xl font-bold">Get verified</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Upload both documents. Our team will review them before showing a verified landlord badge.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold capitalize text-slate-700">{status}</span></div><form onSubmit={submit} className="mt-6 flex flex-col gap-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Full legal name<input required value={fullLegalName} onChange={(event) => setFullLegalName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base" /></label><label className="text-sm font-semibold text-slate-700">Phone number<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base" /></label></div><div className="flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-semibold text-slate-700">Upload your Ghana Card<input required type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(setGhanaCard, event)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base" /></label><label className="flex-1 text-sm font-semibold text-slate-700">Upload proof you own the house (lease, deed, or utility bill in your name)<input required type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(setOwnershipProof, event)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base" /></label><button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{busy ? 'Submitting...' : 'Submit for review'}</button></div></form>{(ghanaCard || ownershipProof) && <p className="mt-3 text-sm text-slate-500">Selected: {[ghanaCard?.name, ownershipProof?.name].filter(Boolean).join(' and ')}</p>}{message && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{message}</p>}</section>
}
