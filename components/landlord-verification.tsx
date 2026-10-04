'use client'

import { useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Verification = { document_url: string; status: 'pending' | 'approved' | 'rejected' } | null

export function LandlordVerification({ userId, verification }: { userId: string; verification: Verification }) {
  const supabase = createClient()
  const [file, setFile] = useState<File | null>(null)
  const [current, setCurrent] = useState(verification)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) { setMessage('Choose a government ID or proof of property ownership.'); return }
    setBusy(true)
    setMessage('')
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `verifications/${userId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('verification-docs').upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) { setMessage(uploadError.message); setBusy(false); return }
    const { data: url } = supabase.storage.from('verification-docs').getPublicUrl(path)
    const { data: saved, error } = await supabase.from('landlord_verifications').upsert({ user_id: userId, document_url: url.publicUrl, status: 'pending' }, { onConflict: 'user_id' }).select('document_url,status').single()
    if (error) { setMessage(error.message); setBusy(false); return }
    setCurrent(saved)
    setFile(null)
    setMessage('Your document was submitted for review.')
    setBusy(false)
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) { setFile(event.target.files?.[0] ?? null) }
  const status = current?.status ?? 'unverified'

  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="get-verified-heading"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Optional</p><h2 id="get-verified-heading" className="mt-1 text-2xl font-bold">Get verified</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Upload a government ID or proof of property ownership. Our team will review it before showing a verified landlord badge.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold capitalize text-slate-700">{status}</span></div><form onSubmit={submit} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-semibold text-slate-700">Verification document<input type="file" accept="image/*,.pdf" onChange={chooseFile} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base" /></label><button type="submit" disabled={busy} className="min-h-12 rounded-xl bg-emerald-600 px-5 font-bold text-white disabled:opacity-60">{busy ? 'Submitting...' : 'Submit for review'}</button></form>{file && <p className="mt-3 text-sm text-slate-500">Selected: {file.name}</p>}{message && <p role="status" className="mt-3 text-sm font-semibold text-slate-700">{message}</p>}</section>
}
