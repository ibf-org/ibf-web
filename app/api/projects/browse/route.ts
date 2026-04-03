import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select(`
      id, title, tagline, category, stage, cover_image_url, status,
      roles(id, title, skills_required, commitment_type, compensation_type, is_filled),
      users!projects_founder_id_fkey(full_name, avatar_url)
    `)
    .eq('is_public', true)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(100)

  return Response.json(projects || [])
}
