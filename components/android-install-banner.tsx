'use client'

import { useEffect, useState } from 'react'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
  }
}

export function AndroidInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!/Android/i.test(navigator.userAgent)) return
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (!prompt || dismissed) return null
  return <aside className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl bg-[#10233d] p-4 text-white shadow-2xl" role="status"><p className="min-w-0 flex-1 text-sm font-bold">Install the VerifiedRent app</p><button type="button" onClick={async () => { await prompt.prompt(); setPrompt(null) }} className="min-h-11 rounded-xl bg-amber-400 px-4 text-sm font-black text-amber-950">Install</button><button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss install banner" className="grid size-11 shrink-0 place-items-center rounded-xl text-2xl leading-none text-white/80">×</button></aside>
}
