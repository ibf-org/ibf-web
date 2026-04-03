import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest } from 'next/server'
import { syncProjectToAlgolia } from '@/lib/algolia'
import { sanitizeText, truncate, validateUrl, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 5 project creations per minute
  if (!rateLimit(getClientIp(req), 5, 60_000)) return rateLimitResponse()

  const { data: dbUser } = await supabaseAdmin.from('users').select('id, full_name, avatar_url').eq('clerk_id', userId).single()
  if (!dbUser) return Response.json({ error: 'User not found' }, { status: 404 })

  const formData = await req.formData()

  // Sanitize + truncate all text inputs
  const title = sanitizeText(truncate(formData.get('title') as string || '', 150))
  const tagline = sanitizeText(truncate(formData.get('tagline') as string || '', 300))
  const description = sanitizeText(truncate(formData.get('description') as string || '', 5000))
  const stage = sanitizeText(truncate(formData.get('stage') as string || '', 50))
  const category = sanitizeText(truncate(formData.get('category') as string || '', 100))
  const is_public = formData.get('is_public') === 'true'
  const coverImageFile = formData.get('cover_image') as File | null

  // Validate URL
  const rawUrl = formData.get('website_url') as string || ''
  const website_url = rawUrl.trim() ? validateUrl(rawUrl) : null
  if (rawUrl.trim() && website_url === null) {
    return Response.json({ error: 'Invalid website URL' }, { status: 400 })
  }

  if (!title) return Response.json({ error: 'Project title is required' }, { status: 400 })

  let cover_image_url: string | null = null

  // Upload cover image to Supabase Storage
  if (coverImageFile && coverImageFile.size > 0) {
    // Max 10MB
    if (coverImageFile.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'Cover image must be under 10MB' }, { status: 400 })
    }
    const buffer = await coverImageFile.arrayBuffer()
    const fileName = `projects/${dbUser.id}/${Date.now()}_${coverImageFile.name}`
    const { data: uploadData } = await supabaseAdmin.storage
      .from('ibf-public')
      .upload(fileName, buffer, { contentType: coverImageFile.type, upsert: true })

    if (uploadData) {
      const { data: urlData } = supabaseAdmin.storage.from('ibf-public').getPublicUrl(fileName)
      cover_image_url = urlData.publicUrl
    }
  }

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .insert({ title, tagline, description, stage, category, cover_image_url, website_url, is_public, founder_id: dbUser.id })
    .select()
    .single()

  if (error || !project) return Response.json({ error: 'Failed to create project' }, { status: 500 })

  // Sync to Algolia (non-blocking)
  syncProjectToAlgolia({
    objectID: project.id,
    title, tagline, description, stage, category,
    cover_image_url,
    founder_name: dbUser.full_name,
    founder_avatar: dbUser.avatar_url,
    skills_required: [],
    compensation_types: [],
    commitment_types: [],
    open_roles_count: 0,
    created_at: project.created_at,
  }).catch(console.error)

  return Response.json({ projectId: project.id })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 100) // Cap at 100
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('id, title, tagline, category, stage, cover_image_url, created_at, users(full_name, avatar_url)')
    .eq('is_public', true)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit)

  return Response.json(projects || [])
}
