'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Listing = { id: string; title: string; description: string | null; property_type: string; neighborhood: string | null; approximate_location: string | null; rent_amount: number; landlord_id: string; landlord_profiles?: { phone: string | null; preferred_contact: string | null; email: string | null } | null; property_images?: { image_url: string; is_primary: boolean | null }[]; property_likes?: { user_id: string }[]; reviews?: { id: string; rating: number; feedback: string | null }[] }

function DirectContact({ property, userId }: { property: Listing; userId: string }) {
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const contact = property.landlord_profiles
  const digits = (contact?.phone ?? '').replace(/\D/g, '')
  const preferred = contact?.preferred_contact?.toLowerCase()
  const href = preferred === 'whatsapp' && digits ? `https://wa.me/${digits}` : preferred === 'phone' && contact?.phone ? `tel:${contact.phone}` : contact?.email ? `mailto:${contact.email}` : undefined
  async function send() {
    if (!message.trim()) return
    const { error } = await supabase.from('inquiries').insert({ sender_id: userId, landlord_id: property.landlord_id, property_id: property.id, message: message.trim() })
    setNotice(error ? 'Could not send your message.' : 'Message sent to the landlord.')
    if (!error) { setMessage(''); setOpen(false) }
  }
  return <><a href={href ?? '#'} onClick={(event) => !href && event.preventDefault()} target={preferred === 'whatsapp' ? '_blank' : undefined} rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">{preferred === 'whatsapp' ? 'WhatsApp landlord' : preferred === 'phone' ? 'Call landlord' : 'Email landlord'}</a><button type="button" onClick={() => setOpen(!open)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#1B2A4A]">Message landlord</button>{open && <div className="basis-full rounded-2xl bg-slate-50 p-4"><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about viewing times or availability" className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm" /><button type="button" onClick={send} className="mt-3 rounded-xl bg-[#1B2A4A] px-4 py-2 text-sm font-bold text-white">Send message</button>{notice && <p className="mt-2 text-sm text-slate-600">{notice}</p>}</div>}</>
}

export function TenantFeedEngagement({ userId, properties }: { userId: string; properties: Listing[] }) {
  const supabase = createClient()
  const [items, setItems] = useState(properties)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [rating, setRating] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  async function toggleLike(property: Listing) {
    const liked = property.property_likes?.some((like) => like.user_id === userId)
    const result = liked ? await supabase.from('property_likes').delete().eq('property_id', property.id).eq('user_id', userId) : await supabase.from('property_likes').insert({ property_id: property.id, user_id: userId })
    if (result.error) { setNotice('Could not update your like.'); return }
    setItems((current) => current.map((item) => item.id === property.id ? { ...item, property_likes: liked ? (item.property_likes ?? []).filter((like) => like.user_id !== userId) : [...(item.property_likes ?? []), { user_id: userId }] } : item))
  }

  async function comment(property: Listing) {
    const text = feedback[property.id]?.trim()
    const score = Number(rating[property.id] || 5)
    if (!text) return
    const { data, error } = await supabase.from('reviews').insert({ reviewer_id: userId, property_id: property.id, landlord_id: property.landlord_id, rating: score, feedback: text }).select('id,rating,feedback').single()
    if (error || !data) { setNotice('Could not post your comment.'); return }
    setItems((current) => current.map((item) => item.id === property.id ? { ...item, reviews: [...(item.reviews ?? []), data] } : item))
    setFeedback((current) => ({ ...current, [property.id]: '' })); setNotice('Your feedback was posted to the landlord.')
  }

  return <section className="mt-10 space-y-5"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Landlord feed</p><h2 className="mt-2 text-2xl font-bold">Engage directly with landlords</h2></div>{items.map((property) => { const image = property.property_images?.find((item) => item.is_primary)?.image_url ?? property.property_images?.[0]?.image_url; const liked = property.property_likes?.some((like) => like.user_id === userId); return <article key={property.id} className="overflow-hidden rounded-3xl bg-white shadow-sm md:flex">{image ? <img src={image} alt="" className="h-56 w-full object-cover md:h-auto md:w-72" /> : <div className="h-40 w-full bg-slate-100 md:h-auto md:w-72" />}<div className="flex-1 p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-bold">{property.title}</h3><p className="mt-1 text-sm text-slate-500">{property.neighborhood || property.approximate_location || property.property_type} · GHS {Number(property.rent_amount).toLocaleString()}</p></div><button onClick={() => toggleLike(property)} className={`rounded-full border px-4 py-2 text-sm font-bold ${liked ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>{liked ? 'Liked' : 'Like'} · {property.property_likes?.length ?? 0}</button></div><p className="mt-4 text-sm leading-6 text-slate-600">{property.description}</p><div className="mt-5 flex flex-wrap gap-2 border-t pt-4"><DirectContact property={property} userId={userId} /></div><div className="mt-5 border-t pt-4"><p className="text-sm font-bold">Comments for the landlord <span className="font-normal text-slate-400">({property.reviews?.length ?? 0})</span></p><div className="mt-3 flex gap-2"><select aria-label="Rating" value={rating[property.id] ?? '5'} onChange={(event) => setRating({ ...rating, [property.id]: event.target.value })} className="rounded-xl border px-2 text-sm"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input value={feedback[property.id] ?? ''} onChange={(event) => setFeedback({ ...feedback, [property.id]: event.target.value })} placeholder="Share feedback with the landlord" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm" /><button onClick={() => comment(property)} className="rounded-xl bg-[#1B2A4A] px-3 py-2 text-sm font-bold text-white">Post</button></div></div></div></article>})}{notice && <p role="status" className="text-sm font-medium text-emerald-700">{notice}</p>}</section>
}
