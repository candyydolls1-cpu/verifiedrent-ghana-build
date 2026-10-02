'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function messageForAuthError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials') || normalized.includes('invalid email or password')) return 'Invalid email or password.'
  if (normalized.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (normalized.includes('already registered') || normalized.includes('user already registered')) return 'An account with this email already exists. Try signing in.'
  if (normalized.includes('password')) return 'Use a password with at least 6 characters.'
  if (normalized.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.'
  return 'We could not complete that request. Please check your details and try again.'
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error')
    if (error === 'confirmation_failed') setMessage('That confirmation link is invalid or has expired. Request a new confirmation email.')
    if (error === 'missing_confirmation_code') setMessage('That confirmation link is incomplete. Request a new confirmation email.')
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim(), role },
        },
      })
      if (error) {
        setLoading(false)
        setMessage(messageForAuthError(error.message))
        return
      }

      let session = data.session
      let user = data.user

      if (!session) {
        const fallback = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        session = fallback.data.session
        user = fallback.data.user
        if (fallback.error || !session || !user) {
          setLoading(false)
          setMessage('We could not complete account setup. Please try again.')
          return
        }
      }

      setLoading(false)
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: name.trim() || null,
        display_name: name.trim() ? name.trim().split(/\s+/)[0] : null,
        role,
      }, { onConflict: 'id' })

      router.replace('/dashboard')
      router.refresh()
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setMessage(messageForAuthError(error.message))
      return
    }
    if (!data.session) {
      setMessage('Sign-in completed without a session. Please try again.')
      return
    }

    const profileName = String(data.user.user_metadata?.full_name ?? '').trim()
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: profileName || null,
      display_name: profileName ? profileName.split(/\s+/)[0] : null,
      role: data.user.user_metadata?.role === 'landlord' ? 'landlord' : 'tenant',
    }, { onConflict: 'id' })

    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-6 py-10 text-[#1B2A4A]">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <section className="bg-[#1B2A4A] p-10 text-white lg:p-14">
          <div className="flex items-center gap-3">
            <img src="/verifiedrent-logo.png" alt="VerifiedRent Ghana logo" className="size-12 rounded-2xl bg-white p-2 object-contain" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">VerifiedRent Ghana</p>
          </div>
          <h1 className="mt-20 text-4xl font-bold leading-tight">Rent with more confidence.</h1>
          <p className="mt-5 max-w-sm text-slate-300">Secure accounts, verified landlords, and trusted homes across Ghana.</p>
        </section>
        <section className="p-8 lg:p-14">
          <div className="mb-8 flex items-center gap-3">
            <img src="/verifiedrent-logo.png" alt="VerifiedRent Ghana logo" className="size-10 rounded-xl bg-emerald-50 p-2 object-contain" />
            <span className="font-bold tracking-tight text-[#1B2A4A]">VerifiedRent Ghana</span>
          </div>
          <div className="mb-8 flex gap-2 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => { setMode('signin'); setMessage('') }} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${mode === 'signin' ? 'bg-white shadow' : 'text-slate-500'}`}>Sign in</button>
            <button type="button" onClick={() => { setMode('signup'); setMessage('') }} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white shadow' : 'text-slate-500'}`}>Create account</button>
          </div>
          <h2 className="text-3xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-2 text-slate-500">{mode === 'signin' ? 'Access your rental workspace.' : 'Choose how you will use VerifiedRent.'}</p>
          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            {mode === 'signup' && <input required value={name} onChange={event => setName(event.target.value)} placeholder="Full name" autoComplete="name" className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-500" />}
            {mode === 'signup' && <div className="grid grid-cols-2 gap-2">{(['tenant', 'landlord'] as const).map(item => <button type="button" key={item} onClick={() => setRole(item)} className={`rounded-xl border px-4 py-3 capitalize ${role === item ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}>{item}</button>)}</div>}
            <input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your Gmail address" autoComplete="off" autoCapitalize="none" spellCheck={false} inputMode="email" className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-500" />
            <input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password (6+ characters)" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} className="rounded-xl border px-4 py-3 outline-none focus:border-emerald-500" />
            {message && <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p>}
            <button disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
          </form>
        </section>
      </div>
    </main>
  )
}
