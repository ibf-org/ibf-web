import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createNotification } from '@/lib/notifications-server'
import { sendApplicationStatusEmail } from '@/lib/email'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: Request) {
  // Rate limit — max 20 rejects per minute per IP
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

    // ── 1. Load application with related data ────────────────────────────────
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id, status, student_id,
        role_id,
        roles:roles!role_id (
          id, title,
          projects:projects!project_id (
            id, title, founder_id,
            founder:users!founder_id ( id, clerk_id, full_name )
          )
        ),
        student:users!student_id ( id, full_name, email )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return Response.json({ error: 'Application not found' }, { status: 404 })
    }

    // Guard: only pending/reviewing can be rejected
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

    // ── 3. Reject application ────────────────────────────────────────────────
    const { error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', applicationId)

    if (updateErr) throw new Error(`Failed to update application: ${updateErr.message}`)

    // ── 4. In-app notification for student ───────────────────────────────────
    await createNotification(application.student_id, 'application_rejected', {
      projectName: project.title,
      roleName: role.title,
      projectId: project.id,
    })

    // ── 5. Empathetic rejection email (non-fatal) ────────────────────────────
    try {
      await sendApplicationStatusEmail(
        student.email,
        student.full_name,
        project.title,
        role.title,
        'rejected'
      )
    } catch (emailErr) {
      console.error('[reject] Email send failed (non-fatal):', emailErr)
    }

    return Response.json({
      success: true,
      message: 'Application rejected and student notified',
    })
  } catch (err: unknown) {
    console.error('[POST /api/applications/reject]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
