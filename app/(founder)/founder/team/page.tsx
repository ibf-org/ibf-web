import { createSupabaseServerClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import TeamClient from './TeamClient'

export const dynamic = 'force-dynamic'

export default async function TeamMembersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServerClient()

  // Find users in auth mapping
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!dbUser) redirect('/sign-in')

  // Get all projects owned by founder
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('founder_id', dbUser.id)

  const projectIds = projects?.map((p: any) => p.id) || []

  // Get all team members for those projects
  let teamMembers: any[] = []
  if (projectIds.length > 0) {
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        project_id,
        user_id,
        role_id,
        role_title,
        joined_at,
        projects:project_id(title),
        users:user_id(
          id,
          username,
          full_name,
          avatar_url,
          profiles(
            is_student,
            university,
            skills,
            availability_status
          )
        )
      `)
      .in('project_id', projectIds)
      
      teamMembers = members || []
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <TeamClient 
        initialMembers={teamMembers} 
        projects={projects || []}
        giverId={dbUser.id}
      />
    </div>
  )
}
