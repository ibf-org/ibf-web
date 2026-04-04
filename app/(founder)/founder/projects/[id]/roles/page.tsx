'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { X, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const QUICK_SKILLS = ['React', 'Node.js', 'Python', 'Figma', 'Flutter', 'ML/AI', 'Marketing', 'DevOps']
const COMMITMENTS = ['Full-time', 'Part-time', 'Flexible']
const COMPENSATIONS = ['Equity only', 'Paid + Equity', 'Unpaid / Volunteering', 'Paid']

export default function ProjectRolesPage() {
  const { id: projectId } = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  
  const [project, setProject] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [commitment, setCommitment] = useState('')
  const [compensation, setCompensation] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!projectId) return

      // Fetch Project
      const { data: projData } = await supabaseBrowser
        .from('projects')
        .select('title, tagline, status')
        .eq('id', projectId)
        .single()
      
      if (projData) setProject(projData)

      // Fetch Roles
      const { data: rolesData } = await supabaseBrowser
        .from('roles')
        .select('*')
        .eq('project_id', projectId)
        .order('id', { ascending: true })

      if (rolesData) setRoles(rolesData)
      setLoading(false)
    }

    if (userId) loadData()
  }, [projectId, userId])

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 8) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    
    // Optimistic
    const prev = [...roles]
    setRoles(roles.filter(r => r.id !== roleId))
    
    const { error } = await supabaseBrowser.from('roles').delete().eq('id', roleId)
    if (error) {
      toast.error('Failed to delete role')
      setRoles(prev)
    } else {
      toast.success('Role deleted')
    }
  }

  const handleAddRole = async () => {
    if (roles.length >= 5) return toast.error('Maximum 5 roles reached')
    
    setSubmitting(true)
    const { data: newRole, error } = await supabaseBrowser
      .from('roles')
      .insert({
        project_id: projectId,
        title,
        description,
        skills_required: skills,
        commitment_type: commitment,
        compensation_type: compensation,
        num_openings: 1
      })
      .select('*')
      .single()

    setSubmitting(false)

    if (error) {
      toast.error(error.message)
    } else if (newRole) {
      toast.success('Role added')
      setRoles([...roles, newRole])
      // Reset form
      setTitle('')
      setDescription('')
      setSkills([])
      setCommitment('')
      setCompensation('')
    }
  }

  const formValid = title.trim() && skills.length > 0 && commitment && compensation

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0C0F14]"><Loader2 className="animate-spin text-ibf-primary" size={32} /></div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0C0F14] p-4 md:p-8">
      <div className="mx-auto w-full max-w-[700px] space-y-6">
        
        {/* Header Card */}
        {project && (
          <div className="rounded-xl border border-[#1e2d4a] bg-ibf-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-syne text-xl font-bold text-ibf-heading">{project.title}</h1>
                <p className="mt-1 font-dm text-sm text-[#8899bb]">{project.tagline}</p>
              </div>
              {project.status === 'open' && (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  Live
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-ibf-primary/20 bg-blue-500/10 p-4 text-center">
          <p className="font-dm text-sm font-medium text-blue-300">
            Add the roles you are looking for. You can add up to 5 roles. ({roles.length}/5)
          </p>
        </div>

        {/* Roles List */}
        {roles.length > 0 && (
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className="relative rounded-xl border border-[#1e2d4a] bg-[#0d1117] p-5 transition-hover hover:border-[#2a3f65]">
                <button 
                  title="Delete Role"
                  onClick={() => handleDeleteRole(role.id)}
                  className="absolute right-4 top-4 text-ibf-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="font-syne text-lg font-bold text-[#e0e8ff]">{role.title}</h3>
                  <span className="rounded bg-ibf-primary-light px-2 py-0.5 text-xs text-[#8899bb]">{role.commitment_type}</span>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">{role.compensation_type}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.skills_required?.map((s: string) => (
                    <span key={s} className="rounded-md bg-ibf-surface border border-[#1e2d4a] px-2 py-0.5 text-[11px] text-ibf-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Role Form */}
        {roles.length < 5 ? (
          <div className="rounded-xl border border-[#1e2d4a] bg-ibf-surface p-6 shadow-xl">
            <h2 className="mb-5 font-syne text-lg font-semibold text-ibf-heading">Add new role</h2>
            
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block font-dm text-sm font-medium text-[#e0e8ff]">Role Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2 text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-dm text-sm font-medium text-[#e0e8ff]">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What will this person do?"
                  className="min-h-[80px] w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2 text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 flex justify-between font-dm text-sm font-medium text-[#e0e8ff]">
                  <span>Skills Required</span>
                  <span className="text-xs text-ibf-muted">{skills.length}/8</span>
                </label>
                
                <div className="mb-2 flex flex-wrap gap-2">
                  {skills.map(s => (
                    <div key={s} className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                      {s}
                      <button title="Remove skill" onClick={() => handleRemoveSkill(s)} className="hover:text-ibf-heading"><X size={12} /></button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(skillInput)
                      }
                    }}
                    placeholder="Type skill & press Enter"
                    className="flex-1 rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-3 py-2 text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                    disabled={skills.length >= 8}
                  />
                  <button 
                    title="Add skill"
                    onClick={() => handleAddSkill(skillInput)}
                    disabled={skills.length >= 8 || !skillInput.trim()}
                    className="flex items-center justify-center rounded-lg bg-ibf-primary-light px-3 text-ibf-heading disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {QUICK_SKILLS.map(qs => (
                    <button
                      key={qs}
                      onClick={() => handleAddSkill(qs)}
                      className="rounded border border-[#1e2d4a] bg-[#0C0F14] hover:bg-ibf-primary-light px-2 py-0.5 text-[11px] text-ibf-muted transition-colors"
                    >
                      + {qs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-dm text-sm font-medium text-[#e0e8ff]">Commitment</label>
                  <div className="flex flex-col gap-2">
                    {COMMITMENTS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCommitment(c)}
                        className={`flex justify-start rounded-lg border px-3 py-2 text-sm transition-colors ${
                          commitment === c
                            ? 'border-ibf-primary bg-blue-500/10 text-ibf-primary font-semibold'
                            : 'border-[#1e2d4a] bg-[#0C0F14] text-[#8899bb] hover:border-[#2a3f65]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block font-dm text-sm font-medium text-[#e0e8ff]">Compensation</label>
                  <div className="flex flex-col gap-2">
                    {COMPENSATIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCompensation(c)}
                        className={`flex justify-start rounded-lg border px-3 py-2 text-sm transition-colors ${
                          compensation === c
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold'
                            : 'border-[#1e2d4a] bg-[#0C0F14] text-[#8899bb] hover:border-[#2a3f65]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddRole}
                disabled={!formValid || submitting}
                className="mt-2 w-full flex justify-center items-center rounded-lg bg-ibf-primary h-[48px] text-sm font-semibold text-ibf-heading transition-opacity hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Add role'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#1e2d4a] bg-ibf-surface p-6 text-center text-[#8899bb] font-dm text-sm">
            Maximum 5 roles reached. You cannot add any more roles to this project.
          </div>
        )}

        <Link
          href="/founder/dashboard"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-ibf-heading transition-opacity hover:bg-indigo-500"
        >
          Done — Go to dashboard <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
