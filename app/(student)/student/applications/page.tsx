import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ApplicationsClient from './ApplicationsClient'

export default async function StudentApplicationsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = await createSupabaseServerClient()

  // 1. Get internal user
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userData) {
    // Edge case if user not in DB yet
    return <div className="p-8 text-white">Profile incomplete.</div>
  }

  // 2. Fetch applications with joined data
  const { data: applicationsRaw } = await supabase
    .from('applications')
    .select(`
      id, status, created_at,
      role:roles(id, title, project:projects(id, title, cover_image_url))
    `)
    .eq('student_id', userData.id)
    .order('created_at', { ascending: false })

  // Supabase types can be tricky with inner joins, providing default []
  const applications = applicationsRaw || []

  // Calculate Stats
  const totalApplied = applications.length
  const pendingCount = applications.filter((a: any) => a.status === 'pending').length
  const acceptedCount = applications.filter((a: any) => a.status === 'accepted').length
  const rejectedCount = applications.filter((a: any) => a.status === 'rejected').length

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 font-display text-2xl font-bold">My Applications</h1>

        {/* STATS ROW */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="card text-center p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total</h3>
            <p className="mt-2 text-3xl font-bold">{totalApplied}</p>
          </div>
          <div className="card text-center p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending</h3>
            <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
          </div>
          <div className="card text-center p-4 border-emerald-200 bg-emerald-50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Accepted</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{acceptedCount}</p>
          </div>
          <div className="card text-center p-4 opacity-70">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rejected</h3>
            <p className="mt-2 text-3xl font-bold text-gray-500">{rejectedCount}</p>
          </div>
        </div>

        {/* INTERACTIVE TABLE */}
        <ApplicationsClient initialData={applications} />

      </div>
    </div>
  )
}
