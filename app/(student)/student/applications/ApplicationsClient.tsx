'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Trash2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ApplicationsClientProps {
  initialData: any[]
}

export default function ApplicationsClient({ initialData }: ApplicationsClientProps) {
  const [applications, setApplications] = useState(initialData)

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return

    // Optimistic
    const prev = [...applications]
    setApplications(applications.filter(a => a.id !== appId))

    const { error } = await supabaseBrowser
      .from('applications')
      .delete()
      .eq('id', appId)

    if (error) {
      toast.error('Failed to withdraw application')
      setApplications(prev)
    } else {
      toast.success('Application withdrawn')
    }
  }

  if (applications.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1e2d4a] bg-ibf-surface/50 text-center">
        <h3 className="font-syne text-lg font-bold text-[#e0e8ff]">You haven't applied to any projects yet</h3>
        <p className="mt-2 font-dm text-sm text-[#8899bb]">Discover projects looking for your skills and apply to join.</p>
        <Link
          href="/student/discover"
          className="mt-6 flex items-center gap-2 rounded-lg bg-[#1D9E75] px-6 py-2.5 font-dm text-sm font-bold text-black transition-colors hover:bg-[#15825f]"
          aria-label="Start discovering projects"
        >
          Start by discovering projects <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e2d4a] bg-ibf-surface">
      <table className="w-full text-left font-dm text-sm">
        <thead className="bg-[#0C0F14] border-b border-[#1e2d4a] uppercase tracking-wider text-ibf-muted">
          <tr>
            <th className="px-6 py-4 text-[11px] font-medium">Project</th>
            <th className="px-6 py-4 text-[11px] font-medium">Role</th>
            <th className="px-6 py-4 text-[11px] font-medium">Applied</th>
            <th className="px-6 py-4 text-[11px] font-medium">Status</th>
            <th className="px-6 py-4 text-[11px] font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2d4a]">
          {applications.map((app) => {
            // Because of the inner join the nested property might be slightly different layout depending on the query mapping
            // Handling the project safely:
            const project = app.role?.project || {}
            
            return (
              <tr key={app.id} className="transition-colors hover:bg-ibf-primary-light/20">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-[8px] bg-ibf-primary-light">
                      {project.cover_image_url ? (
                        <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-teal-900/30 text-xs font-bold text-teal-500/50">
                          {project.title?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <span className="font-syne font-semibold text-[#e0e8ff]">{project.title || 'Unknown'}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <span className="font-medium text-[#8899bb]">{app.role?.title || 'Unknown Role'}</span>
                </td>
                
                <td className="px-6 py-4 text-[#8899bb]">
                  {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold capitalize tracking-wide ${
                    app.status === 'accepted' ? 'bg-[#0d3a28] text-ibf-secondary' :
                    app.status === 'rejected' ? 'bg-[#2a0a0a] text-[#ef4444]' :
                    app.status === 'reviewing' ? 'bg-[#0a1628] text-[#4B9CF5]' :
                    'bg-[#1a1a2e] text-[#8899bb]'
                  }`}>
                    {app.status}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-right">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="font-dm text-xs font-medium text-ibf-muted transition-colors hover:text-red-400"
                      aria-label="Withdraw application"
                    >
                      Withdraw
                    </button>
                  )}
                  {app.status === 'accepted' && project.id && (
                    <Link
                      href={`/student/team/${project.id}`}
                      className="inline-flex items-center gap-1 font-dm text-xs font-bold text-ibf-secondary transition-colors hover:text-[#15825f]"
                      aria-label="View team workspace"
                    >
                      View team <ArrowRight size={14} />
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
