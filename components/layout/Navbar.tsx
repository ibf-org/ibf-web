'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const role = user?.unsafeMetadata?.role as string

  const navLink = role === 'founder' ? '/founder/dashboard' : '/student/dashboard'

  return (
    <nav className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b border-ibf-border bg-white/80 px-6 backdrop-blur-md">
      {/* Logo */}
      <Link href={navLink} className="flex shrink-0 items-center gap-2 no-underline">
        <div className="font-['Bricolage_Grotesque',sans-serif] font-extrabold text-ibf-heading text-[20px]">
          IBF<span className="text-[var(--ibf-primary)]">.</span>
        </div>
      </Link>

      {/* Search bar */}
      <div className="relative max-w-[420px] flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ibf-hint" />
        <input
          className="input h-9 pl-9"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search projects, people..."
          onKeyDown={e => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
            }
          }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Navigation links */}
      <div className="flex items-center gap-1">
        {role === 'founder' ? (
          <>
            <NavItem href="/founder/dashboard" active={pathname?.startsWith('/founder/dashboard')} label="Dashboard" />
            <NavItem href="/founder/projects" active={pathname?.startsWith('/founder/projects')} label="Projects" />
          </>
        ) : role === 'student' ? (
          <>
            <NavItem href="/student/dashboard" active={pathname?.startsWith('/student/dashboard')} label="Dashboard" />
            <NavItem href="/student/discover" active={pathname?.startsWith('/student/discover')} label="Discover" />
            <NavItem href="/student/applications" active={pathname?.startsWith('/student/applications')} label="Applications" />
          </>
        ) : null}
        <NavItem href="/chat" active={pathname?.startsWith('/chat')} label="Chat" />
      </div>

      {/* User menu */}
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="flex text-ibf-hint relative">
          <Bell size={20} />
        </Link>
        <UserButton />
      </div>
    </nav>
  )
}

function NavItem({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-[13px] no-underline transition-all duration-150 ${
        active
          ? 'bg-violet-600/10 font-semibold text-violet-400'
          : 'font-medium text-ibf-muted hover:bg-violet-600/5 hover:text-gray-300'
      }`}
    >
      {label}
    </Link>
  )
}
