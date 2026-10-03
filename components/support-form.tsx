'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
const initialForm: FormState = { name: '', email: '', phone: '', subject: '', message: '' }

export function SupportForm() {
  const supabase = createClient()
  const [form, setForm] = useState<FormState>(initialForm)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setNotice('')
    const { error } = await supabase.from('support_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    })
    setSubmitting(false)
    if (error) {
      setNotice('Something went wrong. Please try again.')
      return
    }
    setForm(initialForm)
    setNotice("Your request has been sent. We'll respond as soon as possible.")
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" className="min-h-12 w-full rounded-xl border p-3 text-base" />
      <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" className="min-h-12 w-full rounded-xl border p-3 text-base" />
      <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone - optional" aria-label="Phone - optional" className="min-h-12 w-full rounded-xl border p-3 text-base" />
      <input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="min-h-12 w-full rounded-xl border p-3 text-base" />
      <textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="How can we help?" className="min-h-36 w-full rounded-xl border p-3 text-base" />
      <button disabled={submitting} className="min-h-12 w-full rounded-xl bg-[#10B981] px-4 py-3 font-bold text-white disabled:opacity-60">{submitting ? 'Sending…' : 'Send support request'}</button>
      {notice && <p role="status" className="text-sm font-semibold text-emerald-700">{notice}</p>}
    </form>
  )
}
