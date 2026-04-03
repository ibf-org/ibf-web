import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// ─── Route Matchers ─────────────────────────────────────────────────────────

// Routes that NEVER require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about',
  '/faq',
  '/u/(.*)',                     // Public profiles
  '/api/webhooks(.*)',           // Webhooks can't carry auth
  '/api/projects/browse',        // Public project listing
  '/api/chat/seed',              // Uses its own SEED_SECRET, not Clerk auth
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

// Routes that ALWAYS require authentication
const isProtectedRoute = createRouteMatcher([
  '/founder(.*)',
  '/student(.*)',
  '/general(.*)',
  '/chat(.*)',              // app/(general)/chat resolves to /chat
  '/api/chat(.*)',
  '/api/search(.*)',
  '/api/applications(.*)',
  '/api/onboarding(.*)',
  '/api/profile(.*)',
  '/api/projects',               // POST create project
  '/api/upload(.*)',
  '/api/notifications(.*)',
  '/api/init-community(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  // ── 1. Public routes — always allow through ──
  if (isPublicRoute(req)) return NextResponse.next()

  // ── 2. Protected routes — enforce auth before anything else ──
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      // API routes get a 401 JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Page routes get redirected to sign-in
      const url = new URL('/sign-in', req.url)
      url.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(url)
    }
  }

  // ── 3. Get session info for routing decisions ──
  const { userId, sessionClaims } = await auth()

  // ── 4. Unauthenticated user on non-public, non-protected route ──
  if (!userId) {
    if (isOnboardingRoute(req)) return NextResponse.next()
    // Redirect to sign-in for page routes
    if (!pathname.startsWith('/api/')) {
      const url = new URL('/sign-in', req.url)
      url.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Authenticated user below ─────────────────────────────────────────────

  const meta = (sessionClaims?.unsafeMetadata as Record<string, unknown>) || {}
  
  const role = (meta.role as string | undefined) || req.cookies.get(`ibf_role_${userId}`)?.value
  const onboarded = (meta.onboarded as boolean | undefined) || (req.cookies.get(`ibf_onboarded_${userId}`)?.value === 'true')

  // 5. Signed-in user visiting sign-in or sign-up → redirect to their home
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    if (!onboarded) return NextResponse.redirect(new URL('/onboarding', req.url))
    const dest = role === 'founder' ? '/founder/dashboard' : '/student/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // 6. Signed-in user on landing page → redirect to their home
  if (pathname === '/') {
    if (!onboarded) return NextResponse.redirect(new URL('/onboarding', req.url))
    const dest = role === 'founder' ? '/founder/dashboard' : '/student/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // 7. Not yet onboarded → sync first
  if (!onboarded && !isOnboardingRoute(req) && !pathname.startsWith('/api/')) {
    const syncUrl = new URL('/api/auth/sync', req.url)
    syncUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(syncUrl)
  }

  // 8. Role-based cross-route protection
  if (pathname.startsWith('/founder') && role === 'student') {
    return NextResponse.redirect(new URL('/student/dashboard', req.url))
  }
  if (pathname.startsWith('/student') && role === 'founder') {
    return NextResponse.redirect(new URL('/founder/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
