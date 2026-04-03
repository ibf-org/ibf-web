import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!dbUser) return NextResponse.json({ count: 0 })

    const { count } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', dbUser.id)
      .eq('is_read', false)

    return NextResponse.json({ count: count || 0 })
  } catch (err) {
    console.error('Notifications count error:', err)
    return NextResponse.json({ count: 0 })
  }
}
