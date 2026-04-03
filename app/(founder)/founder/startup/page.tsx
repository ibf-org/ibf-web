import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import StartupClient from './StartupClient'

export const dynamic = 'force-dynamic'

export default async function StartupProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  // Get current mapped user to get db user id
  const { data: dbUser } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .eq('clerk_id', userId)
    .single()

  if (!dbUser) redirect('/sign-in')

  // Fetch their existing startup
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('founder_id', dbUser.id)
    .single()

  return (
    <div className="mx-auto w-full max-w-7xl">
      <StartupClient 
        founderId={dbUser.id}
        initialStartup={startup || null}
      />
    </div>
  )
}
