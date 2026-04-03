import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import StreamCommunityClient from '@/app/(founder)/founder/community/StreamCommunityClient'

export const dynamic = 'force-dynamic'

export default async function StudentCommunityPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="w-full">
      <StreamCommunityClient userRole="student" />
    </div>
  )
}
