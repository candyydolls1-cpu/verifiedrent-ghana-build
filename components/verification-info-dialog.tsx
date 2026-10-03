'use client'

import { useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'

const content = {
  landlord: {
    title: 'Verified Landlord',
    intro: "This landlord has completed VerifiedRent's verification process.",
    checks: ['Identity information', 'Phone number', 'Landlord or property documentation', 'Submitted property information'],
  },
  property: {
    title: 'Verified Property',
    intro: 'This property has completed VerifiedRent’s verification process.',
    checks: ['Property details', 'Ownership or authorization documents'],
  },
} as const

export function VerificationInfoDialog({ type, compact = false }: { type: keyof typeof content; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const item = content[type]
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={`Learn about ${item.title}`} className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-200 ${compact ? '' : 'text-sm'}`}><ShieldCheck size={compact ? 13 : 16} />{item.title}</button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation" onClick={() => setOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby={`${type}-verification-title`} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 text-left shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id={`${type}-verification-title`} className="text-xl font-black text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.intro}</p></div><button type="button" aria-label="Close verification details" onClick={() => setOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700"><X size={18} /></button></div><h3 className="mt-6 font-bold text-slate-900">What we checked</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">{item.checks.map((check) => <li key={check}>{check}</li>)}</ul><p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Verification indicates that VerifiedRent has reviewed the information submitted. It does not guarantee that a rental is completely risk-free. Always take precautions when renting.</p></section></div>}
  </>
}
