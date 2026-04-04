'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, Edit2, Check, X, MessageSquare, Award, Trash2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateTeamRoleTitle, removeTeamMember, submitEndorsement } from './actions'

type Member = any // Bypassing deep structural Typescript definition complexity
type Project = { id: string, title: string }

export default function TeamClient({ initialMembers, projects, giverId }: { initialMembers: Member[], projects: Project[], giverId: string }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectId, setProjectId] = useState('all')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const [endorseMemberId, setEndorseMemberId] = useState<Member | null>(null)
  const [endorseText, setEndorseText] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Manual Member State
  const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualRole, setManualRole] = useState('')

  // Handle mock manual add
  const handleAddManualMember = () => {
    if (!manualName.trim() || !manualRole.trim()) {
      toast.error('Name and role are required.')
      return
    }
    const newMockMember = {
      id: `manual_${Date.now()}`,
      user_id: `manual_user_${Date.now()}`,
      project_id: projectId === 'all' ? (projects[0]?.id || 'unknown') : projectId,
      role_title: manualRole,
      joined_at: new Date().toISOString(),
      users: {
        full_name: manualName,
        username: manualName.toLowerCase().replace(/\s/g, ''),
        avatar_url: null,
        profiles: [{
          is_student: false,
          university: 'External',
          skills: ['Manual Member'],
          availability_status: 'Not Available'
        }]
      }
    }
    setMembers(prev => [...prev, newMockMember])
    toast.success(`${manualName} was added to your team.`)
    setIsAddManualModalOpen(false)
    setManualName('')
    setManualEmail('')
    setManualRole('')
  }

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchProject = projectId === 'all' || m.project_id === projectId
      const lowerQ = searchQuery.toLowerCase()
      const profiles = m.users?.profiles?.[0] || {}
      const matchStr = (m.users?.full_name || m.users?.username || '').toLowerCase()
      const matchSkill = (profiles.skills || []).some((s: string) => s.toLowerCase().includes(lowerQ))
      const matchSearch = matchStr.includes(lowerQ) || matchSkill
      return matchProject && matchSearch
    })
  }, [members, projectId, searchQuery])

  const handleSaveTitle = async (id: string) => {
    // Optimistic update
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role_title: editTitle } : m))
    setEditingId(null)
    const res = await updateTeamRoleTitle(id, editTitle)
    if (!res.success) {
      toast.error('Failed to update role title')
    } else {
      toast.success('Role updated')
    }
  }

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your team?`)) return
    
    // Optimistic removal
    setMembers(prev => prev.filter(m => m.id !== id))
    const res = await removeTeamMember(id)
    if (!res.success) {
      toast.error('Failed to remove member')
      // re-fetch or reload could occur here
    } else {
      toast.success('Member removed')
    }
  }

  const handleEndorse = async () => {
    if (!endorseMemberId) return
    setIsSubmitting(true)
    const res = await submitEndorsement(giverId, endorseMemberId.user_id, endorseMemberId.project_id, endorseText, selectedSkills)
    setIsSubmitting(false)
    if (res.success) {
      toast.success('Endorsement sent!')
      setEndorseMemberId(null)
      setEndorseText('')
      setSelectedSkills([])
    } else {
      toast.error('Failed to submit endorsement')
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-bricolage text-[28px] font-extrabold text-ibf-heading flex items-center gap-3">
          Your team
          <span className="rounded-full bg-[var(--ibf-primary-light)] px-3 py-1 text-[13px] font-semibold text-[#5B21B6]">
            {members.length}
          </span>
        </h1>
        <p className="font-dm text-ibf-muted mt-1">Manage the people building with you.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-xl border border-[var(--ibf-border)] bg-white px-4 py-2.5 font-dm text-[14px] text-ibf-heading focus:border-[#C4B5FD] focus:outline-none focus:ring-1 focus:ring-[#C4B5FD]"
          title="Filter by Project"
        >
          <option value="all">All projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-ibf-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--ibf-border)] bg-white pb-2.5 pl-10 pr-4 pt-2.5 font-dm text-[14px] text-ibf-heading transition-all focus:border-[#C4B5FD] focus:outline-none focus:ring-1 focus:ring-[#C4B5FD]"
          />
        </div>

        <button
          onClick={() => setIsAddManualModalOpen(true)}
          className="shrink-0 rounded-xl bg-[#5B21B6] px-5 py-2.5 font-bricolage text-[14px] font-semibold text-ibf-heading transition-all hover:bg-[#4c1d95]"
        >
          Add Manual Member
        </button>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ibf-border)] p-12 text-center">
          <h3 className="font-['Instrument_Serif',serif] italic text-[22px] italic text-ibf-heading">Great teams don't appear.</h3>
          <p className="mt-2 font-bricolage text-[14px] font-light text-ibf-muted">
            They're assembled, one right person at a time. Accept your first application to start building.
          </p>
          <Link href="/founder/applications" className="mt-6 inline-block rounded-lg bg-[var(--ibf-heading)] px-5 py-2.5 font-bricolage text-[13px] font-semibold text-ibf-heading hover:bg-[#2c2214]">
            View Applications →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map(m => {
            const user = m.users || {}
            const profile = user.profiles?.[0] || {}
            const isStudent = profile.is_student
            const displayName = user.full_name || user.username || 'Unknown User'

            return (
              <div key={m.id} className="group flex flex-col justify-between rounded-[14px] border border-[var(--ibf-border)] bg-white p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#C4B5FD] hover:shadow-sm">
                
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={displayName} width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" />
                      ) : (
                        <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-full text-ibf-heading font-bricolage font-bold text-lg ${isStudent ? 'bg-[#1D9E75]' : 'bg-[#5B21B6]'}`}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bricolage text-[15px] font-bold text-ibf-heading">{displayName}</h4>
                          {isStudent && (
                            <span className="rounded bg-[#E5F5F0] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ibf-secondary">STUDENT</span>
                          )}
                        </div>
                        <p className="mt-0.5 font-bricolage text-[12px] font-light text-ibf-muted">
                          {profile.university || 'No university listed'} • Joined {format(new Date(m.joined_at), 'MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="block font-bricolage text-[11px] font-semibold uppercase tracking-wider text-ibf-muted">
                      Role on your team
                    </span>
                    <div className="mt-1 h-[28px]">
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full rounded border border-[#C4B5FD] px-2 py-1 font-bricolage text-[14px] text-ibf-heading focus:outline-none"
                            placeholder="e.g. Frontend Developer"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveTitle(m.id)}
                          />
                          <button onClick={() => handleSaveTitle(m.id)} className="text-ibf-secondary hover:text-[#0A7A70]"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-ibf-muted hover:text-red-500"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="group/edit flex w-max cursor-pointer items-center gap-2" onClick={() => { setEditingId(m.id); setEditTitle(m.role_title || 'Team Member') }}>
                          <span className="font-bricolage text-[14px] font-medium text-[var(--ibf-primary)]">
                            {m.role_title || 'Team Member'}
                          </span>
                          <Edit2 size={12} className="text-transparent transition-colors group-hover/edit:text-ibf-hint" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[var(--ibf-surface)] px-2 py-1 font-dm text-[11px] font-medium text-ibf-body">
                      Proj: {m.projects?.title || 'Unknown'}
                    </span>
                    {profile.availability_status && (
                      <span className="rounded bg-gray-100 px-2 py-1 font-dm text-[11px] font-medium text-gray-600">
                        {profile.availability_status}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(profile.skills || []).slice(0,3).map((skill: string) => (
                      <span key={skill} className="rounded border border-[var(--ibf-border)] bg-[var(--ibf-bg)] px-2 py-0.5 font-dm text-[11px] text-ibf-muted">
                        {skill}
                      </span>
                    ))}
                    {(profile.skills || []).length > 3 && (
                      <span className="rounded border border-[var(--ibf-border)] bg-white px-2 py-0.5 font-dm text-[10px] text-ibf-muted">
                        +{(profile.skills.length - 3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-5 flex items-center justify-between border-t border-[var(--ibf-border)] pt-3">
                  <Link 
                    href={`/u/${user.username}`} 
                    target="_blank" 
                    className="flex items-center gap-1 font-bricolage text-[12px] font-medium text-[#5B21B6] hover:underline"
                  >
                    View profile <ExternalLink size={12} />
                  </Link>

                  <div className="flex gap-2">
                    <Link
                      href={`/chat`}
                      className="rounded p-1.5 text-ibf-secondary hover:bg-[#E5F5F0]"
                      title="Send message"
                    >
                      <MessageSquare size={16} />
                    </Link>
                    <button
                      onClick={() => setEndorseMemberId(m)}
                      className="rounded p-1.5 text-[#F59E0B] hover:bg-orange-50"
                      title="Endorse"
                    >
                      <Award size={16} />
                    </button>
                    <button
                      onClick={() => handleRemove(m.id, displayName)}
                      className="rounded p-1.5 text-ibf-muted hover:bg-red-50 hover:text-red-600"
                      title="Remove from team"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Endorse Modal Overlay (Custom fallback since shadcn cancelled) */}
      {endorseMemberId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ibf-bg/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bricolage text-[18px] font-bold text-ibf-heading">
                Endorse {endorseMemberId.users?.full_name || endorseMemberId.users?.username}
              </h3>
              <button onClick={() => setEndorseMemberId(null)} className="text-ibf-muted hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <label className="text-[14px] font-medium text-ibf-heading mb-1.5 block font-bricolage">
              What did they contribute? How did they show up?
            </label>
            <textarea 
              rows={4}
              maxLength={280}
              value={endorseText}
              onChange={(e) => setEndorseText(e.target.value)}
              className="w-full rounded-xl border border-[var(--ibf-border)] p-3 text-[14px] outline-none focus:border-[#C4B5FD] font-dm resize-none"
              placeholder="They were an incredible asset to the team..."
            />
            <div className="text-right text-[11px] text-ibf-muted mt-1">{endorseText.length}/280</div>

            <div className="mt-4">
              <label className="text-[13px] font-semibold text-ibf-heading mb-2 block font-bricolage">
                Confirm which skills they demonstrated
              </label>
              <div className="flex flex-wrap gap-2">
                {(endorseMemberId.users?.profiles?.[0]?.skills || []).map((skill: string) => {
                  const isChecked = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkills(prev => isChecked ? prev.filter(s => s !== skill) : [...prev, skill])}
                      className={`rounded-full px-3 py-1 font-dm text-[12px] transition-colors border ${isChecked ? 'bg-[#5B21B6] text-ibf-heading border-[#5B21B6]' : 'bg-white text-ibf-muted border-[var(--ibf-border)] hover:border-[#C4B5FD]'}`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setEndorseMemberId(null)}
                className="rounded-xl px-4 py-2 font-bricolage text-[14px] font-medium text-ibf-muted hover:bg-[var(--ibf-surface)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleEndorse}
                disabled={isSubmitting || !endorseText.trim()}
                className="rounded-xl bg-[#5B21B6] px-5 py-2 font-bricolage text-[14px] font-semibold text-ibf-heading hover:bg-[#4c1d95] disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Endorsement'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Manual Member Modal Overlay */}
      {isAddManualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ibf-bg/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bricolage text-[18px] font-bold text-ibf-heading">
                Add Team Member Manually
              </h3>
              <button onClick={() => setIsAddManualModalOpen(false)} className="text-ibf-muted hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <p className="font-dm text-[13px] text-ibf-muted mb-6">
              Inviting someone who isn't on the platform yet? Add them manually to keep track of your team structure.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-ibf-heading mb-1.5 block font-bricolage">Full Name *</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ibf-border)] p-3 text-[14px] outline-none focus:border-[#C4B5FD] font-dm"
                  placeholder="e.g. Sarah Connor"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-ibf-heading mb-1.5 block font-bricolage">Role / Title *</label>
                <input
                  type="text"
                  value={manualRole}
                  onChange={e => setManualRole(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ibf-border)] p-3 text-[14px] outline-none focus:border-[#C4B5FD] font-dm"
                  placeholder="e.g. Lead Designer"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-ibf-heading mb-1.5 block font-bricolage">Email Address (Optional)</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={e => setManualEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ibf-border)] p-3 text-[14px] outline-none focus:border-[#C4B5FD] font-dm"
                  placeholder="e.g. sarah@example.com"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddManualModalOpen(false)}
                className="rounded-xl px-4 py-2 font-bricolage text-[14px] font-medium text-ibf-muted hover:bg-[var(--ibf-surface)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddManualMember}
                className="rounded-xl bg-[#5B21B6] px-5 py-2 font-bricolage text-[14px] font-semibold text-ibf-heading hover:bg-[#4c1d95]"
              >
                Add to Team
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
