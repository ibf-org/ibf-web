'use client'

import Link from 'next/link'
import { Plus, Menu } from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'

interface Props {
  onMenuClick: () => void
}

export default function FounderTopbar({ onMenuClick }: Props) {


  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-ibf-border bg-ibf-surface/95 px-5 backdrop-blur-md">
      {/* Left: hamburger (mobile) */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md text-ibf-muted hover:bg-ibf-border hover:text-gray-200 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Spacer on desktop */}
      <div className="hidden lg:block" />

      {/* Right: notifications + new project */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* New project button */}
        <Link
          href="/founder/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-ibf-primary px-3.5 py-1.5 text-[13px] font-semibold text-ibf-heading no-underline transition-colors hover:bg-blue-500"
        >
          <Plus size={15} />
          New Project
        </Link>
      </div>
    </header>
  )
}
