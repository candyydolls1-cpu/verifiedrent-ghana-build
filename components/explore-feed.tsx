'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Check, Eye, Heart, MapPin, Play, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getYouTubeInfo(url: string | null) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const id = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop()
    return id ? { id, embedUrl: `https://www.youtube.com/embed/${id}` } : null
  } catch {
    return null
  }
}

type ExploreProperty = {
  id: string
  title: string | null
  price: number | string | null
  property_type: string | null
  is_verified_landlord?: boolean | null
  cities?: { name: string } | { name: string }[] | null
  primary_image_url?: string | null
  view_count?: number | null
}

type ExploreVideo = { id: string; title: string | null; video_url: string | null; view_count: number | null }

type ExploreFeedProps = { properties: ExploreProperty[]; videos: ExploreVideo[]; likeCounts: Record<string, number>; loadError?: string }

export function ExploreFeed({ properties, videos, likeCounts, loadError }: ExploreFeedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const tourRefs = useRef<Record<string, HTMLElement | null>>({})
  const pendingVideoViews = useRef(new Set<string>())
  const pendingLikes = useRef(new Set<string>())
  const [videoViews, setVideoViews] = useState<Record<string, number>>({})
  const [activeTourId, setActiveTourId] = useState<string | null>(null)
  const [liked, setLiked] = useState<string[]>([])
  const [counts, setCounts] = useState(likeCounts)
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [likePrompt, setLikePrompt] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const videoId = (entry.target as HTMLElement).dataset.videoId
        if (!videoId) return
        const key = `vr_view_video_${videoId}_${new Date().toISOString().slice(0, 10)}`
        if (localStorage.getItem(key) || pendingVideoViews.current.has(videoId)) return
        pendingVideoViews.current.add(videoId)
        void (async () => { const { error } = await createClient().rpc('increment_video_view', { p_video_id: videoId }); if (!error) { localStorage.setItem(key, '1'); setVideoViews((current) => ({ ...current, [videoId]: (current[videoId] ?? videos.find((video) => video.id === videoId)?.view_count ?? 0) + 1 })) } pendingVideoViews.current.delete(videoId) })()
      })
    }, { threshold: 0.6 })
    Object.values(tourRefs.current).forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [videos])

  useEffect(() => {
  const loadAuthState = async () => {
  try {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  if (data.user) {
  const { data: likes, error: likesError } = await supabase.from('property_likes').select('property_id').eq('user_id', data.user.id)
  setUserId(data.user.id)
  setLiked(likesError ? [] : (likes ?? []).map((like) => like.property_id))
  } else {
  setUserId(null)
  setLiked([])
  }
  } catch {
  setUserId(null)
  setLiked([])
  } finally {
  setAuthReady(true)
  }
  }
    void loadAuthState()
  }, [])

  async function toggleLike(propertyId: string) {
    if (!authReady) return
    if (!userId) { setLikePrompt(propertyId); return }
    if (pendingLikes.current.has(propertyId)) return
    pendingLikes.current.add(propertyId)
    const wasLiked = liked.includes(propertyId)
    setLiked((current) => wasLiked ? current.filter((id) => id !== propertyId) : [...current, propertyId])
    setCounts((current) => ({ ...current, [propertyId]: Math.max(0, (current[propertyId] ?? 0) + (wasLiked ? -1 : 1)) }))
    try {
      const supabase = createClient()
      const result = wasLiked
        ? await supabase.from('property_likes').delete().eq('property_id', propertyId).eq('user_id', userId)
        : await supabase.from('property_likes').insert({ property_id: propertyId, user_id: userId })
      if (result.error) {
        setLiked((current) => wasLiked ? [...current, propertyId] : current.filter((id) => id !== propertyId))
        setCounts((current) => ({ ...current, [propertyId]: Math.max(0, (current[propertyId] ?? 0) + (wasLiked ? 1 : -1)) }))
      }
    } catch {
      setLiked((current) => wasLiked ? [...current, propertyId] : current.filter((id) => id !== propertyId))
      setCounts((current) => ({ ...current, [propertyId]: Math.max(0, (current[propertyId] ?? 0) + (wasLiked ? 1 : -1)) }))
    } finally {
      pendingLikes.current.delete(propertyId)
    }
  }

  return <main className="min-h-screen bg-[#07182d] text-white">
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07182d]/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">VerifiedRent Ghana</p><h1 className="text-2xl font-black tracking-tight">Explore homes</h1></div></header>
    <section className="mx-auto max-w-2xl snap-y snap-mandatory space-y-5 px-3 py-5">{loadError && <div className="rounded-3xl border border-rose-300/20 bg-rose-950/30 p-8 text-center"><h2 className="text-xl font-black">Explore is temporarily unavailable</h2><p className="mt-2 text-sm text-blue-100/70">We could not load published homes right now.</p></div>}{!loadError && properties.length === 0 && videos.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"><h2 className="text-xl font-black">No published homes yet</h2><p className="mt-2 text-sm text-blue-100/70">New properties will appear here as soon as they go live.</p></div>}
      {properties.map((property) => { const listing = { id: property.id, title: property.title ?? 'Published property', type: property.property_type ?? 'Property', price: property.price ? `GH₵ ${property.price}` : 'Price on request', district: Array.isArray(property.cities) ? property.cities[0]?.name ?? 'Ghana' : property.cities?.name ?? 'Ghana' }; const isLiked = liked.includes(listing.id); return <Link key={listing.id} href={`/property/${listing.id}`} className="relative block min-h-[calc(100svh-110px)] snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#102b4a] shadow-2xl">
        {property.primary_image_url ? <img src={property.primary_image_url} alt={listing.title} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="absolute inset-0 grid place-items-center bg-[#102b4a] text-sm font-bold text-blue-100/70">No photo yet</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07182d] via-transparent to-black/20" /><div className="absolute bottom-0 left-0 right-0 p-6"><div className="mb-4 flex items-center gap-2 text-sm text-emerald-200"><MapPin className="size-4" /> {listing.district}</div><h2 className="text-3xl font-black leading-tight">{listing.title}</h2><div className="mt-3 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"><Eye size={14} />{property.view_count ?? 0} views</span><span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-[#07182d]">{listing.type}</span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${property.is_verified_landlord ? 'bg-amber-500 text-amber-950' : 'bg-red-100 text-red-700'}`}>{property.is_verified_landlord ? <Check size={13} /> : <X size={13} />}{property.is_verified_landlord ? 'Verified Landlord' : 'Landlord not verified'}</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{listing.price}</span></div><p className="mt-4 text-sm text-blue-100/75">Posted by VerifiedRent listing</p><div className="mt-5 flex items-center gap-3"><button onClick={(event) => { event.preventDefault(); event.stopPropagation(); void toggleLike(listing.id) }} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold ${isLiked ? 'bg-rose-500' : 'bg-white/15'}`}><Heart className={`size-5 ${isLiked ? 'fill-current' : ''}`} />{counts[listing.id] ?? 0}</button><span className="rounded-xl bg-white px-4 py-3 font-bold text-[#07182d]">View full listing</span></div>{likePrompt === listing.id && <p className="mt-2 text-sm font-semibold text-amber-200"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); router.push(`/auth?mode=signin&next=${encodeURIComponent(pathname)}`) }} className="underline">Sign in to like</button></p>}</div>
      </Link> })}
      {videos.map((tour) => { const info = getYouTubeInfo(tour.video_url); if (!info) return null; const isPlaying = activeTourId === tour.id; return <article key={`tour-${tour.id}`} ref={(node) => { tourRefs.current[tour.id] = node }} data-video-id={tour.id} onClick={() => setActiveTourId(tour.id)} className="relative min-h-[calc(100svh-110px)] snap-start overflow-hidden rounded-3xl border border-white/10 bg-[#102b4a] shadow-2xl">{isPlaying ? <iframe src={`${info.embedUrl}?autoplay=1`} title={tour.title ? `Tour: ${tour.title}` : 'Property tour'} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" /> : <><img src={`https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`} alt={tour.title ?? 'Property tour'} loading="lazy" className="absolute inset-0 size-full object-cover" /><button type="button" aria-label={`Play ${tour.title ?? 'property tour'}`} onClick={(event) => { event.stopPropagation(); setActiveTourId(tour.id) }} className="absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#07182d] shadow-2xl"><Play className="ml-1 size-7 fill-current" /></button></>}<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07182d] via-[#07182d]/80 to-transparent p-6 pt-24"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Property tour</p><h2 className="mt-2 text-2xl font-black leading-tight">{tour.title ?? 'Property tour'}</h2><p className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"><Eye size={14} />{videoViews[tour.id] ?? tour.view_count ?? 0} views</p></div></article>})}
    </section>
    {likePrompt && !properties.some((property) => property.id === likePrompt) && null}
  </main>
}

export default ExploreFeed
