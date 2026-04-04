'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'

const appearance = {
  variables: {
    colorPrimary: 'var(--ibf-primary)',
    colorBackground: 'var(--ibf-bg)',
    colorText: 'var(--ibf-heading)',
    colorTextSecondary: 'var(--ibf-muted)',
    colorInputBackground: 'white',
    colorInputText: 'var(--ibf-heading)',
    borderRadius: '12px',
    colorDanger: '#ef4444',
  },
  elements: {
    card: 'shadow-[0_4px_40px_rgba(26,18,8,0.06)] border border-[var(--ibf-border)] rounded-[24px]',
    formButtonPrimary: `font-['Bricolage_Grotesque',sans-serif] font-bold shadow-sm`,
    socialButtonsBlockButton: `border border-[var(--ibf-border)] bg-white font-['Bricolage_Grotesque',sans-serif] font-semibold text-ibf-heading`,
    formFieldInput: `border-[var(--ibf-border)] focus:border-[var(--ibf-primary)] focus:ring-[var(--ibf-primary)] font-['Bricolage_Grotesque',sans-serif] h-10`,
    formFieldLabel: `font-['Bricolage_Grotesque',sans-serif] font-semibold text-[13px] text-ibf-heading`,
    headerTitle: `font-['Instrument_Serif',serif] italic italic text-3xl text-center tracking-tight`,
    headerSubtitle: `font-['Bricolage_Grotesque',sans-serif] font-light`,
  }
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-[var(--ibf-bg)] font-['Bricolage_Grotesque',sans-serif]">
      
      {/* LEFT: Branding & Graphic Panel */}
      <div className="hidden lg:flex w-1/2 bg-[var(--ibf-primary)] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#8B5CF6] rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-[#5B21B6] rounded-full blur-[80px] opacity-40"></div>

        <div className="relative z-10">
          <Link href="/" className="font-['Bricolage_Grotesque',sans-serif] text-[24px] font-extrabold text-ibf-heading no-underline">
            IBF<span className="text-ibf-heading">.</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="font-['Instrument_Serif',serif] italic italic text-[56px] leading-[1.05] text-ibf-heading tracking-tight mb-6">
            Welcome back to the<br />build zone.
          </h1>
          <p className="font-['Bricolage_Grotesque',sans-serif] text-[16px] text-ibf-heading/80 font-light max-w-md leading-relaxed">
            Ready to continue building your team or finding your next big project? Let's get you in.
          </p>
        </motion.div>
      </div>

      {/* RIGHT: Clerk Auth Core */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[var(--ibf-bg)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
        >
          <SignIn appearance={appearance} />
        </motion.div>
      </div>
    </div>
  )
}
