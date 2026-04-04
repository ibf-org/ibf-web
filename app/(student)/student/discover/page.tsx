'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { Search, MapPin, Briefcase, GraduationCap, Globe, Clock, Loader2, Filter } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/nextjs'

const CATEGORIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'Marketplace', 'Social', 'Climate', 'Gaming', 'Other']
const STAGES = ['Idea', 'MVP', 'Early Traction', 'Growth']
const COMPENSATIONS = ['Equity', 'Unpaid Learning', 'Stipend Possible']

export default function DiscoverPage() {
  const { userId: clerkId } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog State
  const [showDialog, setShowDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [coverNote, setCoverNote] = useState('')
  const [applying, setApplying] = useState(false)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      
      let query = supabaseBrowser
        .from('projects')
        .select('*, roles(*), founder:users!founder_id(full_name, avatar_url)')
        .eq('is_public', true)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(24)

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,tagline.ilike.%${debouncedSearch}%`)
      }

      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories)
      }
      
      if (selectedStages.length > 0) {
        query = query.in('stage', selectedStages)
      }

      const { data, error } = await query
      
      if (data) {
        setProjects(data)
      }
      setLoading(false)
    }

    fetchProjects()
  }, [debouncedSearch, selectedCategories, selectedStages])

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }
  
  const toggleStage = (stage: string) => {
    setSelectedStages(prev => prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage])
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedStages([])
    setSearchTerm('')
  }

  const handleApplyClick = (project: any) => {
    setSelectedProject(project)
    setSelectedRoleId('')
    setCoverNote('')
    setShowDialog(true)
  }

  const submitApplication = async () => {
    if (!selectedRoleId || !clerkId) return
    setApplying(true)

    try {
      // Get internal user id
      const { data: user } = await supabaseBrowser
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single()
        
      if (!user) throw new Error('User not found')

      // Check duplicate
      const { data: existing } = await supabaseBrowser
        .from('applications')
        .select('id')
        .eq('role_id', selectedRoleId)
        .eq('student_id', user.id)
        .maybeSingle()

      if (existing) {
        toast.error('You have already applied for this role.')
        setApplying(false)
        setShowDialog(false)
        return
      }

      const { error } = await supabaseBrowser
        .from('applications')
        .insert({
          role_id: selectedRoleId,
          student_id: user.id,
          cover_note: coverNote || null,
          status: 'pending'
        })
        
      if (error) throw error
      
      toast.success('Applied successfully!')
      setShowDialog(false)
    } catch (err: any) {
      toast.error('Failed to apply: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  const hasFilters = selectedCategories.length > 0 || selectedStages.length > 0 || debouncedSearch !== ''

  return (
    <div className="flex min-h-screen bg-[#0C0F14] text-ibf-heading">
      {/* FILTER SIDEBAR */}
      <aside className="hidden w-[260px] flex-shrink-0 flex-col border-r border-[#1e2d4a] bg-ibf-surface p-6 lg:flex">
        <h2 className="mb-6 font-syne text-lg font-bold text-ibf-heading">Filters</h2>
        
        <div className="mb-6">
          <h3 className="mb-3 font-dm text-sm font-semibold uppercase text-ibf-muted">Category</h3>
          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="h-4 w-4 rounded border-[#1e2d4a] bg-[#0C0F14] text-ibf-secondary focus:ring-[#1D9E75] focus:ring-offset-0"
                  aria-label={`Filter by ${cat}`}
                />
                <span className="font-dm text-sm text-[#e0e8ff]">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 font-dm text-sm font-semibold uppercase text-ibf-muted">Stage</h3>
          <div className="flex flex-col gap-2.5">
            {STAGES.map(stage => (
              <label key={stage} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage)}
                  onChange={() => toggleStage(stage)}
                  className="h-4 w-4 rounded border-[#1e2d4a] bg-[#0C0F14] text-ibf-secondary focus:ring-[#1D9E75] focus:ring-offset-0"
                  aria-label={`Filter by ${stage}`}
                />
                <span className="font-dm text-sm text-[#e0e8ff]">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-2 text-left font-dm text-sm font-medium text-ibf-muted transition-colors hover:text-ibf-primary"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        
        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ibf-muted" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-[10px] border border-[#1e2d4a] bg-ibf-surface py-3 pl-11 pr-4 font-dm text-[15px] text-ibf-heading placeholder-[#4a5a7a] focus:border-[#1D9E75] focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
            aria-label="Search projects"
          />
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[280px] animate-pulse rounded-xl border border-[#1e2d4a] bg-ibf-surface"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e2d4a] bg-ibf-surface/50 text-center">
            <Filter className="mb-4 text-ibf-muted" size={32} />
            <h3 className="font-syne text-lg font-bold text-[#e0e8ff]">No projects match your filters</h3>
            <p className="mt-2 font-dm text-sm text-[#8899bb]">Try adjusting your search or categories to find more opportunities.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 rounded-lg bg-ibf-primary-light px-5 py-2 font-dm text-sm font-medium hover:bg-[#2a3f65]"
                aria-label="Clear filters"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const openRoles = project.roles?.filter((r: any) => !r.is_filled) || []
              const primarySkills = openRoles.flatMap((r: any) => r.skills_required || []).slice(0, 3)

              return (
                <div key={project.id} className="group flex flex-col overflow-hidden rounded-xl border border-[#1e2d4a] bg-ibf-surface transition-colors hover:border-[#1D9E75]">
                  <div className="relative h-[130px] w-full bg-ibf-primary-light">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-teal-900/30 text-2xl font-bold text-teal-500/50">
                        {project.title.charAt(0)}
                      </div>
                    )}
                    <span className="absolute right-3 top-3 rounded bg-ibf-bg/60 px-2 py-0.5 font-dm text-[10px] font-bold uppercase tracking-wider text-ibf-heading backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-[14px]">
                    <h3 className="line-clamp-2 font-syne text-[15px] font-semibold tracking-tight text-[#e0e8ff]">{project.title}</h3>
                    <p className="mt-1 line-clamp-2 min-h-[36px] font-dm text-xs text-[#8899bb]">{project.tagline}</p>
                    
                    <div className="mt-3 flex items-center gap-2">
                      {project.founder?.avatar_url ? (
                        <img src={project.founder.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ibf-primary-light text-[10px] font-bold">
                          {project.founder?.full_name?.charAt(0)}
                        </div>
                      )}
                      <span className="font-dm text-xs text-ibf-muted">{project.founder?.full_name}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {primarySkills.length > 0 ? primarySkills.map((skill: string, i: number) => (
                        <span key={i} className="rounded-full bg-[#1a2a3a] px-2 py-0.5 font-dm text-[11px] text-[#4B9CF5]">
                          {skill}
                        </span>
                      )) : (
                        <span className="rounded-full bg-ibf-primary-light px-2 py-0.5 font-dm text-[11px] text-[#8899bb]">General</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1e2d4a] p-[10px] px-3">
                    <span className="font-dm text-xs text-ibf-muted">{openRoles.length} open roles</span>
                    <button
                      onClick={() => handleApplyClick(project)}
                      className="rounded-md border border-[#1D9E75] bg-[#0d3a28] px-3.5 py-1 font-dm text-xs font-semibold text-ibf-secondary transition-colors hover:bg-[#1D9E75] hover:text-black"
                      aria-label={`Apply to ${project.title}`}
                    >
                      Apply →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* SHADCN-STYLE DIALOG (Custom Built for specific styles) */}
      {showDialog && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ibf-bg/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#1e2d4a] bg-ibf-surface shadow-2xl">
            <div className="border-b border-[#1e2d4a] p-5">
              <h2 className="font-syne text-lg font-bold text-ibf-heading">Apply to {selectedProject.title}</h2>
            </div>
            
            <div className="p-5">
              <label className="mb-3 block font-dm text-sm font-medium text-[#e0e8ff]">Select role</label>
              
              <div className="mb-5 space-y-2">
                {selectedProject.roles?.filter((r: any) => !r.is_filled).map((role: any) => (
                  <label key={role.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${selectedRoleId === role.id ? 'border-[#1D9E75] bg-[#0d3a28]/30' : 'border-[#1e2d4a] hover:border-[#2a3f65]'}`}>
                    <input
                      type="radio"
                      name="role_id"
                      value={role.id}
                      checked={selectedRoleId === role.id}
                      onChange={() => setSelectedRoleId(role.id)}
                      className="mt-0.5 h-4 w-4 border-[#1e2d4a] text-ibf-secondary focus:ring-[#1D9E75] focus:ring-offset-0"
                      aria-label={`Select role ${role.title}`}
                    />
                    <div>
                      <p className="font-dm text-sm font-semibold text-[#e0e8ff]">{role.title}</p>
                      <p className="font-dm text-xs text-[#8899bb]">{role.commitment_type} · {role.compensation_type}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mb-2 flex justify-between">
                <label className="font-dm text-sm font-medium text-[#e0e8ff]">Cover Note (Optional)</label>
                <span className="font-dm text-xs text-ibf-muted">{coverNote.length}/500</span>
              </div>
              <textarea
                maxLength={500}
                value={coverNote}
                onChange={e => setCoverNote(e.target.value)}
                placeholder="Why are you a good fit?"
                className="min-h-[100px] w-full resize-none rounded-lg border border-[#1e2d4a] bg-[#0C0F14] p-3 font-dm text-sm text-ibf-heading focus:border-[#1D9E75] focus:outline-none"
                aria-label="Cover Note"
              />
            </div>

            <div className="flex gap-3 border-t border-[#1e2d4a] bg-[#0C0F14]/50 p-5 rounded-b-xl">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 rounded-lg border border-[#1e2d4a] py-2.5 font-dm text-sm font-medium text-[#e0e8ff] hover:bg-ibf-primary-light"
                aria-label="Cancel application"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={!selectedRoleId || applying}
                className="flex-1 flex items-center justify-center rounded-lg bg-[#1D9E75] py-2.5 font-dm text-sm font-bold text-black hover:bg-[#15825f] disabled:opacity-50"
                aria-label="Submit application"
              >
                {applying ? <Loader2 size={16} className="animate-spin" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
