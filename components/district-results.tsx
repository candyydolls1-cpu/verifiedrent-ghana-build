'use client'

import { MapPin, ArrowLeft } from 'lucide-react'

type District = { id: string; name: string; capital_city: string | null }

export function DistrictResults({ region, districts }: { region: string; districts: District[] }) {
  return (
    <main className="min-h-screen bg-[#f7fbff] px-5 py-12 text-[#10233d] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <a href="/#regions" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" /> Back to regions</a>
        <p className="mt-10 font-bold uppercase tracking-[0.2em] text-emerald-600">Choose your area</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Districts in {region}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">Pick a district or city to see verified homes in your neighborhood.</p>
        {districts.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{districts.map((district) => <a key={district.id} href={`/properties?district=${encodeURIComponent(district.id)}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><MapPin className="size-5" /></span><h2 className="mt-5 text-lg font-black">{district.name}</h2><p className="mt-2 text-sm text-slate-500">Capital city: <span className="font-semibold text-slate-700">{district.capital_city ?? district.name}</span></p><span className="mt-5 inline-block text-sm font-bold text-emerald-700">View homes →</span></a>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Districts are being added for this region. Please check back shortly.</div>}
      </div>
    </main>
  )
}


