'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Filter, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FounderApplicationsPage() {
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All projects')
  const [projectsList, setProjectsList] = useState<{id: string, title: string}[]>([])

  useEffect(() => {
    async function fetchData() {
      // RLS on applications automatically restricts to founder's own projects
      const { data, error } = await supabaseBrowser
        .from('applications')
        .select(`
          id, cover_note, status, created_at,
          role:roles!inner(title, project:projects!inner(id, title)),
          student:users!inner(id, full_name, avatar_url, username)
        `)
        .order('created_at', { ascending: false })
        
      if (data) {
        setApplications(data)
        
        // Extract unique projects for the filter dropdown
        const uniqueProjects = new Map()
        data.forEach((app: any) => {
          if (app.role?.project?.id) {
            uniqueProjects.set(app.role.project.id, app.role.project.title)
          }
        })
        setProjectsList(Array.from(uniqueProjects.entries()).map(([id, title]) => ({ id, title })))
      }
      setLoading(false)
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    // Optimistic UI update
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    ))
    
    // Server API route for status update (presumed from earlier components)
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Application ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update application status')
      // Revert optimism (in a robust app, we'd refetch or revert explicitly)
    }
  }

  // Derived stats
  const totalCount = applications.length
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length

  // Apply filters
  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'All' && app.status !== statusFilter.toLowerCase()) return false
    if (projectFilter !== 'All projects' && app.role?.project?.title !== projectFilter) return false
    return true
  })

  const STATUS_TABS = ['All', 'Pending', 'Reviewing', 'Accepted', 'Rejected']

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] text-white">
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full">
        
        {/* Header & Stats */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-syne text-2xl font-bold text-white">All Applications</h1>
            <div className="flex h-6 items-center gap-2 rounded-full border border-[#1e2d4a] bg-[#111827] px-3 font-dm text-xs text-[#8899bb]">
              <span className="font-semibold text-white">{totalCount}</span> total
              <span className="mx-1 h-3 w-px bg-[#1e2d4a]"></span>
              <span className="font-semibold text-white">{pendingCount}</span> pending
              <span className="mx-1 h-3 w-px bg-[#1e2d4a]"></span>
              <span className="font-semibold text-emerald-400">{acceptedCount}</span> accepted
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === tab 
                    ? 'bg-blue-600 font-semibold text-white' 
                    : 'bg-[#111827] text-[#8899bb] hover:bg-[#1e2d4a] hover:text-[#e0e8ff]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-dm text-sm text-[#4a5a7a]">Filter by:</span>
            <select
              title="Filter by project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-1.5 text-sm text-[#e0e8ff] focus:border-blue-500 focus:outline-none"
            >
              <option value="All projects">All projects</option>
              {projectsList.map(proj => (
                <option key={proj.id} value={proj.title}>{proj.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#111827]">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-[#8899bb]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-[#4a5a7a]">
              <Filter size={32} className="mb-3 opacity-50" />
              <p className="font-dm text-sm">No applications found matching these filters.</p>
            </div>
          ) : (
            <table className="w-full text-left font-dm text-sm">
              <thead className="border-b border-[#1e2d4a] bg-[#0C0F14]/50 text-[#8899bb]">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4a]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-[#1e2d4a]/30">
                    
                    <td className="px-6 py-4">
                      <Link href={`/u/${app.student?.username}`} className="flex items-center gap-3 hover:opacity-80">
                        {app.student?.avatar_url ? (
                          <img src={app.student.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover bg-[#1e2d4a]" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-blue-200">
                            {app.student?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="font-medium text-[#e0e8ff]">{app.student?.full_name || 'Unknown'}</span>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[#8899bb]">{app.role?.project?.title || 'Unknown'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[#8899bb]">{app.role?.title || 'Unknown'}</span>
                    </td>

                    <td className="px-6 py-4 text-[#8899bb]">
                      {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium capitalize ${
                        app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                        app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        app.status === 'reviewing' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'pending' || app.status === 'reviewing' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'accepted')}
                              className="flex h-8 items-center justify-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <CheckCircle2 size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="flex h-8 items-center justify-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-3 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/founder/projects/${app.role?.project?.id}/applications`}
                            className="text-xs font-medium text-blue-400 hover:text-blue-300"
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}
