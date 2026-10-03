'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Heart,
  Home,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react'

const regions = [
  { name: 'Greater Accra', count: '248 properties', icon: Building2 },
  { name: 'Ashanti', count: '86 properties', icon: Home },
  { name: 'Western', count: '54 properties', icon: MapPin },
  { name: 'Central', count: '39 properties', icon: Building2 },
]

const properties = [
  { title: 'Modern 2-bedroom apartment', location: 'East Legon, Accra', price: 'GH₵ 4,500', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85' },
  { title: 'Serene family home', location: 'Kumasi, Ashanti', price: 'GH₵ 2,800', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85' },
  { title: 'Bright city studio', location: 'Osu, Accra', price: 'GH₵ 3,200', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85' },
]

export function VerifiedRentHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [saved, setSaved] = useState<number[]>([])
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')

  function searchProperties() {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#f7fafc] text-[#172a46]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="VerifiedRent Ghana home">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8e7cc29cc4c94b53bb39a73fbaae5da1-4RqJKEshHpTPFahLa3JsJGimpbcaYp.png" alt="VerifiedRent Ghana shield logo" className="size-10 object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-[#1B2A4A]">VerifiedRent <span className="text-[#10B981]">Ghana</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#listings" className="transition hover:text-[#10B981]">Find a home</a>
            <a href="#how-it-works" className="transition hover:text-[#10B981]">How it works</a>
            <a href="#landlords" className="transition hover:text-[#10B981]">For landlords</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#1B2A4A] transition hover:bg-slate-100">Sign in</button>
            <button className="rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">Get started</button>
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && <nav className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-5 text-sm font-semibold md:hidden"><a href="#listings" onClick={() => setMenuOpen(false)}>Find a home</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#landlords" onClick={() => setMenuOpen(false)}>For landlords</a><button className="rounded-xl bg-[#10B981] px-4 py-3 text-left font-bold text-white">Get started</button></nav>}
      </header>

      <section id="top" className="relative overflow-hidden bg-[#eaf4f8]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700"><ShieldCheck className="size-4" /> Ghana&apos;s trusted rental marketplace</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-[-0.04em] text-[#1B2A4A] sm:text-6xl lg:text-7xl">Find your next home with <span className="text-[#10B981]">confidence.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Discover verified landlords and rental listings.</p>
            <div className="mt-8 flex flex-wrap gap-4"><button onClick={searchProperties} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-6 py-4 font-bold text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600">Explore properties <ArrowRight className="size-5" /></button><a href="#how-it-works" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-[#1B2A4A] transition hover:border-emerald-400">How it works</a></div>
            <div className="mt-10 flex items-center gap-8 text-sm"><div><strong className="block text-2xl text-[#1B2A4A]">1,200+</strong><span className="text-slate-500">verified listings</span></div><div className="h-10 w-px bg-slate-300" /><div><strong className="block text-2xl text-[#1B2A4A]">98%</strong><span className="text-slate-500">happy renters</span></div></div>
          </div>
          <div className="relative hidden min-h-[460px] lg:block"><div className="absolute right-0 top-0 size-[430px] rounded-[45%] bg-[#c9e5e9] blur-3xl" /><div className="relative ml-auto mt-2 max-w-[510px] overflow-hidden rounded-[2rem] border-8 border-white bg-slate-300 shadow-2xl shadow-slate-400/30"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=90" alt="Bright modern Ghanaian rental interior" className="h-[460px] w-full object-cover" /><div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg"><div><p className="text-sm font-bold text-[#1B2A4A]">A home that feels like yours</p><p className="mt-1 text-xs text-slate-500">Verified listings. Real peace of mind.</p></div><div className="rounded-full bg-emerald-100 p-2 text-emerald-600"><Check className="size-5" /></div></div></div></div>
        </div>
        <div className="mx-auto -mt-10 max-w-6xl px-5 pb-2 lg:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/20 md:p-6"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2.5 text-[#10B981]"><Search className="size-5" /></span><div><h2 className="font-bold text-[#1B2A4A]">Search properties</h2><p className="text-xs text-slate-500">Find a place that fits your life</p></div></div><div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"><SelectField icon={MapPin} label="Location" value={location} onChange={setLocation} options={['Accra', 'Kumasi', 'Takoradi', 'Cape Coast']} placeholder="Any location" /><SelectField icon={Home} label="Property type" value={type} onChange={setType} options={['Apartment', 'House', 'Studio', 'Townhouse']} placeholder="Any type" /><SelectField icon={Tag} label="Price range" value={price} onChange={setPrice} options={['Under GH₵ 2,000', 'GH₵ 2,000 – 4,000', 'GH₵ 4,000+']} placeholder="Any price" /><button onClick={searchProperties} className="mt-auto flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1B2A4A] px-7 font-bold text-white transition hover:bg-[#263b65]">Search <ArrowRight className="size-4" /></button></div></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-[#10B981]">Start exploring</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#1B2A4A] sm:text-4xl">Browse by region</h2></div><a href="#listings" className="hidden items-center gap-1 text-sm font-bold text-[#10B981] sm:flex">View all regions <ArrowRight className="size-4" /></a></div><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{regions.map((region) => { const Icon = region.icon; return <a href="#listings" key={region.name} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100"><span className="mb-10 inline-flex rounded-xl bg-emerald-50 p-3 text-[#10B981] transition group-hover:bg-[#10B981] group-hover:text-white"><Icon className="size-6" /></span><h3 className="font-bold text-[#1B2A4A]">{region.name}</h3><p className="mt-1 text-sm text-slate-500">{region.count}</p></a> })}</div></section>

      <section id="listings" className="bg-white py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-[#10B981]">Handpicked for you</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#1B2A4A] sm:text-4xl">Featured properties</h2></div><button className="hidden items-center gap-1 text-sm font-bold text-[#10B981] sm:flex">View all <ArrowRight className="size-4" /></button></div><div className="mt-8 grid gap-6 md:grid-cols-3">{properties.map((property, index) => <article key={property.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-56 overflow-hidden"><img src={property.image} alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700"><Check className="size-3.5" /> Verified</span><button onClick={() => setSaved(saved.includes(index) ? saved.filter((item) => item !== index) : [...saved, index])} className="absolute right-4 top-4 rounded-full bg-white/95 p-2.5 text-slate-500 transition hover:text-rose-500" aria-label={`Save ${property.title}`}><Heart className={`size-4 ${saved.includes(index) ? 'fill-rose-500 text-rose-500' : ''}`} /></button></div><div className="p-5"><h3 className="font-bold text-[#1B2A4A]">{property.title}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4 text-[#10B981]" /> {property.location}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-lg font-extrabold text-[#1B2A4A]">{property.price}<span className="text-xs font-medium text-slate-500"> / month</span></span><button className="text-sm font-bold text-[#10B981]">View home</button></div></div></article>)}</div></div></section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-12 rounded-3xl bg-[#1B2A4A] p-8 text-white md:grid-cols-[.8fr_1.2fr] md:p-12"><div><p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Rent with confidence</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your next move should feel simple.</h2><p className="mt-5 max-w-md leading-7 text-slate-300">We verify the people and places behind every listing, so you can spend less time worrying and more time finding home.</p></div><div className="grid gap-8 sm:grid-cols-3">{[['01', 'Search', 'Explore quality homes in the locations you love.'], ['02', 'Connect', 'Message verified landlords directly and safely.'], ['03', 'Move in', 'Choose confidently and settle into your next chapter.']].map(([number, title, text]) => <div key={number}><span className="text-sm font-black text-emerald-300">{number}</span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{text}</p></div>)}</div></div></section>

      <footer id="landlords" className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-bold text-[#1B2A4A]"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8e7cc29cc4c94b53bb39a73fbaae5da1-4RqJKEshHpTPFahLa3JsJGimpbcaYp.png" alt="" className="size-7 object-contain" />VerifiedRent Ghana</div><p>© 2025 VerifiedRent Ghana. Find home with confidence.</p><div className="flex gap-5 font-semibold"><a href="#top" className="hover:text-[#10B981]">Privacy</a><a href="#top" className="hover:text-[#10B981]">Terms</a></div></div></footer>
    </main>
  )
}

function SelectField({ icon: Icon, label, value, onChange, options, placeholder }: { icon: typeof MapPin; label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) {
  return <label className="relative block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><span className="relative block"><Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"><option value="">{placeholder}</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /></span></label>
}
