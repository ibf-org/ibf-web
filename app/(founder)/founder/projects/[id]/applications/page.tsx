import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import ApplicationsClient from './ApplicationsClient'

export const metadata = { title: 'Applications — IBF' }

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const { id: projectId } = await params

  const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) {
    throw new Error('Database desync detected. Please sign out and sign in back safely.')
  }

  const { data: project } = await supabaseAdmin.from('projects').select('id, title').eq('id', projectId).eq('founder_id', dbUser.id).single()
  if (!project) redirect('/founder/dashboard')

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id, cover_note, status, created_at,
      roles(id, title, skills_required),
      users!applications_student_id_fkey(id, full_name, avatar_url, username,
        profiles(bio, skills, university, grad_year, github_url, linkedin_url, website_url, availability_status)
      )
    `)
    .eq('roles.project_id', projectId)
    .order('created_at', { ascending: false })

  return <ApplicationsClient projectId={projectId} projectTitle={project.title} applications={(applications as any) || []} />
}
