import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return Response.json(null)

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('bio, skills, github_url, linkedin_url, website_url, availability_status, university, grad_year, startup_name, startup_tagline, location_city')
    .eq('user_id', user.id)
    .single()

  return Response.json(profile || null)
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return new Response('User not found', { status: 404 })

  const body = await req.json()

  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ user_id: user.id, ...body, updated_at: new Date().toISOString() })

  if (error) return new Response('Failed to update profile', { status: 500 })
  return Response.json({ success: true })
}
