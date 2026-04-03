'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Inbox, 
  Users, 
  Building2, 
  User as UserIcon,
  Bell,
  Menu,
  X,
  Zap,
  MessageSquare
} from 'lucide-react'
import { NotificationsProvider } from '@/components/shared/NotificationsProvider'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/founder/dashboard' },
  { icon: FolderOpen, label: 'My Projects', href: '/founder/projects' },
  { icon: Inbox, label: 'Applications', href: '/founder/applications' },
  { icon: Users, label: 'Team Members', href: '/founder/team' },
  { icon: Building2, label: 'My Startup', href: '/founder/startup' },
  { icon: MessageSquare, label: 'Community', href: '/founder/community' },
  { icon: UserIcon, label: 'My Profile', href: '/founder/profile/edit' },
]

export default function FounderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Automatically derive top bar title from path
  const getPageTitle = () => {
    if (pathname.includes('/projects/new')) return 'Create Project'
    if (pathname.includes('/projects/')) return 'Project Details'
    if (pathname.includes('/dashboard')) return 'Dashboard'
    if (pathname.includes('/projects')) return 'My Projects'
    if (pathname.includes('/applications')) return 'Applications'
    if (pathname.includes('/team')) return 'Team Members'
    if (pathname.includes('/startup')) return 'My Startup'
    if (pathname.includes('/community')) return 'Community Chat'
    if (pathname.includes('/profile')) return 'My Profile'
    return 'Founder Space'
  }

  // Effect to close mobile sidebar on navigation
  useEffect(() => {
    // eslint-disable-next-line
    setSidebarOpen(false)
  }, [pathname])

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-white font-sans">
      {/* TOP SECTION */}
      <div className="flex items-center gap-3 border-b border-ibf-border px-4 py-5">
        <Link href="/founder/dashboard" className="flex items-center gap-1 font-sans text-[18px] font-extrabold text-ibf-heading tracking-tight no-underline">
          <Zap size={18} className="text-ibf-primary" />
          IBF<span className="h-1.5 w-1.5 rounded-full bg-ibf-primary"></span>
        </Link>
        <div className="badge badge-founder ml-auto">
          Founder Space
        </div>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
                isActive
                  ? 'bg-ibf-primary-light font-bold text-ibf-primary'
                  : 'text-ibf-muted hover:bg-ibf-surface hover:text-ibf-body'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-ibf-primary' : 'text-ibf-muted'} />
              <span className="font-sans text-[14px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* BOTTOM SECTION */}
      <div className="sticky bottom-0 border-t border-ibf-border bg-white p-4">
        <div className="flex items-center gap-3">
          <UserButton 
            appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8 rounded-full' } }} 
          />
          {isLoaded && user && (
            <div className="flex flex-col min-w-0">
              <span className="truncate font-sans text-[13px] font-bold text-ibf-heading">
                {user.fullName || user.username || 'User'}
              </span>
              <span className="font-sans text-[11px] font-semibold text-ibf-muted">Founder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen bg-ibf-bg font-sans">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="fixed bottom-0 left-0 top-0 hidden w-[260px] border-r border-ibf-border bg-white lg:block z-40 transition-transform">
          {renderSidebarContent()}
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-ibf-heading/20 backdrop-blur-sm transition-opacity" 
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute bottom-0 left-0 top-0 w-[260px] bg-white shadow-xl transition-transform">
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* MAIN LAYOUT WRAPPER */}
        <div className="flex flex-1 flex-col lg:pl-[260px]">
          
          {/* TOP BAR */}
          <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-ibf-border bg-white/95 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-ibf-heading lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
              <h1 className="font-sans text-[18px] font-bold text-ibf-heading tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-5">
              <button title="Notifications" className="relative text-ibf-muted hover:text-ibf-heading transition-colors">
                <Bell size={20} />
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-ibf-accent border border-white"></span>
              </button>
              
              <Link
                href="/founder/projects/new"
                className="btn-primary px-[16px] py-[8px] text-[13px] shadow-sm hidden sm:flex"
              >
                New Project +
              </Link>

              {/* Mobile quick create */}
              <Link
                href="/founder/projects/new"
                className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full bg-ibf-primary text-white"
              >
                +
              </Link>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-4 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </NotificationsProvider>
  )
}
