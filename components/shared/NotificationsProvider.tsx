'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { buildNotificationMessage } from '@/lib/notifications'

interface Notification {
  id: string
  user_id: string
  type: string
  payload: Record<string, unknown>
  is_read: boolean
  created_at: string
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: async () => {},
  markAllRead: async () => {},
})

export function useNotifications() {
  return useContext(NotificationsContext)
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const channelRef = useRef<ReturnType<typeof supabaseBrowser.channel> | null>(null)

  // Fetch user's Supabase ID from clerk_id for the realtime filter
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !user) return

    // Resolve Supabase user_id from clerk_id
    supabaseBrowser
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.id) setSupabaseUserId(data.id)
      })
  }, [isLoaded, user])

  // Fetch initial notifications
  useEffect(() => {
    if (!supabaseUserId) return

    supabaseBrowser
      .from('notifications')
      .select('*')
      .eq('user_id', supabaseUserId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[])
      })
  }, [supabaseUserId])

  // Subscribe to realtime inserts
  useEffect(() => {
    if (!supabaseUserId) return

    // Clean up previous channel
    if (channelRef.current) {
      supabaseBrowser.removeChannel(channelRef.current)
    }

    const channel = supabaseBrowser
      .channel(`notifications:${supabaseUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabaseUserId}`,
        },
        (payload) => {
          const n = payload.new as Notification
          setNotifications((prev) => [n, ...prev])

          // Show a toast
          const msg = buildNotificationMessage(
            n.type as Parameters<typeof buildNotificationMessage>[0],
            n.payload as Parameters<typeof buildNotificationMessage>[1]
          )
          toast(msg, {
            icon: '🔔',
            style: {
              background: '#111827',
              color: '#f0f0ff',
              border: '1px solid #1e2a3a',
            },
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabaseBrowser.removeChannel(channel)
    }
  }, [supabaseUserId])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    await supabaseBrowser
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  }, [])

  const markAllRead = useCallback(async () => {
    if (!supabaseUserId) return
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabaseBrowser
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', supabaseUserId)
      .eq('is_read', false)
  }, [supabaseUserId])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}
