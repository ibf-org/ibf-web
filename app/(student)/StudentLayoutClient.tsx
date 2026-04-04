'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Compass, FileText, User, MessageSquare, Menu, X, Bell } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { NotificationsProvider } from '@/components/shared/NotificationsProvider'

interface StudentLayoutClientProps {
  children: React.ReactNode
  username: string
  profileCompletion: number // 0 to 100
}

export default function StudentLayoutClient({ children, username, profileCompletion }: StudentLayoutClientProps) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/student/discover', icon: Compass },
    { name: 'My Applications', href: '/student/applications', icon: FileText },
    { name: 'My Profile', href: '/student/profile/edit', icon: User },
    { name: 'Community', href: '/student/community', icon: MessageSquare },
  ]

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen bg-ibf-bg font-['Bricolage_Grotesque',sans-serif]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-ibf-heading/20 backdrop-blur-sm lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-ibf-border bg-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col border-b border-ibf-border px-4 py-5 font-['Bricolage_Grotesque',sans-serif]">
            <div className="flex items-center justify-between">
              <Link href="/student/dashboard" className="flex items-center gap-1 font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading tracking-tight">
                IBF<span className="h-1.5 w-1.5 rounded-full bg-ibf-secondary"></span>
              </Link>
              <button title="Close sidebar" className="text-ibf-muted lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <span className="badge badge-student">
                Student Space
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-['Bricolage_Grotesque',sans-serif] text-[14px] transition-all duration-150 ${
                    isActive 
                      ? 'bg-ibf-secondary-light font-bold text-ibf-secondary' 
                      : 'text-ibf-muted hover:bg-ibf-surface hover:text-ibf-body'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-ibf-secondary' : 'text-ibf-muted'} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="sticky bottom-0 border-t border-ibf-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserButton 
                  appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8 rounded-full' } }} 
                />
                {isLoaded && user && (
                  <div className="flex flex-col">
                    <span className="font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-heading">{user.fullName || "Student"}</span>
                    <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-muted font-medium">Student</span>
                  </div>
                )}
              </div>
              <button title="Notifications" className="relative text-ibf-muted hover:text-ibf-heading transition-colors">
                <Bell size={20} />
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-ibf-accent border border-white"></span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col lg:pl-[260px] min-w-0 transition-all duration-300">
          {/* Mobile Topbar */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-ibf-border bg-white/90 px-4 backdrop-blur-md lg:hidden">
            <Link href="/student/dashboard" className="flex items-center gap-1 font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading">
              IBF<span className="h-1.5 w-1.5 rounded-full bg-ibf-secondary"></span>
            </Link>
            <button title="Open sidebar" className="text-ibf-heading" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden p-6 md:p-10 lg:p-12">
            {children}
          </main>
        </div>
      </div>
    </NotificationsProvider>
  )
}
