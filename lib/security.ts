/**
 * IBF Security Utilities
 * Common security functions for input validation, rate limiting, and sanitization.
 */

// ─── HTML Sanitization ──────────────────────────────────────────────────────
/**
 * Strip all HTML tags from a string. Prevents XSS on user-submitted text.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

/**
 * Truncate a string to a max length. Enforces server-side length limits.
 */
export function truncate(input: string, maxLength: number): string {
  if (!input) return ''
  return input.slice(0, maxLength)
}

// ─── URL Validation ──────────────────────────────────────────────────────────
/**
 * Validates that a string is a valid URL. Returns the cleaned URL or null.
 * Only allows http and https protocols.
 */
export function validateUrl(input: string | null | undefined): string | null {
  if (!input || !input.trim()) return null
  try {
    const url = new URL(input.trim())
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

// ─── In-Memory Rate Limiter ─────────────────────────────────────────────────
// NOTE: This is for development/single-instance only.
// In production, use @upstash/ratelimit + @upstash/redis for distributed rate limiting.

const rateLimitMap = new Map<string, number[]>()

/**
 * Check if a request from the given IP is within rate limits.
 * @returns true if the request is allowed, false if rate limited.
 */
export function rateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): boolean {
  const now = Date.now()
  const key = ip

  // Get existing timestamps, filter out expired ones
  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs)

  if (timestamps.length >= maxRequests) {
    // Update the map with cleaned timestamps
    rateLimitMap.set(key, timestamps)
    return false // Rate limited
  }

  timestamps.push(now)
  rateLimitMap.set(key, timestamps)
  return true // Allowed
}

/**
 * Extract the client IP from a request.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/**
 * Helper to create a 429 response.
 */
export function rateLimitResponse() {
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
