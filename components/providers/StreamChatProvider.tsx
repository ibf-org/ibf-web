'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react'
import { StreamChat } from 'stream-chat'

// ─── Context ─────────────────────────────────────────────────────────────────

interface StreamChatContextType {
  client: StreamChat | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  currentUserId: string | null
  reconnect: () => void
}

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  isConnected: false,
  isLoading: true,
  error: null,
  currentUserId: null,
  reconnect: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StreamChatProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Refs survive re-renders without triggering them
  const clientRef = useRef<StreamChat | null>(null)
  const connectAttempts = useRef(0)
  const unmounted = useRef(false)

  const connect = useCallback(async () => {
    // Skip if already connected
    if (clientRef.current?.userID) return

    try {
      if (!unmounted.current) {
        setIsLoading(true)
        setError(null)
      }

      // Fetch a short-lived token from our secure API
      const res = await fetch('/api/chat/token', { credentials: 'include' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Token fetch failed (${res.status})`)
      }
      const { token, userId, userName, userImage } = await res.json()

      if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
        throw new Error('NEXT_PUBLIC_STREAM_API_KEY is not configured')
      }

      // Singleton — safe to call multiple times
      const chatClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY,
        undefined,
        { timeout: 10000 }
      )

      // If the singleton is already connected as a DIFFERENT user, disconnect first
      if (chatClient.userID && chatClient.userID !== userId) {
        await chatClient.disconnectUser()
      }

      // Only call connectUser once
      if (!chatClient.userID) {
        await chatClient.connectUser(
          { id: userId, name: userName, image: userImage || '' },
          token
        )
      }

      if (unmounted.current) {
        // Component unmounted while we were connecting — clean up immediately
        await chatClient.disconnectUser().catch(console.error)
        return
      }

      clientRef.current = chatClient
      setClient(chatClient)
      setCurrentUserId(userId)
      setIsConnected(true)
      connectAttempts.current = 0
    } catch (err: unknown) {
      console.error('[StreamChatProvider] connect error:', err)
      if (!unmounted.current) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage || 'Failed to connect to chat')
        setIsConnected(false)
      }

      // Exponential backoff — max 3 attempts (1s, 2s, 4s)
      connectAttempts.current++
      if (connectAttempts.current < 3 && !unmounted.current) {
        const delay = Math.pow(2, connectAttempts.current) * 1000
        setTimeout(connect, delay)
      }
    } finally {
      if (!unmounted.current) setIsLoading(false)
    }
  }, []) // stable reference — no deps

  // ── Mount / Unmount ──
  useEffect(() => {
    unmounted.current = false
    connect()

    return () => {
      unmounted.current = true
      if (clientRef.current?.userID) {
        clientRef.current.disconnectUser().catch(console.error)
        clientRef.current = null
      }
      // Don't call setClient etc — component is unmounting
    }
  }, [connect])

  // ── Tab visibility — reconnect if tab was hidden and WS dropped ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !clientRef.current?.userID) {
        connectAttempts.current = 0
        connect()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [connect])

  // ── Online / offline ──
  useEffect(() => {
    const handleOnline = () => {
      if (!clientRef.current?.userID) {
        connectAttempts.current = 0
        connect()
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [connect])

  return (
    <StreamChatContext.Provider
      value={{
        client,
        isConnected,
        isLoading,
        error,
        currentUserId,
        reconnect: () => {
          connectAttempts.current = 0
          connect()
        },
      }}
    >
      {children}
    </StreamChatContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStreamChat = () => useContext(StreamChatContext)
