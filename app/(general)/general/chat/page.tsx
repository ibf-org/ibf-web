'use client'

import { useEffect, useState } from 'react'
import { ChannelList, Channel, Window, MessageList, MessageInput, ChannelHeader, Thread, useChatContext } from 'stream-chat-react'
import { Hash } from 'lucide-react'
import type { Channel as StreamChannel } from 'stream-chat'

const COMMUNITY_CHANNELS = [
  { id: 'general', name: 'General' },
  { id: 'for-founders', name: 'For Founders' },
  { id: 'for-students', name: 'For Students' },
  { id: 'project-ideas', name: 'Project Ideas' },
  { id: 'tech', name: 'Tech' },
  { id: 'design', name: 'Design' },
  { id: 'intros', name: 'Intros' },
]

export default function ChatPage() {
  const { client, setActiveChannel } = useChatContext()
  const [activeCommType, setActiveCommType] = useState<string | null>(null)
  
  // Custom Render for Community items
  const handleCommunityClick = async (channelId: string) => {
    setActiveCommType(channelId)
    const channel = client.channel('messaging', channelId)
    // Implicitly watches/joins if not already done securely
    await channel.watch()
    setActiveChannel(channel)
  }

  // Pre-fetch active channel syncs nicely
  useEffect(() => {
    handleCommunityClick('general')
  }, [client])

  // Filters for standard UI components
  const filtersTeam = { type: 'messaging', members: { $in: [client.userID as string] }, isProjectChat: true }
  const filtersDM = { type: 'messaging', members: { $in: [client.userID as string] }, isProjectChat: { $ne: true }, is_community: { $ne: true } }
  
  // Custom minimal channel preview item
  const CustomChannelPreview = (props: any) => {
    const { channel, active, setActiveChannel } = props
    const unread = channel.countUnread()
    
    return (
      <div 
        onClick={() => {
          setActiveCommType(null)
          setActiveChannel(channel)
        }} 
        className={`flex cursor-pointer items-center justify-between px-4 py-2 border-l-2 transition-all ${active ? 'border-teal-500 bg-[#1e1e3a]/50 text-[#f0f0ff]' : 'border-transparent text-gray-400 hover:bg-[#1e1e3a]/30 hover:text-gray-300'}`}
      >
        <span className="truncate text-sm font-medium pr-2">
          {channel.data?.name || 'Direct Message'}
        </span>
        {unread > 0 && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .str-chat {
          --str-chat__background: #0C0F14;
          --str-chat__secondary-background: #111827;
          --str-chat__border-color: #1e1e3a;
          --str-chat__message-input-background: #111827;
          --str-chat__primary-color: #1D9E75;
          --str-chat__text-color: #e0e8ff;
          --str-chat__text-low-emphasis-color: #8899bb;
          background-color: var(--str-chat__background);
        }
        
        /* Force hiding of standard list wrappers when using distinct lists to avoid duplicate borders */
        .str-chat-channel-list {
          border-right: none !important;
          background-color: transparent !important;
        }
      `}} />
      
      {/* LEFT SIDEBAR */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-[#1e1e3a] bg-[#111827] overflow-y-auto">
        <div className="p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Community Channels</h2>
          <div className="space-y-0.5">
            {COMMUNITY_CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCommunityClick(c.id)}
                className={`flex w-full items-center justify-between border-l-2 px-3 py-2 text-left transition-all ${activeCommType === c.id ? 'border-blue-500 bg-[#1e1e3a]/50 text-[#f0f0ff]' : 'border-transparent text-gray-400 hover:bg-[#1e1e3a]/30 hover:text-gray-300'}`}
              >
                <div className="flex items-center gap-2 truncate text-sm font-medium">
                  <Hash size={14} className="opacity-50" />
                  {c.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Your Team Chats</h2>
          <ChannelList 
            filters={filtersTeam} 
            sort={{ last_message_at: -1 }}
            Preview={CustomChannelPreview}
          />
        </div>

        <div className="mt-6 mb-4">
          <div className="mb-2 flex items-center justify-between px-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Direct Messages</h2>
            <button className="text-xl font-medium text-gray-400 transition hover:text-teal-400">+</button>
          </div>
          <ChannelList 
            filters={filtersDM} 
            sort={{ last_message_at: -1 }}
            Preview={CustomChannelPreview}
          />
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0C0F14]">
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </div>
    </div>
  )
}
