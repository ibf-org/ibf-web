'use client'

import { m } from 'framer-motion'
import { ReactNode } from 'react'

interface EmptyStateProps {
  headline: string;
  subtext: string;
  action?: ReactNode;
}

export function EmptyState({ headline, subtext, action }: EmptyStateProps) {
  return (
    <m.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <h3 className="display-xl text-ibf-heading mb-4 text-balance max-w-lg mx-auto">
        {headline}
      </h3>
      <p className="body-lg text-ibf-muted mb-8 max-w-sm mx-auto">
        {subtext}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </m.div>
  )
}
