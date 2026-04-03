'use client'

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
import { useStreamChat } from '@/components/providers/StreamChatProvider'
import { Loader2, MessageSquare, WifiOff } from 'lucide-react'

import 'stream-chat-react/dist/css/v2/index.css'
import './stream-chat-overrides.css'

// ─── Custom Channel Preview ──────────────────────────────────────────────────
function CustomChannelPreview(props: any) {
  const { channel, active, setActiveChannel } = props
  const channelName = (channel.data?.name as string) || channel.id || 'Channel'
  const lastMessage = channel.state?.messages?.slice(-1)[0]
  const unread = channel.countUnread()

  return (
    <button
      onClick={() => setActiveChannel?.(channel)}
      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
        active
          ? 'bg-[#EDE8FF] text-[#5B21B6]'
          : 'text-[#6B6054] hover:bg-[#F0EDE8] hover:text-[#1A1208]'
      }`}
    >
      <span className="text-sm flex-shrink-0 font-mono">#</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold truncate ${active ? 'text-[#5B21B6]' : ''}`}>
          {channelName.replace(/^#/, '')}
        </p>
        {lastMessage?.text && (
          <p className="text-[11px] text-[#9A8E7E] truncate mt-0.5 font-normal">
            {lastMessage.text}
          </p>
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

// ─── Empty channel placeholder ───────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE8FF]">
        <MessageSquare className="text-[#6B4FD8]" size={28} />
      </div>
      <div>
        <p className="font-sans text-[16px] font-semibold text-[#1A1208]">Select a channel</p>
        <p className="font-sans text-[13px] text-[#9A8E7E] mt-1">
          Choose a channel from the sidebar to start chatting
        </p>
      </div>
    </div>
  )
}

// ─── Loading state ───────────────────────────────────────────────────────────
function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-[#6B4FD8]" size={32} />
        <p className="font-sans text-[14px] text-[#9A8E7E]">{message}</p>
      </div>
    </div>
  )
}

// ─── Error state ─────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center max-w-xs">
        <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
          <WifiOff className="text-red-400" size={24} />
        </div>
        <p className="font-sans text-[15px] font-semibold text-[#1A1208]">Chat unavailable</p>
        <p className="font-sans text-[12px] text-[#9A8E7E] leading-relaxed">{error}</p>
        <button
          onClick={onRetry}
          className="mt-1 rounded-xl bg-[#6B4FD8] px-5 py-2 font-sans text-[13px] font-semibold text-white hover:bg-[#5B21B6] transition-colors"
        >
          Retry connection
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface StreamCommunityClientProps {
  userRole?: 'founder' | 'student'
}

export default function StreamCommunityClient({ userRole = 'student' }: StreamCommunityClientProps) {
  // Consume the shared client from the provider — no duplicate connection
  const { client, isConnected, isLoading, error, currentUserId, reconnect } = useStreamChat()

  if (isLoading) return <LoadingState message="Connecting to chat..." />
  if (error) return <ErrorState error={error} onRetry={reconnect} />
  if (!client || !isConnected) return <LoadingState message="Waiting for connection..." />

  const filters = {
    type: 'team',
    members: { $in: [currentUserId!] },
  }
  const sort = [{ last_message_at: -1 as const }]
  const options = { limit: 20, watch: true, presence: true }

  // Get current user info from the connected Stream client
  const me = client.user
  const userName = (me?.name as string) || 'You'
  const userImage = me?.image as string | undefined

  return (
    <div className="ibf-stream-chat h-[calc(100vh-64px-80px)] min-h-[500px] overflow-hidden rounded-2xl border border-[#E8E5DE] bg-white shadow-sm">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-full">

          {/* ── Channels Sidebar ─────────────────────────────────────── */}
          <div className="w-[240px] flex-shrink-0 border-r border-[#E8E5DE] bg-[#FAFAF7] flex flex-col">
            {/* Header */}
            <div className="border-b border-[#E8E5DE] px-4 py-3.5">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#9A8E7E]">
                Community
              </p>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#E8E5DE]">
              <ChannelList
                filters={filters}
                sort={sort}
                options={options}
                showChannelSearch={false}
                Preview={(previewProps) => <CustomChannelPreview {...previewProps} />}
                EmptyStateIndicator={() => (
                  <p className="px-3 py-4 text-[12px] text-[#9A8E7E] text-center">
                    No channels yet
                  </p>
                )}
              />
            </div>

            {/* Connected user footer */}
            <div className="border-t border-[#E8E5DE] p-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-[#EDE8FF] px-3 py-2">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#6B4FD8] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-sans text-[12px] font-semibold text-[#5B21B6]">
                    {userName}
                  </p>
                  <p className="font-sans text-[10px] capitalize text-[#7C3AED]">{userRole}</p>
                </div>
                {/* Online dot */}
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
              </div>
            </div>
          </div>

          {/* ── Main Chat area ───────────────────────────────────────── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Channel EmptyStateIndicator={EmptyState}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
              <Thread />
            </Channel>
          </div>

        </div>
      </Chat>
    </div>
  )
}
