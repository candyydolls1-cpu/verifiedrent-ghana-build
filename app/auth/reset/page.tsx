'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PasswordResetPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    void supabase.auth.getSession().then(({ data: session }) => setReady(Boolean(session.session)))
    return () => data.subscription.unsubscribe()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return }
    if (password !== confirmation) { setMessage('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await createClient().auth.updateUser({ password })
    setMessage(error ? error.message : 'Your password has been updated.')
    setLoading(false)
    if (!error) setTimeout(() => router.replace('/auth'), 800)
  }

  return <main className="grid min-h-screen place-items-center bg-[#f6f9fc] px-6 py-10 text-[#1B2A4A]"><section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold">Reset your password</h1><p className="mt-2 text-slate-500">Choose a new password for your account.</p>{!ready ? <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Open this page from the password reset email.</p> : <form onSubmit={submit} className="mt-6 grid gap-4"><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" autoComplete="new-password" className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-500" /><input required minLength={6} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-500" /><button disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">{loading ? 'Updating…' : 'Update password'}</button></form>}{message && <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p>}</section></main>
}
