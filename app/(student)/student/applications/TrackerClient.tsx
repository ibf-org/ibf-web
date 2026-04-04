'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, Briefcase, ChevronRight, AlertTriangle, X } from 'lucide-react'

interface AppRow {
  id: string
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  created_at: string
  roleName: string
  projectName: string
  founderName: string
  founderAvatar: string | null
}

export default function TrackerClient({ initialApplications }: { initialApplications: AppRow[] }) {
  const [applications, setApplications] = useState<AppRow[]>(initialApplications)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const handleWithdraw = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/applications/${id}/withdraw`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to withdraw application')
      }
      
      setApplications(prev => prev.filter(app => app.id !== id))
      toast.success('Application withdrawn successfully')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
      setWithdrawingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-2xl font-bold text-[#f0f0ff]">My Applications</h1>
        <p className="text-sm text-ibf-muted">Track the status of your project applications</p>
      </div>

      {/* STATS ROW */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-ibf-border bg-ibf-surface p-4 text-center sm:text-left transition-all hover:border-teal-500/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-ibf-hint mb-1">Total Applied</div>
          <div className="text-3xl font-bold text-[#f0f0ff]">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-ibf-border bg-ibf-surface p-4 text-center sm:text-left transition-all hover:border-gray-400/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-ibf-hint mb-1">Pending</div>
          <div className="text-3xl font-bold text-ibf-muted">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-ibf-border bg-ibf-surface p-4 text-center sm:text-left transition-all hover:border-ibf-primary/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-ibf-primary/50 mb-1">Reviewing</div>
          <div className="text-3xl font-bold text-ibf-primary">{stats.reviewing}</div>
        </div>
        <div className="rounded-xl border border-ibf-border bg-ibf-surface p-4 text-center sm:text-left transition-all hover:border-emerald-500/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500/50 mb-1">Accepted</div>
          <div className="text-3xl font-bold text-emerald-400">{stats.accepted}</div>
        </div>
      </div>

      {/* TABLE / LIST */}
      <div className="overflow-hidden rounded-xl border border-ibf-border bg-ibf-surface">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-4 text-4xl opacity-50">📋</div>
            <h3 className="mb-2 text-lg font-bold text-[#f0f0ff]">You haven't applied to any projects yet.</h3>
            <p className="mb-6 text-sm text-ibf-muted">Discover exciting startups looking for your skills.</p>
            <Link 
              href="/discover"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-bold text-ibf-heading shadow-lg shadow-teal-500/20 transition hover:bg-teal-600"
            >
              Discover Projects <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0C0F14]/50 text-xs uppercase text-ibf-hint border-b border-ibf-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project & Founder</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Applied</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e3a]">
                {applications.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-ibf-surface/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#0d0d1a]">
                          {app.founderAvatar ? (
                            <img src={app.founderAvatar} alt={app.founderName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-ibf-heading">
                              {app.founderName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#f0f0ff]">{app.projectName}</div>
                          <div className="text-[11px] text-ibf-muted">by {app.founderName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium inline-flex items-center gap-1.5"><Briefcase className="text-teal-500" size={14}/>{app.roleName}</span>
                    </td>
                    <td className="px-6 py-4 text-ibf-muted">
                      {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2.5 py-1 text-xs font-medium text-ibf-muted border border-gray-500/20">Pending review</span>}
                      {app.status === 'reviewing' && <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-ibf-primary border border-ibf-primary/20">Reviewing</span>}
                      {app.status === 'accepted' && <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">Accepted</span>}
                      {app.status === 'rejected' && <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/20">Rejected</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'pending' ? (
                        <button 
                          onClick={() => setWithdrawingId(app.id)}
                          className="text-xs font-semibold text-ibf-hint hover:text-red-400 transition"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WITHDRAWAL DIALOG */}
      {withdrawingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ibf-bg/60 backdrop-blur-sm" onClick={() => !isDeleting && setWithdrawingId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-ibf-border bg-[#0C0F14] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#f0f0ff]">Withdraw Application?</h3>
            <p className="mb-6 text-sm text-ibf-muted">
              Are you sure you want to withdraw your application? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setWithdrawingId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-ibf-surface py-2.5 text-sm font-semibold text-[#f0f0ff] hover:bg-ibf-surface transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleWithdraw(withdrawingId)}
                disabled={isDeleting}
                className="flex-1 flex justify-center items-center rounded-xl bg-red-500 py-2.5 text-sm font-bold text-ibf-heading shadow-lg shadow-red-500/20 hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
