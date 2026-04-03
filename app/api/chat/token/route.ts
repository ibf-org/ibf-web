import { auth } from '@clerk/nextjs/server'
import { createStreamToken, upsertStreamUser } from '@/lib/stream-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 10 token requests per minute
    if (!rateLimit(getClientIp(req), 10, 60_000)) return rateLimitResponse()

    // Get IBF user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, avatar_url, role')
      .eq('clerk_id', userId)
      .single()

    if (error || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Sync user to Stream Chat
    await upsertStreamUser({
      id: user.id,
      name: user.full_name,
      image: user.avatar_url || undefined,
      role: user.role,
    })

    const token = await createStreamToken(user.id)

    return Response.json({
      token,
      userId: user.id,
      userName: user.full_name,
      userImage: user.avatar_url,
    })
  } catch (err) {
    console.error('Chat token error:', err)
    return Response.json({ error: 'Failed to generate chat token' }, { status: 500 })
  }
}
