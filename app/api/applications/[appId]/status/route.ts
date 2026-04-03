import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendApplicationStatusEmail } from '@/lib/email'
import { createProjectChannel } from '@/lib/stream-server'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // Rate limit: 20 status changes per minute
  if (!rateLimit(getClientIp(req), 20, 60_000)) return rateLimitResponse()

  const { appId } = await params
  const { status, projectId } = await req.json()

  if (!['accepted', 'rejected', 'reviewing', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  // Get the application with student info
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select(`
      id, role_id, student_id, cover_note,
      roles!inner(project_id, title),
      users!applications_student_id_fkey(id, full_name, email)
    `)
    .eq('id', appId)
    .single()

  if (!application) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404 })

  const role = application.roles as unknown as { project_id: string; title: string }

  // ── Ownership check: only the project founder can change application status ──
  const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: project } = await supabaseAdmin.from('projects').select('id, title, founder_id').eq('id', projectId || role.project_id).single()
  if (!project || project.founder_id !== dbUser.id) {
    return NextResponse.json({ error: 'Forbidden: you do not own this project' }, { status: 403 })
  }

  // Update status
  await supabaseAdmin.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', appId)

  const student = application.users as unknown as { id: string; full_name: string; email: string }

  // Send email notification to student
  if (status === 'accepted' || status === 'rejected') {
    sendApplicationStatusEmail(student.email, student.full_name, project.title, role.title, status).catch(console.error)
  }

  // If accepted, add to team_members and create Stream channel
  if (status === 'accepted') {
    await supabaseAdmin.from('team_members').upsert({
      project_id: project.id,
      user_id: student.id,
      role_id: application.role_id,
      stream_channel_id: `project-${project.id}`,
    }, { onConflict: 'project_id, user_id', ignoreDuplicates: true })

    // Create/update Stream channel with new member
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('project_id', project.id)

    const memberIds = [...new Set([
      project.founder_id,
      ...(teamMembers || []).map(m => m.user_id),
    ])]

    createProjectChannel({
      projectId: project.id,
      projectName: project.title,
      founderId: project.founder_id,
      memberIds: memberIds.filter(id => id !== project.founder_id),
    }).catch(console.error)

    // Create notification for student
    await supabaseAdmin.from('notifications').insert({
      user_id: student.id,
      type: 'application_accepted',
      payload: { project_id: project.id, project_title: project.title, role_title: role.title },
    })
  }

  return Response.json({ status })
}
