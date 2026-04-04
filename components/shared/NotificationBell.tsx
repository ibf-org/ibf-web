'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, X, User, MessageSquare, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from './NotificationsProvider'
import { buildNotificationMessage } from '@/lib/notifications'

type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'team_joined'

function NotificationIcon({ type }: { type: string }) {
  const cls = 'h-8 w-8 flex items-center justify-center rounded-full shrink-0'
  switch (type as NotificationType) {
    case 'application_accepted':
      return <div className={`${cls} bg-emerald-500/15`}><Check size={15} className="text-emerald-400" /></div>
    case 'application_rejected':
      return <div className={`${cls} bg-red-500/15`}><X size={15} className="text-red-400" /></div>
    case 'application_received':
      return <div className={`${cls} bg-blue-500/15`}><User size={15} className="text-ibf-primary" /></div>
    case 'team_joined':
      return <div className={`${cls} bg-violet-500/15`}><User size={15} className="text-violet-400" /></div>
    default:
      return <div className={`${cls} bg-gray-500/15`}><MessageSquare size={15} className="text-ibf-muted" /></div>
  }
}

function getNotificationHref(type: string, payload: Record<string, unknown>): string {
  switch (type as NotificationType) {
    case 'application_received':
      return payload.projectId ? `/founder/projects/${payload.projectId}/applications` : '/founder/applications'
    case 'application_accepted':
    case 'application_rejected':
      return payload.projectId ? `/student/discover/${payload.projectId}` : '/student/applications'
    case 'team_joined':
      return payload.projectId ? `/founder/projects/${payload.projectId}` : '/founder/dashboard'
    default:
      return '/'
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const recentNotifs = notifications.slice(0, 10)

  const handleClickNotif = async (id: string, type: string, payload: Record<string, unknown>) => {
    await markRead(id)
    setOpen(false)
    router.push(getNotificationHref(type, payload))
  }

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ibf-muted transition-all hover:bg-ibf-surface hover:text-gray-200"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-ibf-heading ring-2 ring-[#0C0F14]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleBackdropClick}
          aria-hidden
        />
      )}

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          id="notifications-popover"
          className="absolute right-0 top-11 z-50 w-[360px] rounded-xl border border-ibf-border bg-ibf-surface shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ibf-border px-4 py-3">
            <span className="text-sm font-semibold text-[#f0f0ff]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-ibf-muted transition hover:bg-ibf-border hover:text-gray-200"
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {recentNotifs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Bell size={28} className="text-gray-600" />
                <p className="text-sm font-medium text-ibf-hint">No notifications yet</p>
                <p className="text-xs text-gray-600">We&apos;ll let you know when something happens</p>
              </div>
            ) : (
              recentNotifs.map((n) => {
                const msg = buildNotificationMessage(
                  n.type as NotificationType,
                  n.payload as Parameters<typeof buildNotificationMessage>[1]
                )
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClickNotif(n.id, n.type, n.payload)}
                    className={`flex w-full items-start gap-3 border-b border-ibf-border/60 px-4 py-3.5 text-left transition-all last:border-0 hover:bg-ibf-border/50 ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1 shrink-0">
                      <div className={`h-2 w-2 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-blue-400'}`} />
                    </div>

                    <NotificationIcon type={n.type} />

                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] leading-snug ${n.is_read ? 'text-ibf-muted' : 'text-[#f0f0ff] font-medium'}`}>
                        {msg}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-600">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
