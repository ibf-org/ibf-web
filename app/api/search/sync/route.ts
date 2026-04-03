import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { projectId } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    // Algolia sync — only runs if keys are configured
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    const apiKey = process.env.ALGOLIA_ADMIN_API_KEY

    if (!appId || !apiKey) {
      // Keys not configured — skip sync silently
      return NextResponse.json({ synced: false, reason: 'Algolia not configured' })
    }

    const { algoliasearch } = await import('algoliasearch')
    const { supabaseAdmin } = await import('@/lib/supabase-admin')

    const client = algoliasearch(appId, apiKey)

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select(`id, title, tagline, category, stage, status, cover_image_url, created_at,
        users(full_name)`)
      .eq('id', projectId)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    await client.saveObject({
      indexName: 'ibf_projects',
      body: {
        objectID: project.id,
        title: project.title,
        tagline: project.tagline,
        category: project.category,
        stage: project.stage,
        status: project.status,
        cover_image_url: project.cover_image_url,
        created_at: project.created_at,
      },
    })

    return NextResponse.json({ synced: true })
  } catch (err) {
    console.error('Algolia sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
