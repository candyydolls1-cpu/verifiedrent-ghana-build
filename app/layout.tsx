import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { BackgroundLogo } from '@/components/background-logo'
import './globals.css'

export const metadata: Metadata = {
  title: 'Verified Rentals in Ghana | VerifiedRent Ghana',
  description: 'Browse homes for rent across Ghana and identify verified landlords and properties. Explore rental options by region with VerifiedRent Ghana.',
  verification: {
    google: 'bmJa7dLCmToyxdPooUvi0Qe0vC0o5jj01UDupOjlUew',
  },
  alternates: {
    canonical: 'https://v0-verifiedrentgh.vercel.app/',
  },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'VerifiedRent Ghana', url: 'https://v0-verifiedrentgh.vercel.app/', logo: 'https://v0-verifiedrentgh.vercel.app/verifiedrent-logo.webp' }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'VerifiedRent Ghana', url: 'https://v0-verifiedrentgh.vercel.app/', description: metadata.description }) }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WKLPLMTH');`,
          }}
        />
      </head>
      <body className="antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WKLPLMTH"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <BackgroundLogo />
        <main className="relative z-10">{children}</main>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <a href="https://submitby.ai/project/cf5fc2d3-1ceb-4b1d-8072-55e0cc56d7c7" target="_blank" rel="noopener noreferrer">
          <img src="https://submitby.ai/badge/cf5fc2d3-1ceb-4b1d-8072-55e0cc56d7c7.svg" alt="Verified on SubmitBy.ai" style={{ width: '120px', height: 'auto' }} />
        </a>
      </body>
    </html>
  )
}
