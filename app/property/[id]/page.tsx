import { redirect } from 'next/navigation'

export default async function PropertyAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/properties/${id}`)
}
