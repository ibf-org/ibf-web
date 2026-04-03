import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import StreamCommunityClient from './StreamCommunityClient'

export const dynamic = 'force-dynamic'

export default async function FounderCommunityPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="w-full">
      <StreamCommunityClient userRole="founder" />
    </div>
  )
}
