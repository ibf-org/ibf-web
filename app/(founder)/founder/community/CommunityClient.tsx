'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Hash, Users, Sparkles, AtSign, Paperclip, Smile, Wifi, WifiOff } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

// ─── Types ─────────────────────────────────────────────────────────────────
interface Message {
  id: string
  channel: string
  author_name: string
  author_id: string
  author_role: 'founder' | 'student' | 'system' | string
  content: string
  created_at: string
}

interface Channel {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

// ─── Constants ──────────────────────────────────────────────────────────────
const CHANNELS: Channel[] = [
  { id: 'general',        name: 'general',        description: 'Open discussion for everyone',       icon: <Hash size={14} /> },
  { id: 'founder-lounge', name: 'founder-lounge', description: 'Founder-only space',                 icon: <Sparkles size={14} /> },
  { id: 'find-talent',    name: 'find-talent',    description: 'Post roles, get applications',       icon: <Users size={14} /> },
  { id: 'introductions',  name: 'introductions',  description: 'Say hello to the community',         icon: <AtSign size={14} /> },
]

// ─── Helpers ────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function AvatarBubble({ name, role }: { name: string; role: string }) {
  const bg =
    role === 'founder' ? 'bg-[var(--ibf-primary)]' :
    role === 'system'  ? 'bg-[#F59E0B]' : 'bg-[var(--ibf-secondary)]'
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${bg} font-['Bricolage_Grotesque',sans-serif] text-[11px] font-bold text-ibf-heading select-none`}>
      {role === 'system' ? '⚡' : getInitials(name)}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles =
    role === 'founder' ? 'bg-[var(--ibf-primary-light)] text-[var(--ibf-primary)]' :
    role === 'system'  ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#CCFBF1] text-[#0F766E]'
  return (
    <span className={`font-['Bricolage_Grotesque',sans-serif] text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 ${styles}`}>
      {role}
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RealtimeCommunityClient({ userRole = 'student' }: { userRole?: 'founder' | 'student' }) {
  const { user } = useUser()
  const [activeChannel, setActiveChannel] = useState('general')
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<string>(activeChannel)
  const realtimeRef = useRef<ReturnType<typeof supabaseBrowser.channel> | null>(null)

  channelRef.current = activeChannel

  // Scroll to bottom when messages change or channel switches
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesByChannel, activeChannel])

  // Load initial messages for a channel
  const loadMessages = useCallback(async (channel: string) => {
    setLoading(true)
    const { data, error } = await supabaseBrowser
      .from('community_messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .limit(80)

    if (!error && data) {
      setMessagesByChannel(prev => ({ ...prev, [channel]: data as Message[] }))
    }
    setLoading(false)
  }, [])

  // Subscribe to Supabase Realtime for new messages
  useEffect(() => {
    // Clean up any previous subscription
    if (realtimeRef.current) {
      supabaseBrowser.removeChannel(realtimeRef.current)
    }

    const channel = supabaseBrowser
      .channel('community-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          const msg = payload.new as Message
          setMessagesByChannel(prev => ({
            ...prev,
            [msg.channel]: [...(prev[msg.channel] || []), msg]
          }))
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    realtimeRef.current = channel

    return () => {
      supabaseBrowser.removeChannel(channel)
    }
  }, [])

  // Load messages when channel changes
  useEffect(() => {
    if (!messagesByChannel[activeChannel]) {
      loadMessages(activeChannel)
    }
  }, [activeChannel, loadMessages, messagesByChannel])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    const displayName = user?.fullName || user?.username || 'Anonymous'
    const authorId = user?.id || 'anon'

    setSending(true)
    const { error } = await supabaseBrowser
      .from('community_messages')
      .insert({
        channel: activeChannel,
        author_name: displayName,
        author_id: authorId,
        author_role: userRole,
        content: text,
      })

    if (error) {
      toast.error('Failed to send message. Try again.')
      console.error('Send error:', error)
    } else {
      setInput('')
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const messages = messagesByChannel[activeChannel] || []
  const currentChannel = CHANNELS.find(c => c.id === activeChannel)

  return (
    <div className="flex h-[calc(100vh-64px-80px)] min-h-[500px] overflow-hidden rounded-2xl border border-[var(--ibf-border)] bg-white shadow-sm">

      {/* ── Channel Sidebar ── */}
      <div className="relative w-[220px] flex-shrink-0 border-r border-[var(--ibf-border)] bg-[var(--ibf-bg)]">
        <div className="border-b border-[var(--ibf-border)] p-4">
          <div className="flex items-center justify-between">
            <p className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-bold uppercase tracking-widest text-ibf-muted">Channels</p>
            <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-['Bricolage_Grotesque',sans-serif] text-[10px] font-bold ${connected ? 'bg-[var(--ibf-success-bg)] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
              {connected ? <Wifi size={9} /> : <WifiOff size={9} />}
              {connected ? 'Live' : 'Connecting...'}
            </div>
          </div>
        </div>

        <nav className="p-2">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all font-['Bricolage_Grotesque',sans-serif] text-[13px] ${
                activeChannel === ch.id
                  ? 'bg-[var(--ibf-primary-light)] font-semibold text-[#5B21B6]'
                  : 'text-[#6B6054] hover:bg-[#F0EDE8] hover:text-ibf-heading'
              }`}
            >
              <span className={activeChannel === ch.id ? 'text-[var(--ibf-primary)]' : 'text-ibf-muted'}>
                {ch.icon}
              </span>
              <span className="flex-1 truncate">{ch.name}</span>
              {messagesByChannel[ch.id] && (
                <span className={`font-['Bricolage_Grotesque',sans-serif] text-[10px] font-bold ${activeChannel === ch.id ? 'text-[var(--ibf-primary)]' : 'text-ibf-hint'}`}>
                  {messagesByChannel[ch.id].length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Current user pill at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--ibf-border)] bg-[var(--ibf-bg)] p-3">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--ibf-primary-light)] px-3 py-2">
            <AvatarBubble name={user?.fullName || 'You'} role={userRole} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-['Bricolage_Grotesque',sans-serif] text-[12px] font-semibold text-[#5B21B6]">
                {user?.fullName || user?.username || 'You'}
              </p>
              <p className="font-['Bricolage_Grotesque',sans-serif] text-[10px] capitalize text-[#7C3AED]">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Channel Header */}
        <div className="flex-shrink-0 flex items-center gap-3 border-b border-[var(--ibf-border)] px-6 py-4">
          <span className="text-[var(--ibf-primary)]">{currentChannel?.icon}</span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[15px] font-bold text-ibf-heading">#{currentChannel?.name}</h2>
            <p className="font-['Bricolage_Grotesque',sans-serif] text-[12px] text-ibf-muted">{currentChannel?.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--ibf-border)] bg-[var(--ibf-bg)] px-3 py-1.5">
            <Users size={12} className="text-ibf-muted" />
            <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-semibold text-ibf-muted">{messages.length} messages</span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--ibf-border)] border-t-[var(--ibf-primary)]" />
                <p className="font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-muted">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ibf-primary-light)]">
                <span className="text-[28px]">💬</span>
              </div>
              <p className="font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold text-ibf-heading">No messages yet</p>
              <p className="font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-muted">Be the first to say something in #{currentChannel?.name}!</p>
            </div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <AvatarBubble name={msg.author_name} role={msg.author_role} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className={`font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold ${
                          msg.author_role === 'founder' ? 'text-[#5B21B6]' :
                          msg.author_role === 'system'  ? 'text-[#B45309]' : 'text-[#0F766E]'
                        }`}>
                          {msg.author_name}
                        </span>
                        <RoleBadge role={msg.author_role} />
                        <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-hint">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] leading-relaxed text-[#3D3429] break-words">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 border-t border-[var(--ibf-border)] bg-white p-4">
          <div className={`flex items-center gap-3 rounded-xl border bg-[var(--ibf-bg)] px-4 py-3 transition-all ${connected ? 'border-[var(--ibf-border)] focus-within:border-[#C4B5FD] focus-within:ring-2 focus-within:ring-[var(--ibf-primary-light)]' : 'border-[#FCA5A5] opacity-70'}`}>
            <button aria-label="Attach file" className="text-ibf-muted hover:text-ibf-heading transition-colors flex-shrink-0">
              <Paperclip size={16} />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? `Message #${currentChannel?.name}` : 'Connecting to live chat...'}
              disabled={!connected || sending}
              className="flex-1 bg-transparent font-['Bricolage_Grotesque',sans-serif] text-[14px] text-ibf-heading placeholder:text-ibf-hint focus:outline-none disabled:opacity-50"
            />
            <button aria-label="Emoji" className="text-ibf-muted hover:text-ibf-heading transition-colors flex-shrink-0">
              <Smile size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected || sending}
              aria-label="Send message"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--ibf-primary)] text-ibf-heading transition-all hover:bg-[#5B21B6] disabled:bg-[var(--ibf-border)] disabled:text-ibf-hint active:scale-95"
            >
              {sending ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
          <p className="mt-2 text-center font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-hint">
            <kbd className="rounded border border-[var(--ibf-border)] px-1 font-mono text-[10px]">Enter</kbd> to send · Real-time chat powered by Supabase
          </p>
        </div>
      </div>
    </div>
  )
}
