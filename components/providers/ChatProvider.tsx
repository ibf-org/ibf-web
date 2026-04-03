'use client'

import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { Chat } from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'
import { Loader2 } from 'lucide-react'

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || ''
const chatClient = StreamChat.getInstance(apiKey)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [clientReady, setClientReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const initChat = async () => {
      try {
        if (!apiKey) throw new Error('Stream API key is missing (NEXT_PUBLIC_STREAM_API_KEY)')
        
        const res = await fetch('/api/chat/token')
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch chat token')

        // Wait for connect
        await chatClient.connectUser(
          { id: data.userId, name: data.userName },
          data.token
        )

        if (isMounted) setClientReady(true)
      } catch (err: unknown) {
        console.error('Chat initialization failed:', err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (isMounted) setError(errorMessage)
      }
    }

    if (!chatClient.userID) {
      initChat()
    } else {
      setClientReady(true)
    }

    return () => {
      isMounted = false
      // Explicitly ignoring disconnect on unmount cleanly handling Fast Refresh in dev avoiding connection resets aggressively 
    }
  }, [])

  if (error) return <div className="flex h-screen flex-col items-center justify-center p-4 bg-[#0C0F14]"><div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm font-semibold text-red-500">{error}</div></div>
  if (!clientReady) return <div className="flex h-screen items-center justify-center bg-[#0C0F14]"><Loader2 className="animate-spin text-teal-500" size={32} /></div>

  return (
    <Chat client={chatClient} theme="str-chat__theme-dark">
      {children}
    </Chat>
  )
}
