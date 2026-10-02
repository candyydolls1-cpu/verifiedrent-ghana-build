'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  user: { id: string; email?: string }
  profile: any
  properties: any[]
  applications: any[]
  notifications: any[]
  inquiries: any[]
}

export function DashboardWorkspace({ user, profile, properties, applications, notifications, inquiries }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState('Overview')
  const role = profile?.role === 'landlord' ? 'landlord' : 'tenant'
  const [form, setForm] = useState({ legalName: profile?.full_name ?? '', phone: '', idType: 'Ghana Card', idNumber: '' })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [identityPhoto, setIdentityPhoto] = useState<Blob | null>(null)

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    if (!identityPhoto) {
      setBusy(false)
      setNotice('Please capture your live identity photo before continuing.')
      return
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      setBusy(false)
      setNotice('Your session has expired. Please sign in again.')
      return
    }

    const { data: application, error: applicationError } = await supabase
      .from('verification_applications')
      .insert({
        landlord_id: user.id,
        legal_name: form.legalName,
        phone: form.phone,
        id_type: form.idType,
        id_number: form.idNumber,
        status: 'submitted',
      })
      .select('id')
      .single()

    if (applicationError || !application?.id) {
      setBusy(false)
      setNotice('We could not submit this application. Please check your details and try again.')
      return
    }

    const photoPath = `${user.id}/${application.id}.jpg`
    const { error: uploadError } = await supabase.storage.from('verification-docs').upload(photoPath, identityPhoto, { contentType: 'image/jpeg', upsert: true })
    if (uploadError) {
      setBusy(false)
      setNotice('Your application was saved, but the identity photo could not be uploaded. Please try again.')
      return
    }

    const { data: photoUrl } = supabase.storage.from('verification-docs').getPublicUrl(photoPath)
    const { error: photoUpdateError } = await supabase.from('verification_applications').update({ identity_photo_url: photoUrl.publicUrl }).eq('id', application.id).eq('landlord_id', user.id)
    if (photoUpdateError) {
      setBusy(false)
      setNotice('Your photo was uploaded, but the application could not be updated. Please try again.')
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initiate-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ application_id: application.id }),
    })
    const payment = await response.json().catch(() => null)

    if (!response.ok || !payment?.authorization_url) {
      setBusy(false)
      setNotice(payment?.error ?? 'Your application was saved, but payment could not be started. Please try again.')
      return
    }

    window.location.assign(payment.authorization_url)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return <main className="min-h-screen bg-[#f7fafc] text-[#1B2A4A]"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">VerifiedRent Ghana</p><h1 className="mt-1 text-xl font-bold">{role === 'landlord' ? 'Landlord workspace' : 'Tenant workspace'}</h1></div><button onClick={signOut} className="rounded-lg border px-4 py-2 text-sm font-semibold">Sign out</button></div></header><div className="mx-auto flex max-w-7xl gap-8 px-6 py-8"><aside className="hidden w-56 shrink-0 flex-col gap-2 md:flex">{['Overview', ...(role === 'landlord' ? ['Verification'] : ['Saved homes', 'Applications']), 'Notifications'].map(item => <button key={item} onClick={() => setTab(item)} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${tab === item ? 'bg-[#1B2A4A] text-white' : 'text-slate-500 hover:bg-white'}`}>{item}</button>)}</aside><section className="min-w-0 flex-1 vr-fade-up"><div className="mb-8 flex items-end justify-between"><div><p className="text-slate-500">Good to see you,</p><h2 className="text-3xl font-bold">{profile?.display_name || profile?.full_name || user.email}</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{role}</span></div>{tab === 'Overview' && <div className="grid gap-5 md:grid-cols-3 vr-stagger"><Stat label={role === 'landlord' ? 'Your properties' : 'Saved homes'} value={role === 'landlord' ? properties.length : '0'} /><Stat label="Verification" value={role === 'landlord' ? (applications[0]?.status ?? 'Not started') : 'Protected'} /><Stat label="Notifications" value={notifications.filter(n => !n.is_read).length} /></div>}{role === 'landlord' && tab === 'Verification' && <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">Landlord verification</h3><p className="mt-2 text-sm text-slate-500">Submit your details and pay the GH₵75 verification fee securely with Paystack.</p><form onSubmit={submitVerification} className="mt-6 space-y-4"><input required value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} placeholder="Legal name" className="w-full rounded-lg border px-4 py-3" /><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full rounded-lg border px-4 py-3" /><select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} className="w-full rounded-lg border px-4 py-3"><option>Ghana Card</option><option>Passport</option><option>Driver&apos;s licence</option></select><input required value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="ID number" className="w-full rounded-lg border px-4 py-3" /><button disabled={busy} className="rounded-lg bg-[#1B2A4A] px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Preparing payment…' : 'Submit and pay GH₵75'}</button>{notice && <p role="status" className="text-sm text-slate-600">{notice}</p>}<IdentityCapture onCapture={setIdentityPhoto} /> </form><section className="mt-8 rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Tenant inquiries</h2><div className="mt-4 space-y-3">{inquiries.length ? inquiries.map((inquiry) => <article key={inquiry.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{inquiry.profiles?.display_name || inquiry.profiles?.full_name || inquiry.profiles?.email || 'Tenant'} · {inquiry.properties?.title || 'Property'}</p><time className="text-xs text-slate-400">{new Date(inquiry.created_at).toLocaleDateString()}</time></div><p className="mt-2 text-sm leading-6 text-slate-600">{inquiry.message}</p></article>) : <p className="text-sm text-slate-500">No tenant inquiries yet.</p>}</div></section></div>}</section></div></main>
}

function IdentityCapture({ onCapture }: { onCapture: (photo: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [open, setOpen] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [captured, setCaptured] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), [])

  async function openCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setOpen(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setError('Camera access was not granted. Choose Allow in your browser, then try again.')
    }
  }

  function capture() {
    setCountdown(3)
    const timer = window.setInterval(() => {
      setCountdown(value => {
        if (value === 1) {
          window.clearInterval(timer)
          const video = videoRef.current
          if (!video) return null
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          canvas.getContext('2d')?.drawImage(video, 0, 0)
          canvas.toBlob(blob => {
            if (blob) { onCapture(blob); setCaptured(true); streamRef.current?.getTracks().forEach(track => track.stop()); setOpen(false) }
          }, 'image/jpeg', 0.9)
          return null
        }
        return (value ?? 1) - 1
      })
    }, 1000)
  }

  return <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold">Live identity photo</p><p className="mt-1 text-sm text-slate-500">We use this only for an admin to compare with your submitted ID. Your camera opens only when you choose to start.</p>{!open && <button type="button" onClick={openCamera} className="mt-4 rounded-xl bg-[#1B2A4A] px-4 py-3 text-sm font-bold text-white">{captured ? 'Retake identity photo' : 'Open camera and take selfie'}</button>}{open && <div className="mt-4 space-y-3"><video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-xl bg-slate-900 object-cover" /><p className="text-sm font-semibold text-[#1B2A4A]">{countdown ? `Hold still, we're capturing your identity photo in ${countdown}.` : 'Center your face and keep a neutral expression.'}</p><button type="button" onClick={capture} disabled={countdown !== null} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{countdown ? 'Capturing…' : 'Capture photo'}</button></div>}{captured && !open && <p className="mt-3 text-sm font-semibold text-emerald-700">Identity photo captured and ready to submit.</p>}{error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}</div> }

function Stat({ label, value }: { label: string; value: any }) { return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold capitalize">{value}</p></div> }
