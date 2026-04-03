import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@clerk/nextjs/server'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

// Allowed file types for upload
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed bucket names — prevents creating arbitrary buckets
const ALLOWED_BUCKETS = ['ibf-public', 'avatars', 'logos', 'covers']

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 20 uploads per minute
    if (!rateLimit(getClientIp(req), 20, 60_000)) return rateLimitResponse()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string
    const fileName = formData.get('fileName') as string

    if (!file || !bucket || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate bucket name (prevent arbitrary bucket creation)
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Sanitize filename — prevent path traversal
    const sanitizedFileName = fileName.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_\-\.\/]/g, '_')

    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.find(b => b.name === bucket)) {
      await supabaseAdmin.storage.createBucket(bucket, { public: true, fileSizeLimit: MAX_FILE_SIZE })
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload via admin to bypass RLS policies
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(sanitizedFileName, buffer, {
        upsert: true,
        contentType: file.type || 'image/png'
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(sanitizedFileName)

    return NextResponse.json({ url: publicData.publicUrl })
  } catch (err: unknown) {
    console.error('API Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
