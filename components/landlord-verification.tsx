'use client'

import { useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Verification = { status: 'pending' | 'approved' | 'rejected' } | null

export function LandlordVerification({ userId, verification }: { userId: string; verification: Verification }) {
  const supabase = createClient()
  const [ghanaCard, setGhanaCard] = useState<File | null>(null)
  const [ownershipProof, setOwnershipProof] = useState<File | null>(null)
  const [current, setCurrent] = useState(verification)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ghanaCard || !ownershipProof) { setMessage('Upload both your Ghana Card and proof you own the house.'); return }
    setBusy(true)
    setMessage('')
    async function upload(file: File, label: string) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/${label}-${crypto.randomUUID()}.${extension}`
      const result = await supabase.storage.from('verification-docs').upload(path, file, { contentType: file.type, upsert: false })
      if (result.error) throw result.error
      return supabase.storage.from('verification-docs').getPublicUrl(path).data.publicUrl
    }
    try {
      const governmentIdUrl = await upload(ghanaCard, 'ghana-card')
      const ownershipProofUrl = await upload(ownershipProof, 'ownership-proof')
      const { data: saved, error } = await supabase.from('verification_applications').upsert({ landlord_id: userId, government_id_url: governmentIdUrl, ownership_proof_url: ownershipProofUrl, status: 'pending' }, { onConflict: 'landlord_id' }).select('status').single()
      if (error) throw error
      setCurrent(saved)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your verification documents could not be submitted.')
      setBusy(false)
      return
    }
    setGhanaCard(null)
    setOwnershipProof(null)
    setMessage('Your documents were submitted for review.')
    setBusy(false)
  }

  function chooseFile(setter: (file: File | null) => void, event: ChangeEvent<HTMLInputElement>) { setter(event.target.files?.[0] ?? null) }
  const status = current?.status ?? 'unverified'

  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="get-verified-heading"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Optional</p><h2 id="get-verified-heading" className="mt-1 text-2xl font-bold">Get verified</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Upload both documents. Our team will review them before showing a verified landlord badge.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold capitalize text-slate-700">{status}</span></div><form onSubmit={submit} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-semibold text-slate-700">Upload your Ghana Card<input required type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(setGhanaCard, event)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base" /></label><label className="flex-1 text-sm font-semibold text-slate-700">Upload proof you own the house (lease, deed, or utility bill in your name)<input required type="file" accept="image/*,.pdf" onChange={(event) => chooseFile(setOwnershipProof, event)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base" /></label><button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{busy ? 'Submitting...' : 'Submit for review'}</button></form>{(ghanaCard || ownershipProof) && <p className="mt-3 text-sm text-slate-500">Selected: {[ghanaCard?.name, ownershipProof?.name].filter(Boolean).join(' and ')}</p>}{message && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}</section>
}
