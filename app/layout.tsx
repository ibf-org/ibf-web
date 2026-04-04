import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { MotionProvider } from '@/components/providers/MotionProvider'
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
        <body suppressHydrationWarning className="bg-ibf-bg text-ibf-body font-['Bricolage_Grotesque',sans-serif] antialiased">
          <LenisProvider>
            <StreamChatProvider>
              <Navbar />
              <MotionProvider>
                {children}
              </MotionProvider>
            </StreamChatProvider>
          </LenisProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { 
                background: 'white', 
                color: 'var(--ibf-heading)', 
                border: '1.5px solid var(--ibf-border)',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: '0 4px 24px rgba(26,18,8,0.10)',
                maxWidth: '360px',
                minWidth: '280px',
                fontFamily: "'Bricolage Grotesque', sans-serif"
              },
              success: { 
                duration: 4000,
                style: { borderLeft: '3px solid #22C55E' },
                iconTheme: { primary: '#22C55E', secondary: 'white' } 
              },
              error: { 
                duration: 6000,
                style: { borderLeft: '3px solid #EF4444' },
                iconTheme: { primary: '#EF4444', secondary: 'white' } 
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
