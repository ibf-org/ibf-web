'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, Check, X, Clock, ExternalLink, Loader2 } from 'lucide-react'
import { timeAgo, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import toast from 'react-hot-toast'

interface Profile {
  bio: string | null
  skills: string[] | null
  university: string | null
  grad_year: number | null
  github_url: string | null
  linkedin_url: string | null
  website_url: string | null
  availability_status: string | null
}

interface Student {
  id: string
  full_name: string
  avatar_url: string | null
  username: string
  profiles: Profile | Profile[] | null
}

interface Application {
  id: string
  cover_note: string | null
  status: string
  created_at: string
  roles: { id: string; title: string; skills_required: string[] } | null
  users: Student | null
}

interface Props {
  projectId: string
  projectTitle: string
  applications: Application[]
}

type FilterStatus = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected'

// Per-button loading state — tracks which action is running for which app
interface ActionLoading {
  appId: string
  action: 'accept' | 'reject' | 'review'
}

export default function ApplicationsClient({ projectId, projectTitle, applications: initial }: Props) {
  const [applications, setApplications] = useState(initial)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [actionLoading, setActionLoading] = useState<ActionLoading | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [confirmReject, setConfirmReject] = useState<string | null>(null)

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter)

  const isLoading = (appId: string, action: ActionLoading['action']) =>
    actionLoading?.appId === appId && actionLoading?.action === action

  const anyLoading = (appId: string) => actionLoading?.appId === appId

  // ── Accept ─────────────────────────────────────────────────────────────────
  const acceptApplication = async (appId: string) => {
    setActionLoading({ appId, action: 'accept' })
    try {
      const res = await fetch('/api/applications/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to accept')

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'accepted' } : a))
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, status: 'accepted' } : prev)
      toast.success('🎉 Application accepted! Student has been added to your team.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept application')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  const rejectApplication = async (appId: string) => {
    setConfirmReject(null)
    setActionLoading({ appId, action: 'reject' })
    try {
      const res = await fetch('/api/applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reject')

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a))
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, status: 'rejected' } : prev)
      toast.success('Application rejected.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Review (mark for review — uses existing PATCH endpoint) ────────────────
  const markReviewing = async (appId: string) => {
    setActionLoading({ appId, action: 'review' })
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reviewing', projectId }),
      })
      if (!res.ok) throw new Error('Failed to update status')

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'reviewing' } : a))
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, status: 'reviewing' } : prev)
      toast.success('Marked for review.')
    } catch {
      toast.error('Failed to update application.')
    } finally {
      setActionLoading(null)
    }
  }

  const getProfile = (app: Application): Profile | null => {
    const p = app.users?.profiles
    return Array.isArray(p) ? p[0] || null : p || null
  }

  const getSkillsMatch = (app: Application) => {
    const required = app.roles?.skills_required || []
    const studentSkills = getProfile(app)?.skills || []
    if (!required.length) return null
    const matched = required.filter((s: string) => studentSkills.includes(s))
    return { matched: matched.length, total: required.length, percentage: (matched.length / required.length) * 100 }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] -m-8 overflow-hidden rounded-xl border border-[#1e1e3a] bg-[#0d0d1a]">
      {/* 40% LEFT PANEL: List */}
      <div className="flex h-full w-[40%] flex-col border-r border-[#1e1e3a] bg-[#0C0F14]">
        {/* Header */}
        <div className="shrink-0 p-5 pb-0">
          <Link href={`/founder/projects/${projectId}`} className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300">
            <ArrowLeft size={16} /> Back to project
          </Link>
          <h1 className="m-0 mb-1 font-display text-xl font-bold text-[#f0f0ff]">{projectTitle}</h1>
          <p className="m-0 text-xs text-gray-400">
            {applications.length} total application{applications.length !== 1 ? 's' : ''} | <span className="text-amber-500">{pendingCount} pending</span>
          </p>

          {/* Filters */}
          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[#1e1e3a] pb-px">
            {['all', 'pending', 'reviewing', 'accepted', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as FilterStatus)}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'border-violet-500 text-violet-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 text-3xl">📬</div>
              <h3 className="m-0 text-sm font-semibold text-[#f0f0ff]">No applications found</h3>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredApps.map(app => {
                const student = app.users
                const profile = getProfile(app)
                const skillsMatch = getSkillsMatch(app)
                const isSelected = selectedApp?.id === app.id
                
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                      isSelected 
                        ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
                        : 'border-[#1e1e3a] bg-[#111827] hover:border-[#2a2a4a]'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
                          {student?.avatar_url ? (
                            <Image src={student.avatar_url} alt={student.full_name} width={40} height={40} className="object-cover" />
                          ) : (
                            student?.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold text-[#f0f0ff]">{student?.full_name}</p>
                          {profile?.university && (
                            <p className="m-0 truncate text-[11px] text-gray-500">{profile.university}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase text-gray-500">{timeAgo(app.created_at)}</span>
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                    
                    {/* Role & Match */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="truncate text-gray-400">For: {app.roles?.title}</span>
                      
                      {skillsMatch && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{skillsMatch.matched}/{skillsMatch.total} skills</span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1e1e3a]">
                            <div 
                              className="h-full rounded-full bg-cyan-500 transition-all" 
                              style={{ width: `${skillsMatch.percentage}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 60% RIGHT PANEL: Detail View */}
      <div className="flex h-full w-[60%] flex-col bg-[#0d0d1a]">
        {!selectedApp || !selectedApp.users ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#111827]">
              <ArrowLeft size={24} className="text-[#1e1e3a]" />
            </div>
            <p>Select an application to view details</p>
          </div>
        ) : (() => {
          const student = selectedApp.users!
          const profile = getProfile(selectedApp)

          return (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Header Profile Info */}
                <div className="mb-8 flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-bold text-white shadow-lg">
                    {student.avatar_url ? (
                      <Image src={student.avatar_url} alt={student.full_name} width={80} height={80} className="object-cover" />
                    ) : student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="m-0 mb-1.5 font-display text-2xl font-bold text-[#f0f0ff]">{student.full_name}</h2>
                    
                    {profile?.university && (
                      <p className="m-0 mb-3 text-sm text-gray-400">
                        {profile.university} {profile.grad_year && `· Class of ${profile.grad_year}`}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {profile?.availability_status && (
                        <span className="rounded-md border border-[#1e1e3a] bg-[#111827] px-2.5 py-1 text-xs font-medium text-gray-300">
                          Availability: {profile.availability_status}
                        </span>
                      )}
                      
                      <Link href={`/u/${student.username}`} target="_blank" className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300">
                        View Full Profile <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Cover Note Section */}
                {selectedApp.cover_note && (
                  <div className="mb-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400">Their Message</div>
                    <blockquote className="m-0 text-sm leading-relaxed italic text-[#f0f0ff]">
                      "{selectedApp.cover_note}"
                    </blockquote>
                  </div>
                )}

                {/* Skills Assessment */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="mb-8">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Skills Assessment</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s: string) => {
                        const isRequired = selectedApp.roles?.skills_required?.includes(s)
                        return (
                          <span 
                            key={s} 
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              isRequired 
                                ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50' 
                                : 'bg-[#111827] text-gray-400 ring-1 ring-[#1e1e3a]'
                            }`}
                          >
                            {s}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Bio & Portfolio */}
                <div className="mb-8 grid grid-cols-2 gap-8">
                  {profile?.bio && (
                    <div className="col-span-2 md:col-span-1">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Bio</h4>
                      <p className="m-0 text-sm leading-relaxed text-gray-300">{profile.bio}</p>
                    </div>
                  )}

                  <div className="col-span-2 md:col-span-1">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Portfolio Links</h4>
                    <div className="flex flex-col gap-2">
                      {profile?.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#f0f0ff]">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111827]"><ExternalLink size={14} /></div> GitHub
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#f0f0ff]">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111827]"><ExternalLink size={14} /></div> LinkedIn
                        </a>
                      )}
                      {profile?.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#f0f0ff]">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111827]"><Globe size={14} /></div> Personal Site
                        </a>
                      )}
                      {!(profile?.github_url || profile?.linkedin_url || profile?.website_url) && (
                        <span className="text-sm text-gray-600">No links provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar footer fixed to bottom */}
              <div className="shrink-0 border-t border-[#1e1e3a] bg-[#0C0F14] p-5">
                <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Applied {formatDate(selectedApp.created_at)}</span>
                  <div className="flex items-center gap-2">
                    Current Status: <StatusBadge status={selectedApp.status} />
                  </div>
                </div>

                {confirmReject === selectedApp.id ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="m-0 mb-3 text-sm font-semibold text-red-500">Are you sure you want to reject this applicant?</p>
                    <div className="flex gap-3">
                      <button 
                        className="btn-ghost flex-1 py-2 text-sm" 
                        onClick={() => setConfirmReject(null)}
                        disabled={anyLoading(selectedApp.id)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-50 flex justify-center items-center" 
                        onClick={() => rejectApplication(selectedApp.id)}
                        disabled={anyLoading(selectedApp.id)}
                      >
                        {isLoading(selectedApp.id, 'reject') ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                        Yes, Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => markReviewing(selectedApp.id)}
                      disabled={anyLoading(selectedApp.id) || selectedApp.status === 'reviewing'}
                      className="btn-ghost flex-1 justify-center py-3 text-sm flex items-center"
                    >
                      {isLoading(selectedApp.id, 'review') ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : (
                        <Clock size={16} className="mr-2" />
                      )}
                      Mark as Reviewing
                    </button>
                    
                    <button
                      onClick={() => setConfirmReject(selectedApp.id)}
                      disabled={anyLoading(selectedApp.id) || selectedApp.status === 'rejected'}
                      className="flex-1 rounded-lg border border-red-500/30 bg-transparent py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-40 flex justify-center items-center"
                    >
                      <X size={16} className="mr-2 inline" /> Reject
                    </button>

                    <button
                      onClick={() => acceptApplication(selectedApp.id)}
                      disabled={anyLoading(selectedApp.id) || selectedApp.status === 'accepted'}
                      className={`flex-[1.5] justify-center flex items-center rounded-lg py-3 text-sm font-bold text-white transition ${
                        selectedApp.status === 'accepted' ? 'bg-emerald-600/50' : 'bg-emerald-500 hover:bg-emerald-600'
                      } disabled:opacity-40`}
                    >
                      {isLoading(selectedApp.id, 'accept') ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : (
                        <Check size={16} className="mr-2 inline" />
                      )}
                      Accept Student
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
