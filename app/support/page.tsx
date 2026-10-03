import { SupportForm } from '@/components/support-form'

export const dynamic = 'force-dynamic'
export default function SupportPage() { return <main className="min-h-screen bg-[#f7fafc] px-6 py-12 text-[#1B2A4A]"><div className="mx-auto max-w-2xl"><a href="/" className="flex items-center gap-3 font-bold text-[#1B2A4A]"><img loading="lazy" src="/verifiedrent-logo.webp" alt="VerifiedRent Ghana logo" className="size-10 object-contain" /><span>VerifiedRent Ghana</span></a><h1 className="mt-10 text-4xl font-black">How can we help?</h1><p className="mt-3 text-slate-600">Tell us what you need. Our team is here for tenants and landlords across Ghana.</p><SupportForm /></div></main> }
