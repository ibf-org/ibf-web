'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rocket, LayoutDashboard, FolderOpen, MessageSquare, User, GraduationCap, Search, FileText, Settings } from 'lucide-react'

interface SidebarProps {
  role: 'founder' | 'student'
}

const founderLinks = [
  { href: '/founder/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/founder/projects', icon: FolderOpen, label: 'My Projects' },
  { href: '/chat', icon: MessageSquare, label: 'Community Chat' },
]

const studentLinks = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/discover', icon: Search, label: 'Browse Projects' },
  { href: '/student/applications', icon: FileText, label: 'My Applications' },
  { href: '/chat', icon: MessageSquare, label: 'Community Chat' },
  { href: '/student/profile/edit', icon: User, label: 'Edit Profile' },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const links = role === 'founder' ? founderLinks : studentLinks

  return (
    <aside className="sidebar">
      {/* Role badge */}
      <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
        role === 'founder'
          ? 'border-violet-600/20 bg-violet-600/10'
          : 'border-cyan-500/20 bg-cyan-500/10'
      }`}>
        {role === 'founder'
          ? <Rocket size={16} className="text-violet-500" />
          : <GraduationCap size={16} className="text-cyan-400" />}
        <span className={`text-[13px] font-semibold ${role === 'founder' ? 'text-violet-400' : 'text-cyan-400'}`}>
          {role === 'founder' ? 'Founder Space' : 'Student Space'}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(href))
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto border-t border-[#1e1e3a] pt-4">
        <Link href="/settings" className="sidebar-link">
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
