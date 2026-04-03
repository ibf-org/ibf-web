import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ChatProvider } from '@/components/providers/ChatProvider'

export const metadata = { title: 'IBF Messaging' }

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0C0F14]">
      {/* 
        The top bar navigation should usually go here if part of a global layout
        but for a dedicate messaging route, this can remain isolated.
      */}
      <ChatProvider>
        {children}
      </ChatProvider>
    </div>
  )
}
