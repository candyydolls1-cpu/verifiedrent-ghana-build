'use client'

import { useState } from 'react'
import { Building2, ChevronDown, Check, Flower2, Home, Landmark, MapPin, Menu, Search, ShieldCheck, Tag, TowerControl, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const adinkraSymbols = [
  { name: 'Gye Nyame', mark: '☼', meaning: 'Except God' },
  { name: 'Sankofa', mark: '↶', meaning: 'Learn from the past' },
  { name: 'Fawohodie', mark: '✦', meaning: 'Independence' },
  { name: 'Nkyinkyim', mark: '〰', meaning: 'Resilience' },
]

const regionIcons = [Building2, Flower2, TowerControl, Landmark]

export function VerifiedRentLanding({ regions: availableRegions }: { regions: { id: string; name: string }[] }) {
  const regionsForDisplay = availableRegions
  const [menuOpen, setMenuOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')

  async function handleGetStarted() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    setSignedIn(Boolean(data.user))
    if (data.user) {
      window.location.assign('/dashboard')
      return
    }
    window.location.assign('/auth')
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (location) params.set('region', location)
    if (type) params.set('type', type)
    if (price) params.set('price', price)
    window.location.assign(`/properties?${params.toString()}`)
  }

  function browseRegion(id: string) {
    window.location.assign(`/properties?region=${encodeURIComponent(id)}`)
  }

  return (
    <main className="min-h-screen bg-[#f7fbff] text-[#10233d]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur vr-header-enter">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3" aria-label="VerifiedRent Ghana home">
            <span className="flex flex-col items-center gap-1"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8e7cc29cc4c94b53bb39a73fbaae5da1-4RqJKEshHpTPFahLa3JsJGimpbcaYp.png" alt="VerifiedRent Ghana shield logo" className="size-10 object-contain" /><span aria-label="Ghana flag" className="flex h-1.5 w-10 overflow-hidden rounded-full shadow-sm"><span className="flex-1 bg-[#ce1126]" /><span className="flex-1 bg-[#fcd116]" /><span className="flex-1 bg-[#006b3f]" /></span></span>
            <span className="text-lg font-extrabold tracking-[-0.04em] sm:text-xl">VerifiedRent Ghana</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Main navigation">
            <a href="/how-it-works" className="transition-colors hover:text-[#10B981]">How it works</a>
            <a href="#regions" className="transition-colors hover:text-[#10B981]">Browse regions</a>
            <button onClick={handleGetStarted} className="rounded-xl bg-[#10B981] px-5 py-3 text-white shadow-lg shadow-emerald-500/20 transition hover:bg-[#079669]">Get started</button>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-5 text-sm font-semibold md:hidden"><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#regions" onClick={() => setMenuOpen(false)}>Browse regions</a><button onClick={handleGetStarted} className="rounded-xl bg-[#10B981] px-5 py-3 text-white">Get started</button></div>}
      </header>

      <section id="top" className="relative overflow-hidden bg-[#eef7fb]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:px-12 lg:pb-32 lg:pt-28">
          <div className="max-w-2xl vr-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-[#079669]"><Check className="size-4" /> Ghana&apos;s trusted rental marketplace</div>
            <h1 className="max-w-[22rem] text-4xl font-black leading-[1.02] tracking-[-0.055em] text-[#172033] sm:max-w-2xl sm:text-6xl lg:text-7xl">Hwe wo fie foforo a <span className="inline text-[#10B981] vr-shimmer">wode ahotoso kɛse bɛtena mu.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">Discover trusted rentals across Ghana. Verified landlords. Quality homes. Peace of mind.</p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4"><a href="#search" className="inline-flex items-center gap-3 rounded-xl bg-[#10B981] px-6 py-4 font-bold text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-[#079669]"><Search className="size-5" /> Explore properties</a><button onClick={handleGetStarted} className="vr-pulse-glow rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-[#1B2A4A] transition hover:border-[#10B981] hover:text-[#079669]">List your property</button></div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:mt-9 sm:gap-6 sm:text-sm"><span className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#10B981]" /> Verified listings</span><span className="flex items-center gap-2"><Check className="size-5 text-[#10B981]" /> Safer renting</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:justify-self-end vr-float"><div className="absolute -inset-6 rounded-[3rem] bg-emerald-200/30 blur-3xl vr-breathe" /><div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-white shadow-2xl vr-image-reveal"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19e1b552c0a9403eb09962e2cd24c8ad-UAMpu3JxTj02AkvIqOwprsWSYdhokS.png" alt="VerifiedRent Ghana rental search experience" className="w-full" /></div></div>
        </div>
      </section>

      <section id="search" className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 sm:px-8 vr-search-enter"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-8"><div className="mb-6 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-emerald-50 text-[#10B981]"><Search className="size-5" /></span><div><h2 className="text-xl font-extrabold">Search properties</h2><p className="text-sm text-slate-500">Find a verified rental that feels like home.</p></div></div><div className="grid gap-4 md:grid-cols-3"><SelectField label="Location" value={location} onChange={setLocation} icon={MapPin} options={regionsForDisplay.map((region) => ({ label: region.name, value: region.id }))} /><SelectField label="Property type" value={type} onChange={setType} icon={Home} options={[{ label: 'Apartment', value: 'Apartment' }, { label: 'House', value: 'House' }, { label: 'Room', value: 'Room' }, { label: 'Studio', value: 'Studio' }]} /><SelectField label="Price range" value={price} onChange={setPrice} icon={Tag} options={[{ label: 'Under GH₵1,000', value: 'under-1000' }, { label: 'GH₵1,000 – GH₵2,500', value: '1000-2500' }, { label: 'GH₵2,500+', value: '2500-plus' }]} /></div><button onClick={handleSearch} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B2A4A] px-5 py-4 font-bold text-white transition hover:bg-[#243b67]"><Search className="size-5" /> Search verified properties</button></div></section>

      <section id="regions" className="bg-[#f5f9fc] px-5 pb-24 pt-16 sm:px-8 lg:px-12"><div><p className="font-bold uppercase tracking-[0.22em] text-[#52b98d]">Start exploring</p><h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#10233d] sm:text-5xl">Browse by region</h2></div><div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{regionsForDisplay.map((region, index) => { const Icon = regionIcons[index % regionIcons.length]; return <button type="button" onClick={() => browseRegion(region.id)} key={region.id} className={`group relative min-h-[190px] overflow-hidden rounded-[1.6rem] border-2 border-[#e1e7ef] bg-[#1B2A4A] p-4 text-center shadow-sm transition hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl sm:min-h-[230px] sm:p-7 sm:p-8 vr-card-enter vr-delay-${(index % 8) + 1}`}><img src={`https://images.unsplash.com/photo-${['1570129477492-45c003edd2be','1564013799919-ab600027ffc6','1600585154340-be6161a56a0c','1600566753086-00f18fb6b3ea'][index % 4]}?auto=format&fit=crop&w=700&q=80`} alt="" className="absolute inset-0 size-full object-cover opacity-45 transition duration-700 group-hover:scale-110 group-hover:opacity-60" /><span className="absolute inset-0 bg-gradient-to-t from-[#10233d] via-[#10233d]/45 to-transparent" /><span className="relative z-10 flex min-h-[155px] flex-col items-center justify-end sm:min-h-[190px]"><span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-sm transition group-hover:scale-105 sm:size-20"><Icon className="size-9 sm:size-10" strokeWidth={2.5} /></span><h3 className="mt-4 text-base font-black text-white sm:text-xl">{region.name}</h3><p className="mt-2 text-sm font-medium text-white/80">Verified rentals</p></span></button>})}</div></section>

      <section id="how-it-works" className="bg-[#1B2A4A] px-5 py-20 text-white sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="font-bold uppercase tracking-[0.18em] text-emerald-300">Rent with confidence</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Verified landlords. Trusted rentals.</h2><p className="mt-4 leading-7 text-blue-100/75">Every landlord on VerifiedRent Ghana goes through a thorough verification process so you can rent with confidence.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 vr-stagger">{adinkraSymbols.map((symbol) => <div key={symbol.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 vr-card-enter vr-delay-2 hover:bg-white/10"><span className="grid size-14 place-items-center rounded-full border border-[#FCD116]/60 text-3xl text-[#FCD116]">{symbol.mark}</span><h3 className="mt-5 text-lg font-bold">{symbol.name}</h3><p className="mt-2 text-sm leading-6 text-blue-100/65">{symbol.meaning}. A Ghanaian value at the heart of trusted renting.</p></div>)}</div></div></section>

      <footer className="bg-white px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold text-[#1B2A4A]">VerifiedRent Ghana</span><span>Trusted rentals, made simpler.</span><nav className="flex flex-wrap gap-4"><a href="/privacy" className="hover:text-[#079669]">Privacy Policy</a><a href="/terms" className="hover:text-[#079669]">Terms of Service</a><a href="/about" className="hover:text-[#079669]">About</a><a href="/support" className="hover:text-[#079669]">Support</a></nav><span>© 2026 VerifiedRent Ghana</span></div></footer>
      {signedIn && <div className="sr-only" role="status">You are signed in.</div>}
    </main>
  )
}

function SelectField({ label, value, onChange, icon: Icon, options }: { label: string; value: string; onChange: (value: string) => void; icon: typeof MapPin; options: { label: string; value: string }[] }) {
  return <label className="relative block"><span className="mb-2 block text-sm font-bold">{label}</span><span className="pointer-events-none absolute bottom-0 left-4 flex h-12 items-center text-slate-400"><Icon className="size-5" /></span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute bottom-4 right-4 size-4 text-slate-400" /></label>
}
