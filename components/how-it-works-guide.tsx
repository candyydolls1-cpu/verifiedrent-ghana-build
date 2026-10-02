'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, BadgeCheck, Camera, Home, MessageCircle, Search, ShieldAlert, UserRound } from 'lucide-react'
import { useState } from 'react'

const landlordSteps = [
  { icon: UserRound, title: 'Create your account', body: 'Sign up with your email and create your landlord account in a few simple steps.' },
  { icon: Camera, title: 'Verify your identity', body: 'Capture a live selfie, upload your documents, then pay the GH₵75 annual verification fee through Paystack or mobile money.', href: '/auth?mode=signup&role=landlord' },
  { icon: BadgeCheck, title: 'Become verified', body: 'Once approved, you are a Verified Landlord. Your listings carry a green badge tenants can trust.' },
  { icon: Home, title: 'Post your property', body: 'Add photos, location, price, and amenities. Tenants see your home and reach you directly.' },
  { icon: BarChart3, title: 'Track your impact', body: 'See how many people viewed, liked, and contacted you about each property.' },
]

const tenantSteps = [
  { icon: UserRound, title: 'Sign up for free', body: 'Create your account at no cost and start looking for a place that feels like home.' },
  { icon: Search, title: 'Search for homes', body: 'Filter by region, property type, price, and bedrooms. Every listing comes from a real landlord.' },
  { icon: BadgeCheck, title: 'Look for the green badge', body: 'The Verified Landlord badge means that person has been confirmed by us.' },
  { icon: MessageCircle, title: 'Contact directly', body: 'Found a home you love? Reach the landlord by phone or WhatsApp with one tap. No middleman, no broker.' },
  { icon: ShieldAlert, title: 'Report what feels wrong', body: 'See something suspicious? Report it and our team will investigate.' },
]

function StepCard({ step, index, accent }: { step: typeof landlordSteps[number]; index: number; accent: 'gold' | 'emerald' }) {
  const Icon = step.icon
  return <article className="relative rounded-[2rem] border border-white/10 bg-[#263858] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-8">
    <div className="flex items-start gap-5"><div className={`grid size-14 shrink-0 place-items-center rounded-2xl ${accent === 'gold' ? 'bg-[#fcd116] text-[#172642]' : 'bg-[#10b981] text-white'}`}><Icon className="size-7" /></div><div><p className={`text-xs font-black uppercase tracking-[0.2em] ${accent === 'gold' ? 'text-[#fcd116]' : 'text-emerald-300'}`}>Step {index + 1}</p><h3 className="mt-2 text-xl font-black text-white sm:text-2xl">{step.title}</h3><p className="mt-3 text-base leading-7 text-blue-100/70">{step.body}</p>{'href' in step && step.href ? <Link href={step.href} className="mt-4 inline-flex text-sm font-black text-[#fcd116] underline underline-offset-4">Start verification</Link> : null}</div></div>
  </article>
}

export function HowItWorksGuide() {
  const [path, setPath] = useState<'landlords' | 'tenants'>('landlords')
  const steps = path === 'landlords' ? landlordSteps : tenantSteps
  const accent = path === 'landlords' ? 'gold' : 'emerald'
  return <main className="min-h-screen bg-[#1b2a4a] text-white">
    <header className="border-b border-white/10 bg-white text-[#10233d]"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8"><Link href="/" className="flex items-center gap-3" aria-label="Back to VerifiedRent Ghana"><span className="grid size-10 place-items-center rounded-full bg-[#10b981] text-lg font-black text-white">V</span><span className="text-lg font-black tracking-tight sm:text-xl">VerifiedRent Ghana</span></Link><Link href="/" className="rounded-xl p-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100">Back home</Link></div></header>
    <section className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pt-24"><div className="max-w-3xl"><p className="font-black uppercase tracking-[0.24em] text-[#fcd116]">A clearer way to rent</p><h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.05em] sm:text-6xl">How VerifiedRent Ghana works.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/70 sm:text-xl">Two simple paths. One shared goal: more trust between the people offering homes and the people looking for them.</p></div><div className="mt-10 grid max-w-xl grid-cols-2 rounded-2xl border border-white/15 bg-[#263858] p-1.5" role="tablist" aria-label="Choose your path"><button role="tab" aria-selected={path === 'landlords'} onClick={() => setPath('landlords')} className={`rounded-xl px-4 py-4 text-sm font-black transition sm:text-base ${path === 'landlords' ? 'bg-[#fcd116] text-[#172642]' : 'text-blue-100/70 hover:text-white'}`}>For landlords</button><button role="tab" aria-selected={path === 'tenants'} onClick={() => setPath('tenants')} className={`rounded-xl px-4 py-4 text-sm font-black transition sm:text-base ${path === 'tenants' ? 'bg-[#10b981] text-white' : 'text-blue-100/70 hover:text-white'}`}>For tenants</button></div></section>
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-sm font-bold text-blue-100/50">{path === 'landlords' ? 'Build trust, then grow your reach.' : 'Find a home with confidence.'}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Your journey, step by step.</h2></div><span className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-blue-100/60 sm:inline-flex">{steps.length} steps</span></div><div className="grid gap-5 md:grid-cols-2">{steps.map((step, index) => <StepCard key={step.title} step={step} index={index} accent={accent} />)}</div><div className="mt-10 rounded-[2rem] border border-white/10 bg-[#223250] p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-[#fcd116]">Ready when you are.</p><h2 className="mt-2 text-2xl font-black">{path === 'landlords' ? 'Put your property in trusted hands.' : 'Start looking for your next home.'}</h2></div><Link href={path === 'landlords' ? '/auth?mode=signup&role=landlord' : '/properties'} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-black text-white ${path === 'landlords' ? 'bg-[#fcd116] text-[#172642]' : 'bg-[#10b981]'}`}>{path === 'landlords' ? 'Become a landlord' : 'Explore properties'}<ArrowRight className="size-5" /></Link></div></div></section>
  </main>
}
