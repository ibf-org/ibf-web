import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeText, truncate, validateUrl, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit: 10 profile updates per minute
    if (!rateLimit(getClientIp(req), 10, 60_000)) return rateLimitResponse()

    const payload = await req.json()

    // 1. Get primary mapping of user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found in mapping' }, { status: 404 })

    // 2. Destructure and sanitize fields
    const { full_name, avatar_url, ...profileData } = payload

    // 3. Update basic users table info if provided
    if (full_name || avatar_url) {
      const userUpdate: Record<string, string> = {}
      if (full_name) userUpdate.full_name = sanitizeText(truncate(full_name, 100))
      if (avatar_url) userUpdate.avatar_url = avatar_url // URL from our own upload, already validated
      
      await supabaseAdmin.from('users').update(userUpdate).eq('id', user.id)
    }

    // 4. Sanitize profile text fields
    const sanitizedProfile: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(profileData)) {
      if (typeof value === 'string') {
        if (key.endsWith('_url')) {
          // Validate URL fields
          const validated = validateUrl(value)
          sanitizedProfile[key] = validated
        } else {
          sanitizedProfile[key] = sanitizeText(truncate(value, key === 'bio' ? 2000 : 500))
        }
      } else if (Array.isArray(value)) {
        // Sanitize array entries (e.g. skills)
        sanitizedProfile[key] = value.slice(0, 30).map((v: unknown) => typeof v === 'string' ? sanitizeText(truncate(v, 100)) : v)
      } else {
        sanitizedProfile[key] = value
      }
    }

    // 5. Upsert extended profile info
    if (Object.keys(sanitizedProfile).length > 0) {
      await supabaseAdmin.from('profiles').upsert({
        user_id: user.id,
        ...sanitizedProfile
      }, { onConflict: 'user_id' })
    }

    return NextResponse.json({ ok: true })

  } catch (err: unknown) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
