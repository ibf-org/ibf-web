import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { upsertStreamUser, addMemberToProjectChannel } from '@/lib/stream-server'
import { createNotification } from '@/lib/notifications-server'
import { sendApplicationStatusEmail } from '@/lib/email'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: Request) {
  // Rate limit — max 20 accepts per minute per IP
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ip = getClientIp(req as any)
  if (!rateLimit(ip, 20, 60_000)) return rateLimitResponse()

  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { applicationId } = body
    if (!applicationId || typeof applicationId !== 'string') {
      return Response.json({ error: 'applicationId required' }, { status: 400 })
    }

    // ── 1. Load application with all related data ────────────────────────────
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id, status, cover_note, student_id,
        role_id,
        roles:roles!role_id (
          id, title, num_openings,
          project_id,
          projects:projects!project_id (
            id, title, founder_id,
            founder:users!founder_id ( id, clerk_id, full_name, email )
          )
        ),
        student:users!student_id ( id, full_name, email, avatar_url )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    // Guard: only pending/reviewing can be accepted
    if (application.status !== 'pending' && application.status !== 'reviewing') {
      return Response.json({ error: 'Application already processed' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = application.roles as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = role?.projects as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const founder = project?.founder as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = application.student as any

    if (!project || !founder || !student) {
      return Response.json({ error: 'Incomplete application data' }, { status: 422 })
    }

    // ── 2. Verify caller is the project founder ───────────────────────────────
    if (founder.clerk_id !== clerkId) {
      return Response.json({ error: 'Forbidden — you are not the project founder' }, { status: 403 })
    }

    // ── 3. Accept application ────────────────────────────────────────────────
    const { error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    if (updateErr) throw new Error(`Failed to update application: ${updateErr.message}`)

    // ── 4. Add team member row (upsert — idempotent) ─────────────────────────
    const { error: tmError } = await supabaseAdmin
      .from('team_members')
      .upsert(
        {
          project_id: project.id,
          user_id: application.student_id,
          role_id: application.role_id,
          joined_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,user_id' }
      )

    if (tmError) throw new Error(`Failed to add team member: ${tmError.message}`)

    // ── 5. Auto-fill role if all openings are taken ───────────────────────────
    const { count: acceptedCount } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', application.role_id)
      .eq('status', 'accepted')

    if (
      role.num_openings != null &&
      acceptedCount != null &&
      acceptedCount >= role.num_openings
    ) {
      await supabaseAdmin
        .from('roles')
        .update({ is_filled: true })
        .eq('id', application.role_id)
    }

    // ── 6. Stream Chat — add student to project channel (non-fatal) ───────────
    try {
      await upsertStreamUser({
        id: student.id,
        name: student.full_name,
        image: student.avatar_url || undefined,
        role: 'student',
      })
      await addMemberToProjectChannel(project.id, student.id)
    } catch (streamErr) {
      console.error('[accept] Stream Chat update failed (non-fatal):', streamErr)
    }

    // ── 7. In-app notification for student ───────────────────────────────────
    await createNotification(application.student_id, 'application_accepted', {
      projectName: project.title,
      roleName: role.title,
      projectId: project.id,
    })

    // ── 8. Email student (non-fatal) ─────────────────────────────────────────
    try {
      await sendApplicationStatusEmail(
        student.email,
        student.full_name,
        project.title,
        role.title,
        'accepted'
      )
    } catch (emailErr) {
      console.error('[accept] Email send failed (non-fatal):', emailErr)
    }

    return Response.json({
      success: true,
      message: 'Application accepted and student added to team',
    })
  } catch (err: unknown) {
    console.error('[POST /api/applications/accept]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
