'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, FolderKanban, Inbox, Users, User, Search, MessageSquare } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const isFounder = pathname.startsWith('/founder')
  const isStudent = pathname.startsWith('/student')

  // Don't render on general pages or landing page
  if (!isFounder && !isStudent) return null

  const founderLinks = [
    { href: '/founder/dashboard', icon: Home, label: 'Home' },
    { href: '/founder/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/founder/applications', icon: Inbox, label: 'Applications' },
    { href: '/founder/team', icon: Users, label: 'Team' },
    { href: `/u/${user?.username || ''}`, icon: User, label: 'Profile' },
  ]

  const studentLinks = [
    { href: '/student/dashboard', icon: Home, label: 'Home' },
    { href: '/student/discover', icon: Search, label: 'Discover' },
    { href: '/student/applications', icon: Inbox, label: 'Applied' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: `/u/${user?.username || ''}`, icon: User, label: 'Profile' },
  ]

  const links = isFounder ? founderLinks : studentLinks
  const activeColor = isFounder ? 'var(--ibf-primary)' : 'var(--ibf-secondary)'
  const activeBg = isFounder ? 'var(--ibf-primary-light)' : 'var(--ibf-secondary-light)'

  return (
    <nav className="mobile-nav safe-bottom">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] relative transition-colors ${
              isActive ? '' : 'text-ibf-hint'
            }`}
            style={{ color: isActive ? activeColor : undefined }}
          >
            {isActive && (
              <div 
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: activeColor }}
              />
            )}
            <div 
              className={`flex flex-col items-center justify-center w-full h-full pt-1 ${
                isActive ? 'bg-opacity-20' : ''
              }`}
              style={{ backgroundColor: isActive ? activeBg : 'transparent' }}
            >
              <link.icon size={22} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-['Bricolage_Grotesque'] font-medium">
                {link.label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
