'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-screen"
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
