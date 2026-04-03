'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'

const appearance = {
  variables: {
    colorPrimary: '#6B4FD8',
    colorBackground: '#FAFAF7',
    colorText: '#1A1208',
    colorTextSecondary: '#9A8E7E',
    colorInputBackground: '#ffffff',
    colorInputText: '#1A1208',
    borderRadius: '12px',
    colorDanger: '#ef4444',
  },
  elements: {
    card: 'shadow-[0_4px_40px_rgba(26,18,8,0.06)] border border-[#E8E5DE] rounded-[24px]',
    formButtonPrimary: 'font-sans font-bold shadow-sm',
    socialButtonsBlockButton: 'border border-[#E8E5DE] bg-white font-sans font-semibold text-[#1A1208]',
    formFieldInput: 'border-[#E8E5DE] focus:border-[#6B4FD8] focus:ring-[#6B4FD8] font-sans h-10',
    formFieldLabel: 'font-sans font-semibold text-[13px] text-[#1A1208]',
    headerTitle: 'font-serif italic text-3xl text-center tracking-tight',
    headerSubtitle: 'font-sans font-light',
  }
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFAF7] font-sans">
      
      {/* LEFT: Branding & Graphic Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#6B4FD8] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#8B5CF6] rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-[#5B21B6] rounded-full blur-[80px] opacity-40"></div>

        <div className="relative z-10">
          <Link href="/" className="font-sans text-[24px] font-extrabold text-white no-underline">
            IBF<span className="text-white">.</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="font-serif italic text-[56px] leading-[1.05] text-white tracking-tight mb-6">
            Welcome back to the<br />build zone.
          </h1>
          <p className="font-sans text-[16px] text-white/80 font-light max-w-md leading-relaxed">
            Ready to continue building your team or finding your next big project? Let's get you in.
          </p>
        </motion.div>
      </div>

      {/* RIGHT: Clerk Auth Core */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[#FAFAF7]">
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
