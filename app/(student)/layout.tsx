import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import StudentLayoutClient from './StudentLayoutClient'
import MobileNav from '@/components/shared/MobileNav'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = user?.unsafeMetadata?.role as string
  if (role === 'founder') redirect('/founder/dashboard')

  // Fetch student profile + username to calculate completeness and pass down
  // NOTE: Use LEFT JOIN (not !inner) so users without a profile row are not filtered out
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select(`
      username,
      profiles(bio, skills, university, grad_year, github_url, linkedin_url, website_url)
    `)
    .eq('clerk_id', userId)
    .single()

  // If user row doesn't exist, send them back to onboarding to re-complete setup
  if (!dbUser) {
    redirect('/onboarding')
  }

  // Calculate profile completion percentage
  let completedFields = 0
  const totalFields = 5
  
  const p = Array.isArray(dbUser.profiles) ? dbUser.profiles[0] : dbUser.profiles
  if (p) {
    if (p.bio?.trim()) completedFields++
    if (p.skills && p.skills.length > 0) completedFields++
    if (p.university?.trim()) completedFields++
    if (p.grad_year) completedFields++
    if (p.github_url || p.linkedin_url || p.website_url) completedFields++
  }

  const completionPercent = (completedFields / totalFields) * 100

  return (
    <>
      <StudentLayoutClient username={dbUser.username} profileCompletion={completionPercent}>
        {children}
      </StudentLayoutClient>
      <MobileNav />
    </>
  )
}
