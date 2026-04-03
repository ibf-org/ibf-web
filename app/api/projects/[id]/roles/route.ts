import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'
import { sanitizeText, truncate, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params
  const { data: roles } = await supabaseAdmin.from('roles').select('*').eq('project_id', projectId)
  return Response.json(roles || [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // Rate limit: 10 role creations per minute
  if (!rateLimit(getClientIp(req), 10, 60_000)) return rateLimitResponse()

  const { id: projectId } = await params

  // ── Ownership check: only the project founder can add roles ──
  const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })

  const { data: project } = await supabaseAdmin.from('projects').select('founder_id').eq('id', projectId).single()
  if (!project || project.founder_id !== dbUser.id) {
    return new Response(JSON.stringify({ error: 'Forbidden: you do not own this project' }), { status: 403 })
  }

  const body = await req.json()
  const title = sanitizeText(truncate(body.title, 100))
  const description = sanitizeText(truncate(body.description || '', 2000))
  const skills_required = (body.skills_required || []).slice(0, 20).map((s: string) => sanitizeText(truncate(s, 50)))
  const commitment_type = sanitizeText(truncate(body.commitment_type || '', 50))
  const compensation_type = sanitizeText(truncate(body.compensation_type || '', 50))
  const num_openings = Math.min(Math.max(body.num_openings || 1, 1), 50)

  if (!title) return new Response(JSON.stringify({ error: 'Role title is required' }), { status: 400 })

  const { data: role, error } = await supabaseAdmin.from('roles').insert({
    project_id: projectId,
    title, description, skills_required,
    commitment_type, compensation_type, num_openings,
  }).select().single()

  if (error) return new Response(JSON.stringify({ error: 'Failed to create role' }), { status: 500 })
  return Response.json(role)
}
