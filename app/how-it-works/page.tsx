import type { Metadata } from 'next'
import { HowItWorksGuide } from '@/components/how-it-works-guide'

export const metadata: Metadata = {
  title: 'How it works | VerifiedRent Ghana',
  description: 'See how VerifiedRent Ghana helps landlords build trust and tenants find homes with confidence.',
}

export default function HowItWorksPage() {
  return <HowItWorksGuide />
}
