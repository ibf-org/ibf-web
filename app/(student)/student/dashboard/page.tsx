import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import DashboardClient from './DashboardClient'

export const metadata = { title: 'Student Dashboard — IBF' }
export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select(`
      id, 
      full_name,
      profiles(bio, skills, university, grad_year, github_url, linkedin_url, website_url)
    `)
    .eq('clerk_id', userId)
    .single()

  if (!dbUser) {
    redirect('/onboarding')
  }

  // Profile Completeness
  let completedFields = 0
  const totalFields = 5
  const missingFields: string[] = []
  
  const p = Array.isArray(dbUser.profiles) ? dbUser.profiles[0] : dbUser.profiles
  if (!p?.bio?.trim()) missingFields.push('Bio')
  else completedFields++

  if (!p?.skills || p.skills.length === 0) missingFields.push('Skills')
  else completedFields++

  if (!p?.university?.trim()) missingFields.push('University')
  else completedFields++

  if (!p?.grad_year) missingFields.push('Graduation Year')
  else completedFields++

  if (!p?.github_url && !p?.linkedin_url && !p?.website_url) missingFields.push('Social Links')
  else completedFields++

  const completionPercent = Math.round((completedFields / totalFields) * 100)
  const missingThing = missingFields[0] || 'details'

  // Applications
  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id, status, created_at,
      roles(title, project_id, projects(id, title, cover_image_url))
    `)
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Stats
  const totalApps = applications?.length || 0
  const acceptedApps = applications?.filter(a => a.status === 'accepted').length || 0
  const activeProjects = acceptedApps

  // Recommended projects (matching student skills)
  const skills = p?.skills || []
  let recommendedProjects: any[] = []
  
  if (skills.length > 0) {
    const { data: allProjects } = await supabaseAdmin
      .from('projects')
      .select(`id, title, tagline, category, stage, cover_image_url, roles(skills_required)`)
      .eq('is_public', true)
      .eq('status', 'open')
      .limit(20)

    recommendedProjects = (allProjects || [])
      .filter(proj => (proj.roles || []).some((r: any) =>
        (r.skills_required || []).some((s: string) => skills.includes(s))
      ))
      .map(proj => {
        let matchCount = 0;
        let totalRequired = 0;
        (proj.roles || []).forEach((r: any) => {
           if(r.skills_required) {
             const req = Array.isArray(r.skills_required) ? r.skills_required : []
             totalRequired = Math.max(totalRequired, req.length)
             const roleMatches = req.filter((s: string) => skills.includes(s)).length
             matchCount = Math.max(matchCount, roleMatches)
           }
        })
        return {
          ...proj,
          matchCount,
          totalRequired: totalRequired || 5 // fallback
        }
      })
      .slice(0, 5)
  }

  return (
    <DashboardClient 
      firstName={dbUser.full_name?.split(' ')[0] || 'Student'}
      completionPercent={completionPercent}
      missingThing={missingThing}
      stats={{ totalApps, acceptedApps, activeProjects }}
      applications={applications || []}
      recommendedProjects={recommendedProjects}
    />
  )
}
