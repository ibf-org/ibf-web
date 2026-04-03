import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeText, truncate, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 3 onboarding attempts per minute
  if (!rateLimit(getClientIp(req), 3, 60_000)) return rateLimitResponse()

  const { role, profileData } = await req.json()
  if (!role || !['founder', 'student'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Sanitize profile data
  const sanitizedProfileData: Record<string, unknown> = {}
  if (profileData && typeof profileData === 'object') {
    for (const [key, value] of Object.entries(profileData)) {
      if (typeof value === 'string') {
        sanitizedProfileData[key] = sanitizeText(truncate(value, key === 'bio' ? 2000 : 500))
      } else if (Array.isArray(value)) {
        sanitizedProfileData[key] = value.slice(0, 30).map((v: unknown) => typeof v === 'string' ? sanitizeText(truncate(v, 100)) : v)
      } else {
        sanitizedProfileData[key] = value
      }
    }
  }

  try {
    // ── 1. Get or create user row in Supabase ───────────────────────────
    let dbUserId: string | null = null
    const { data: existing } = await supabaseAdmin
      .from('users').select('id').eq('clerk_id', userId).single()

    if (existing) {
      dbUserId = existing.id
      await supabaseAdmin.from('users').update({ role }).eq('id', dbUserId)
    } else {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)
      const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'IBF User'
      const username = `${fullName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).slice(2, 6)}`
      const { data: newUser, error: insertErr } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          role, full_name: fullName, username,
          avatar_url: clerkUser.imageUrl ?? null,
        })
        .select('id').single()
      if (insertErr || !newUser) throw new Error(insertErr?.message ?? 'Failed to create user')
      dbUserId = newUser.id
    }

    // ── 2. Upsert profile data ───────────────────────────────────────────
    if (dbUserId && Object.keys(sanitizedProfileData).length > 0) {
      await supabaseAdmin.from('profiles')
        .upsert({ user_id: dbUserId, ...sanitizedProfileData }, { onConflict: 'user_id' })
    }

    // NOTE: Clerk metadata (onboarded: true) is set CLIENT-SIDE via user.update()
    // in the onboarding page. However, because Clerk does not include unsafeMetadata
    // in the JWT by default (without dashboard config), we ALSO set an HTTP-only
    // fallback cookie so the middleware can instantly route the user.
    const cookieStore = await cookies()
    cookieStore.set(`ibf_onboarded_${userId}`, 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    cookieStore.set(`ibf_role_${userId}`, role, { path: '/', maxAge: 60 * 60 * 24 * 365 })

    return NextResponse.json({ ok: true, role })
  } catch (err) {
    console.error('[onboarding] error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
