import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import { StreamChatProvider } from '@/components/providers/StreamChatProvider'
import Navbar from '@/components/shared/Navbar'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'IBF — Innovators Bridge Foundry',
  description: 'Connecting Founders, Students & Innovators. Find your team, join a startup, build the future.',
  keywords: ['startup', 'founders', 'students', 'innovation', 'tech', 'collaboration'],
  openGraph: {
    title: 'IBF — Innovators Bridge Foundry',
    description: 'Connecting Founders, Students & Innovators.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body suppressHydrationWarning className="bg-ibf-bg text-ibf-body font-sans antialiased">
          <LenisProvider>
            <StreamChatProvider>
              <Navbar />
              {children}
            </StreamChatProvider>
          </LenisProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#FAFAF7', color: '#1A1208', border: '1px solid #E8E5DE' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#FAFAF7' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#FAFAF7' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
