import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(new URL('/auth?error=confirmation_failed', request.url))
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (tokenHash && (type === 'signup' || type === 'email')) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type === 'signup' ? 'signup' : 'email',
    })
    if (error) return NextResponse.redirect(new URL('/auth?error=confirmation_failed', request.url))
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/auth?error=missing_confirmation_code', request.url))
}
