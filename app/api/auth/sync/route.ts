import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * GET /api/auth/sync?redirect=/destination
 *
 * Called by middleware when an authenticated user lacks the ibf_onboarded_* cookie.
 * Looks up the user's Supabase row and resets the cookies so the middleware can
 * correctly route them without sending them back to /onboarding.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const redirectTo = req.nextUrl.searchParams.get('redirect') || '/'

  // Check if this user already has a completed row in Supabase
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('role, full_name, username')
    .eq('clerk_id', userId)
    .single()

  const cookieStore = await cookies()

  if (dbUser?.role) {
    // User exists in DB — restore session cookies and send to their dashboard
    cookieStore.set(`ibf_onboarded_${userId}`, 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false, // readable in middleware (req.cookies)
    })
    cookieStore.set(`ibf_role_${userId}`, dbUser.role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    })

    // Redirect to the originally-requested page (or their dashboard)
    const dest = redirectTo && redirectTo !== '/api/auth/sync'
      ? redirectTo
      : dbUser.role === 'founder'
        ? '/founder/dashboard'
        : '/student/dashboard'

    return NextResponse.redirect(new URL(dest, req.url))
  }

  // No DB row → genuine first-time user, send to onboarding
  return NextResponse.redirect(new URL('/onboarding', req.url))
}
