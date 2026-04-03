'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  LayoutDashboard, FolderOpen, Inbox, Users, User, Zap, Rocket, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/founder/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/founder/projects',     icon: FolderOpen,      label: 'My Projects' },
  { href: '/founder/applications', icon: Inbox,           label: 'Applications' },
  { href: '/founder/team',         icon: Users,           label: 'Team' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function FounderSidebar({ open, onClose }: Props) {
  const pathname = usePathname()
  const { user } = useUser()
  const username = user?.username || user?.id || ''

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-[#1e2a3a]
        bg-[#111827] transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo + close (mobile) */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-[#1e2a3a]">
          <Link href="/founder/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
              <Zap size={16} color="white" fill="white" />
            </div>
            <span className="bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text font-display text-lg font-bold text-transparent">
              IBF
            </span>
          </Link>

          {/* Role badge + mobile close */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-400">
              <Rocket size={10} /> Founder
            </span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-[#1e2a3a] hover:text-gray-300 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/founder/dashboard' && pathname?.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium no-underline
                    transition-all duration-150
                    ${active
                      ? 'border-l-2 border-blue-500 bg-[#1e2d4a] pl-[10px] text-blue-400'
                      : 'border-l-2 border-transparent text-gray-400 hover:bg-[#1e2d4a] hover:text-gray-200'
                    }
                  `}
                >
                  <Icon size={16} className={active ? 'text-blue-400' : 'text-gray-500'} />
                  {label}
                </Link>
              )
            })}

            {/* Profile link — dynamic username */}
            <Link
              href={`/u/${username}`}
              onClick={onClose}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium no-underline
                transition-all duration-150 border-l-2
                ${pathname?.startsWith('/u/')
                  ? 'border-blue-500 bg-[#1e2d4a] pl-[10px] text-blue-400'
                  : 'border-transparent text-gray-400 hover:bg-[#1e2d4a] hover:text-gray-200'
                }
              `}
            >
              <User size={16} className={pathname?.startsWith('/u/') ? 'text-blue-400' : 'text-gray-500'} />
              Profile
            </Link>
          </div>
        </nav>

        {/* Bottom user section */}
        <div className="border-t border-[#1e2a3a] px-4 py-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-gray-200">
                {user?.fullName || user?.username || 'Founder'}
              </div>
              <div className="text-[11px] text-violet-400">Founder</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
