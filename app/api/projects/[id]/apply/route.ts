import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeText, truncate, rateLimit, getClientIp, rateLimitResponse } from '@/lib/security'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit: 5 applications per minute
    if (!rateLimit(getClientIp(req), 5, 60_000)) return rateLimitResponse()

    const { id: projectId } = await params
    const body = await req.json()
    const roleId = body.roleId
    const coverNote = sanitizeText(truncate(body.coverNote || '', 2000))

    if (!roleId) return NextResponse.json({ error: 'Missing roleId' }, { status: 400 })

    // Resolve true database user ID from Clerk ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check for duplicate application
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('role_id', roleId)
      .single()

    if (existingApp) {
      return NextResponse.json({ error: 'You have already applied for this role.' }, { status: 400 })
    }

    // Insert new application
    const { data: newApp, error: insertError } = await supabaseAdmin
      .from('applications')
      .insert({
        student_id: user.id,
        role_id: roleId,
        cover_note: coverNote?.trim() || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    // Optionally: trigger notification to founder here

    return NextResponse.json({ ok: true, application: newApp }, { status: 201 })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
