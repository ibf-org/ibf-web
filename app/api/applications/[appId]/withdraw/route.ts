import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { appId } = await params

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify ownership and status
    const { data: application } = await supabaseAdmin
      .from('applications')
      .select('student_id, status')
      .eq('id', appId)
      .single()

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (application.student_id !== user.id) return NextResponse.json({ error: 'Unauthorized override' }, { status: 403 })
    if (application.status !== 'pending') return NextResponse.json({ error: 'Cannot withdraw an application that is already reviewed' }, { status: 400 })

    const { error: deleteError } = await supabaseAdmin
      .from('applications')
      .delete()
      .eq('id', appId)

    if (deleteError) throw new Error(deleteError.message)

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Withdraw application error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
