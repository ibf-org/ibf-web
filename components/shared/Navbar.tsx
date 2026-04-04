'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    // Initialize state
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Autohide the Landing Navbar globally when inside Dashboards
  if (
    pathname?.startsWith('/founder') ||
    pathname?.startsWith('/student') ||
    pathname?.startsWith('/startup')
  ) {
    return null
  }

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
          scrolled 
            ? 'h-[56px] shadow-[0_1px_20px_rgba(26,18,8,0.06)] bg-[rgba(250,250,247,0.92)] border-b border-[var(--ibf-border)] backdrop-blur-[12px]' 
            : 'h-[64px] bg-[rgba(250,250,247,0.92)] border-b border-[var(--ibf-border)] backdrop-blur-[12px]'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* LEFT: Header Wordmark */}
          <Link href="/" className="flex flex-col justify-center items-start">
            <div className={`font-['Bricolage_Grotesque',sans-serif] font-extrabold text-ibf-heading transition-all duration-300 ${scrolled ? 'text-[18px]' : 'text-[20px]'}`}>
              IBF<span className="text-[var(--ibf-primary)]">.</span>
            </div>
            {/* The subtitle disappears smoothly or stays hidden when scrolled to fit the 56px height */}
            <div 
              className={`font-['Bricolage_Grotesque',sans-serif] text-[10px] text-ibf-hint transition-all duration-300 origin-topLeft overflow-hidden ${
                scrolled ? 'h-0 opacity-0 mt-0' : 'h-3 opacity-100 mt-[2px]'
              }`}
            >
              Innovators Bridge Foundry
            </div>
          </Link>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 translate-y-[2px]">
            <Link href="/for-founders" className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[13px] text-ibf-muted hover:text-ibf-heading transition-colors duration-150">
              For founders
            </Link>
            <Link href="/for-students" className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[13px] text-ibf-muted hover:text-ibf-heading transition-colors duration-150">
              For students
            </Link>
            <Link href="/projects" className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[13px] text-ibf-muted hover:text-ibf-heading transition-colors duration-150">
              Projects
            </Link>
            <Link href="/community" className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[13px] text-ibf-muted hover:text-ibf-heading transition-colors duration-150">
              Community
            </Link>
          </div>

          {/* RIGHT: User Actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/sign-in" className="font-['Bricolage_Grotesque',sans-serif] font-normal text-[13px] text-ibf-muted hover:text-ibf-heading transition-colors duration-150">
              Sign in
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-[var(--ibf-primary)] text-ibf-heading rounded-[8px] px-[20px] py-[9px] font-['Bricolage_Grotesque',sans-serif] font-semibold text-[13px] hover:bg-[#5B3FC8] transition-colors duration-200 shadow-sm hover:shadow"
            >
              Join free &rarr;
            </Link>
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="text-ibf-heading p-2 pr-0 flex flex-col gap-[5px]" aria-label="Open menu">
              {/* Minimal 3-line hamburger */}
              <span className="block h-[2px] w-6 bg-[var(--ibf-heading)] rounded-full"></span>
              <span className="block h-[2px] w-6 bg-[var(--ibf-heading)] rounded-full"></span>
              <span className="block h-[2px] w-6 bg-[var(--ibf-heading)] rounded-full"></span>
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE FULL-SCREEN OVERLAY MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[var(--ibf-bg)] flex flex-col px-6 py-6"
          >
            {/* Overlay Header */}
            <div className="flex justify-between items-center w-full">
              <Link href="/" className="font-['Bricolage_Grotesque',sans-serif] font-extrabold text-ibf-heading text-[20px]">
                IBF<span className="text-[var(--ibf-primary)]">.</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="text-ibf-heading p-2 pr-0 opacity-70 hover:opacity-100 transition-opacity">
                <X size={32} strokeWidth={1.5} />
              </button>
            </div>

            {/* Huge Serifs Navigation */}
            <div className="flex flex-col items-center justify-center gap-8 flex-1">
              <Link href="/for-founders" onClick={() => setMobileMenuOpen(false)} className="font-['Instrument_Serif',serif] italic italic text-[42px] tracking-tight text-ibf-heading">
                For founders
              </Link>
              <Link href="/for-students" onClick={() => setMobileMenuOpen(false)} className="font-['Instrument_Serif',serif] italic italic text-[42px] tracking-tight text-ibf-heading">
                For students
              </Link>
              <Link href="/projects" onClick={() => setMobileMenuOpen(false)} className="font-['Instrument_Serif',serif] italic italic text-[42px] tracking-tight text-ibf-heading">
                Projects
              </Link>
              <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="font-['Instrument_Serif',serif] italic italic text-[42px] tracking-tight text-ibf-heading">
                Community
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="mt-auto flex flex-col gap-3 w-full pb-8">
              <Link 
                href="/sign-in" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center border border-[var(--ibf-border)] bg-white rounded-xl py-4 font-['Bricolage_Grotesque',sans-serif] font-semibold text-[16px] text-ibf-heading"
              >
                Sign in
              </Link>
              <Link 
                href="/sign-up" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[var(--ibf-primary)] text-ibf-heading rounded-xl py-4 font-['Bricolage_Grotesque',sans-serif] font-semibold text-[16px] shadow-sm"
              >
                Join free &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
