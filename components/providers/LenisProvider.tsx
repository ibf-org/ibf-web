'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis exactly as requested
    const lenis = new Lenis({ 
      lerp: 0.08, 
      smoothWheel: true 
    })
    
    function raf(time: number) { 
      lenis.raf(time); 
      requestAnimationFrame(raf) 
    }
    requestAnimationFrame(raf)
    
    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
