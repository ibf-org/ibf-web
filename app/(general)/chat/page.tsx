'use client'

import { useState, useCallback } from 'react'
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import type { Channel as StreamChannel } from 'stream-chat'
import { useStreamChat } from '@/components/providers/StreamChatProvider'
import { Hash, Lock, ArrowLeft, MessageSquare, RefreshCw, WifiOff } from 'lucide-react'

import 'stream-chat-react/dist/css/v2/index.css'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#FAFAF7]">
      {/* Sidebar shimmer */}
      <div className="w-72 flex-shrink-0 border-r border-[#E8E5DE] bg-white p-4 space-y-6 hidden md:block">
        {[0, 1, 2].map((section) => (
          <div key={section}>
            <div className="h-3 w-24 rounded-full bg-[#E8E5DE] animate-pulse mb-3" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-4 w-4 rounded bg-[#E8E5DE] animate-pulse" />
                <div className="h-3 flex-1 rounded-full bg-[#E8E5DE] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Message area shimmer */}
      <div className="flex flex-1 flex-col">
        <div className="h-14 border-b border-[#E8E5DE] bg-white px-5 flex items-center gap-3">
          <div className="h-4 w-32 rounded-full bg-[#E8E5DE] animate-pulse" />
        </div>
        <div className="flex-1 p-5 space-y-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex items-start gap-3 ${i % 3 === 2 ? 'flex-row-reverse' : ''}`}>
              <div className="h-8 w-8 rounded-full bg-[#E8E5DE] animate-pulse flex-shrink-0" />
              <div className={`space-y-1.5 max-w-sm`}>
                <div className="h-3 w-20 rounded-full bg-[#E8E5DE] animate-pulse" />
                <div className={`h-10 rounded-xl bg-[#E8E5DE] animate-pulse`} style={{ width: `${160 + i * 30}px`, animationDelay: `${i * 100}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Error ───────────────────────────────────────────────────────────────────

function ChatError({ error }: { error: string }) {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAF7]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <WifiOff className="text-red-400" size={28} />
        </div>
        <div>
          <p className="font-sans text-[16px] font-semibold text-[#1A1208]">Chat Unavailable</p>
          <p className="font-sans text-[13px] text-[#9A8E7E] mt-1.5 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl bg-[#6B4FD8] px-5 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-[#5B21B6] transition-colors"
        >
          <RefreshCw size={14} />
          Retry connection
        </button>
      </div>
    </div>
  )
}

// ─── Connecting ──────────────────────────────────────────────────────────────

function ChatConnecting() {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAF7]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-[#EDE8FF] flex items-center justify-center">
            <MessageSquare className="text-[#6B4FD8]" size={24} />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B4FD8] opacity-40" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#6B4FD8]" />
          </span>
        </div>
        <div className="text-center">
          <p className="font-sans text-[14px] font-semibold text-[#1A1208]">Connecting to chat</p>
          <p className="font-sans text-[12px] text-[#9A8E7E] mt-1">Please wait a moment…</p>
        </div>
      </div>
    </div>
  )
}

// ─── Custom Channel Preview ──────────────────────────────────────────────────

function CustomChannelPreview({ channel, onSelect }: { channel: StreamChannel; onSelect: () => void }) {
  const data = channel.data as { isProjectChat?: boolean; name?: string } | undefined
  const isProject = data?.isProjectChat === true
  const name = data?.name || channel.id || 'Channel'
  const lastMsg = channel.state?.messages?.slice(-1)[0]
  const unread = channel.countUnread()

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all hover:bg-[#F4F1EA] group"
    >
      <span className="flex-shrink-0 w-5 flex items-center justify-center text-[#9A8E7E] group-hover:text-[#6B4FD8] transition-colors">
        {isProject ? <Lock size={13} /> : <Hash size={14} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1208] truncate">
          {name.replace(/^#/, '')}
        </p>
        {lastMsg?.text && (
          <p className="text-[11px] text-[#9A8E7E] truncate mt-0.5">{lastMsg.text}</p>
        )}
      </div>
      {unread > 0 && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#6B4FD8] text-white text-[10px] font-bold px-1">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}

// ─── Custom DM Preview ───────────────────────────────────────────────────────

function CustomDMPreview({
  channel,
  currentUserId,
  onSelect,
}: {
  channel: StreamChannel
  currentUserId: string
  onSelect: () => void
}) {
  const members = Object.values(channel.state?.members || {})
  const other = members.find((m) => m.user?.id !== currentUserId)?.user
  const name = (other?.name as string) || 'Unknown'
  const image = other?.image as string | undefined
  const initials = name.slice(0, 2).toUpperCase()
  const lastMsg = channel.state?.messages?.slice(-1)[0]
  const unread = channel.countUnread()
  const isOnline = other?.online

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all hover:bg-[#F4F1EA]"
    >
      <div className="relative flex-shrink-0">
        {image ? (
          <img src={image} alt={name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[#6B4FD8] flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
        )}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1208] truncate">{name}</p>
        {lastMsg?.text && (
          <p className="text-[11px] text-[#9A8E7E] truncate mt-0.5">{lastMsg.text}</p>
        )}
      </div>
      {unread > 0 && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#6B4FD8] text-white text-[10px] font-bold px-1">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}

// ─── Empty chat state ─────────────────────────────────────────────────────────

function EmptyChatArea() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8">
      <div className="h-20 w-20 rounded-3xl bg-[#EDE8FF] flex items-center justify-center">
        <MessageSquare className="text-[#6B4FD8]" size={32} />
      </div>
      <div>
        <p className="font-sans text-[18px] font-semibold text-[#1A1208]">IBF Chat</p>
        <p className="font-sans text-[13px] text-[#9A8E7E] mt-1.5 max-w-xs leading-relaxed">
          Select a community channel, team chat, or direct message from the sidebar to get started
        </p>
      </div>
    </div>
  )
}

// ─── Sidebar Section ─────────────────────────────────────────────────────────

function SidebarSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="px-3 mb-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-[#9A8E7E]">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { client, isConnected, isLoading, error } = useStreamChat()
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'channel'>('list')

  const handleSelectChannel = useCallback((channel: StreamChannel) => {
    setActiveChannel(channel)
    setMobileView('channel')
  }, [])

  if (isLoading) return <ChatSkeleton />
  if (error) return <ChatError error={error} />
  if (!client || !isConnected || !client.userID) return <ChatConnecting />

  const communityFilters = {
    type: 'team',
    id: { $in: ['general', 'for-founders', 'for-students', 'project-ideas', 'tech', 'design', 'intros'] },
  }
  const projectFilters = {
    type: 'messaging',
    isProjectChat: true,
    members: { $in: [client.userID] },
  }
  const dmFilters = {
    type: 'messaging',
    isProjectChat: { $exists: false },
    members: { $in: [client.userID] },
  }

  const sort = [{ last_message_at: -1 as const }]

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#FAFAF7]">
      <Chat client={client} theme="str-chat__theme-light">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          className={`
            w-full md:w-72 flex-shrink-0 bg-white border-r border-[#E8E5DE]
            flex flex-col overflow-hidden
            ${mobileView === 'channel' ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-[#E8E5DE]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#EDE8FF] flex items-center justify-center">
                <MessageSquare size={14} className="text-[#6B4FD8]" />
              </div>
              <span className="font-sans text-[14px] font-bold text-[#1A1208]">IBF Chat</span>
            </div>
          </div>

          {/* Scrollable channel sections */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-thin scrollbar-thumb-[#E8E5DE]">

            {/* Community */}
            <SidebarSection title="Community">
              <ChannelList
                filters={communityFilters}
                sort={sort}
                options={{ limit: 20, watch: true }}
                showChannelSearch={false}
                Preview={(props) =>
                  props.channel ? (
                    <CustomChannelPreview
                      channel={props.channel}
                      onSelect={() => handleSelectChannel(props.channel!)}
                    />
                  ) : null
                }
                EmptyStateIndicator={() => (
                  <p className="px-3 text-[12px] text-[#9A8E7E]">No channels</p>
                )}
              />
            </SidebarSection>

            {/* Team chats */}
            <SidebarSection title="Team chats">
              <ChannelList
                filters={projectFilters}
                sort={sort}
                options={{ limit: 30, watch: true }}
                showChannelSearch={false}
                Preview={(props) =>
                  props.channel ? (
                    <CustomChannelPreview
                      channel={props.channel}
                      onSelect={() => handleSelectChannel(props.channel!)}
                    />
                  ) : null
                }
                EmptyStateIndicator={() => (
                  <p className="px-3 text-[12px] text-[#9A8E7E]">No team chats yet</p>
                )}
              />
            </SidebarSection>

            {/* Direct messages */}
            <SidebarSection title="Direct messages">
              <ChannelList
                filters={dmFilters}
                sort={sort}
                options={{ limit: 20, watch: true, presence: true }}
                showChannelSearch={false}
                Preview={(props) =>
                  props.channel ? (
                    <CustomDMPreview
                      channel={props.channel}
                      currentUserId={client.userID!}
                      onSelect={() => handleSelectChannel(props.channel!)}
                    />
                  ) : null
                }
                EmptyStateIndicator={() => (
                  <p className="px-3 text-[12px] text-[#9A8E7E]">No direct messages</p>
                )}
              />
            </SidebarSection>

          </div>

          {/* Logged in user footer */}
          <div className="border-t border-[#E8E5DE] p-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-[#F5F3FF] px-3 py-2">
              {client.user?.image ? (
                <img
                  src={client.user.image as string}
                  alt={(client.user.name as string) || ''}
                  className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-[#6B4FD8] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {((client.user?.name as string) || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[12px] font-semibold text-[#5B21B6]">
                  {(client.user?.name as string) || 'You'}
                </p>
                <p className="font-sans text-[10px] text-[#7C3AED]">Online</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
            </div>
          </div>
        </aside>

        {/* ── RIGHT: MESSAGE AREA ───────────────────────────────────────── */}
        <main
          className={`
            flex-1 flex flex-col overflow-hidden
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          `}
        >
          {activeChannel ? (
            <Channel channel={activeChannel} key={activeChannel.id}>
              <Window>
                {/* Mobile back button */}
                <div className="flex items-center md:hidden px-4 py-2 border-b border-[#E8E5DE] bg-white">
                  <button
                    onClick={() => setMobileView('list')}
                    className="flex items-center gap-1.5 text-[#6B4FD8] font-sans text-[13px] font-semibold"
                    aria-label="Back to channel list"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                </div>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          ) : (
            <EmptyChatArea />
          )}
        </main>

      </Chat>
    </div>
  )
}
