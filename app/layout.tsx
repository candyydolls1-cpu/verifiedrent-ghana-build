import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { BackgroundLogo } from '@/components/background-logo'
import './globals.css'

export const metadata: Metadata = {
  title: 'VerifiedRent Ghana | Find home with confidence',
  description: 'Discover trusted, verified rental properties across Ghana.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="bmJa7dLCmToyxdPooUvi0Qe0vC0o5jj01UDupOjlUew" />
      </head>
      <body className="antialiased">
        <BackgroundLogo />
        <main className="relative z-10">{children}</main>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
