import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // Rate limit: 20 deletes per minute
  if (!rateLimit(getClientIp(req), 20, 60_000)) return rateLimitResponse()

  const { id: projectId, roleId } = await params

  // ── Ownership check: only the project founder can delete roles ──
  const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })

  const { data: project } = await supabaseAdmin.from('projects').select('founder_id').eq('id', projectId).single()
  if (!project || project.founder_id !== dbUser.id) {
    return new Response(JSON.stringify({ error: 'Forbidden: you do not own this project' }), { status: 403 })
  }

  // Also verify the role belongs to this project
  const { data: role } = await supabaseAdmin.from('roles').select('id').eq('id', roleId).eq('project_id', projectId).single()
  if (!role) return new Response(JSON.stringify({ error: 'Role not found in this project' }), { status: 404 })

  await supabaseAdmin.from('roles').delete().eq('id', roleId)
  return new Response('OK', { status: 200 })
}
