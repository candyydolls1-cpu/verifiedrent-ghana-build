import { redirect } from 'next/navigation'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams
  const role = params.role === 'landlord' ? 'landlord' : 'tenant'
  redirect(`/auth?mode=signup&role=${role}`)
}
