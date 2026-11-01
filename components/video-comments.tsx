'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Comment = { id: string; user_id: string; comment: string; created_at: string; name: string }

type VideoCommentsProps = { videoId: string; onClose: () => void; onCommentPosted?: () => void }

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function isUnsafeComment(value: string) {
  const stripped = value.replace(/[\s.,()-]/g, '')
  return /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(value) || /[\w%+]+@\w+/i.test(stripped) || /\d{9,}/.test(stripped) || /whatsapp|telegram/i.test(stripped) || /wa\.me/i.test(value)
}

export function VideoComments({ videoId, onClose, onCommentPosted }: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const supabase = createClient()
      const [{ data: rows }, { data: authData }] = await Promise.all([
        supabase.from('video_comments').select('id, user_id, comment, created_at').eq('video_id', videoId).order('created_at', { ascending: true }),
        supabase.auth.getUser(),
      ])
      if (cancelled) return
      const commentsRows = rows ?? []
      const ids = [...new Set(commentsRows.map((row) => row.user_id))]
      const { data: profiles } = ids.length ? await supabase.from('public_commenter_profiles').select('id, full_name, display_name').in('id', ids) : { data: [] }
      if (cancelled) return
      const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name?.trim() || profile.display_name?.trim() || 'A VerifiedRent user']))
      setComments(commentsRows.map((row) => ({ ...row, name: names.get(row.user_id) ?? 'A VerifiedRent user' })))
      setUserId(authData.user?.id ?? null)
      setLoading(false)
    }
    void load().catch(() => { if (!cancelled) { setComments([]); setUserId(null); setLoading(false) } })
    return () => { cancelled = true }
  }, [videoId])

  async function postComment(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value || posting) return
    if (isUnsafeComment(value)) { setError('Phone numbers, emails and messaging links are not allowed in comments. This keeps renters safe from scams.'); return }
    setPosting(true)
    setError('')
    const supabase = createClient()
    const { data: inserted, error: insertError } = await supabase.from('video_comments').insert({ user_id: userId, video_id: videoId, comment: value }).select('id, user_id, comment, created_at').single()
    if (insertError || !inserted) { setError('Phone numbers, emails and messaging links are not allowed in comments. This keeps renters safe from scams.') } else { setComments((current) => [...current, { ...inserted, name: 'A VerifiedRent user' }]); setText(''); onCommentPosted?.() }
    setPosting(false)
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center"><section className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-[#102b4a] text-white shadow-2xl"><header className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Conversation</p><h2 className="text-xl font-black">Tour comments</h2></div><button type="button" onClick={onClose} aria-label="Close comments" className="grid size-11 place-items-center rounded-xl bg-white/10"><X /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-5">{loading ? <p className="text-sm text-blue-100/70">Loading comments...</p> : comments.length === 0 ? <p className="text-sm text-blue-100/70">Be the first to comment.</p> : <div className="space-y-4">{comments.map((item) => <article key={item.id} className="rounded-2xl bg-white/10 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-emerald-200">{item.name}</p><time className="text-xs text-blue-100/60">{relativeTime(item.created_at)}</time></div><p className="mt-2 text-sm leading-6 text-blue-50">{item.comment}</p></article>)}</div>}</div>{userId ? <form onSubmit={postComment} className="border-t border-white/10 p-5"><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Share your thoughts" rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 p-3 text-base text-white outline-none placeholder:text-blue-100/50" /><div className="mt-3 flex items-center justify-between gap-3"><p className="min-h-5 flex-1 text-xs text-rose-300">{error}</p><button type="submit" disabled={posting || !text.trim()} className="min-h-11 rounded-xl bg-emerald-400 px-5 font-black text-[#07182d] disabled:opacity-50">{posting ? 'Posting...' : 'Post'}</button></div></form> : <div className="border-t border-white/10 p-5"><Link href="/auth?mode=sign-in&next=%2Fexplore" className="font-bold text-emerald-300 underline">Sign in to join the conversation</Link></div>}</section></div>
}
