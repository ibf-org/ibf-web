import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'
import { sendNewApplicationEmail } from '@/lib/email'
import { sanitizeText, truncate, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 5 applications per minute
  if (!rateLimit(getClientIp(req), 5, 60_000)) return rateLimitResponse()

  const body = await req.json()
  const roleId = body.roleId
  const projectId = body.projectId
  const coverNote = sanitizeText(truncate(body.coverNote || '', 2000))

  if (!roleId) return Response.json({ error: 'roleId is required' }, { status: 400 })

  const { data: student } = await supabaseAdmin.from('users').select('id, full_name, email').eq('clerk_id', userId).single()
  if (!student) return Response.json({ error: 'User not found' }, { status: 404 })

  // Check for duplicate application
  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('role_id', roleId)
    .eq('student_id', student.id)
    .single()

  if (existing) return Response.json({ error: 'You have already applied for this role' }, { status: 400 })

  // Check 10 active application limit
  const { count } = await supabaseAdmin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .in('status', ['pending', 'reviewing'])

  if ((count || 0) >= 10) return Response.json({ error: 'You have reached the maximum of 10 active applications' }, { status: 400 })

  const { data: application, error } = await supabaseAdmin
    .from('applications')
    .insert({ role_id: roleId, student_id: student.id, cover_note: coverNote || null })
    .select()
    .single()

  if (error) return Response.json({ error: 'Failed to submit application' }, { status: 500 })

  // Get role + project + founder info for email
  const { data: role } = await supabaseAdmin
    .from('roles')
    .select('title, project_id, projects(title, founder_id, users!projects_founder_id_fkey(email, full_name))')
    .eq('id', roleId)
    .single()

  if (role?.projects) {
    const project = role.projects as unknown as { title: string; founder_id: string; users: { email: string; full_name: string } | null }
    const founder = project.users
    if (founder) {
      const applicationsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/founder/projects/${projectId}/applications`
      sendNewApplicationEmail(
        founder.email, founder.full_name, student.full_name,
        role.title, project.title, coverNote || '', applicationsUrl
      ).catch(console.error)
    }

    // Notify founder in-app
    await supabaseAdmin.from('notifications').insert({
      user_id: project.founder_id,
      type: 'new_application',
      payload: { project_id: projectId, role_title: role.title, student_name: student.full_name, application_id: application.id },
    })
  }

  return Response.json({ applicationId: application.id })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: student } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!student) return Response.json([])

  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select(`
      id, cover_note, status, created_at, updated_at,
      roles(id, title, project_id, projects(id, title, category))
    `)
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  return Response.json(applications || [])
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { applicationId } = await req.json()

  const { data: student } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!student) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Only delete own applications
  await supabaseAdmin.from('applications').delete().eq('id', applicationId).eq('student_id', student.id)
  return Response.json({ success: true })
}
