'use client'

import { useState } from 'react'
import Image from 'next/image'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { InstantSearch, SearchBox, Hits, RefinementList, useHits, Configure } from 'react-instantsearch'
import { Search, X, Filter, ChevronDown, ChevronUp, Check, Briefcase, Clock, Building } from 'lucide-react'
import DOMPurify from 'dompurify'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ''
)

// Types based on the expected Algolia object structure
interface HitProject {
  objectID: string
  id: string
  title: string
  tagline: string
  description: string
  cover_url: string | null
  category: string
  stage: string
  founder_name: string
  founder_avatar: string | null
  roles: {
    id: string
    title: string
    description: string | null
    skills_required: string[]
    commitment: string
    compensation: string
  }[]
  skills: string[]
}

interface DiscoverClientProps {
  studentId: string
}

export default function DiscoverClient({ studentId }: DiscoverClientProps) {
  const [selectedProject, setSelectedProject] = useState<HitProject | null>(null)
  const [applyingRole, setApplyingRole] = useState<{ id: string; title: string } | null>(null)
  
  // Custom Filter Section wrapper
  const FilterSection = ({ title, attribute }: { title: string; attribute: string }) => {
    const [open, setOpen] = useState(true)
    return (
      <div className="mb-6 border-b border-ibf-border pb-4 last:border-0 last:pb-0">
        <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center justify-between font-bold text-ibf-heading">
          <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-extrabold uppercase tracking-widest text-ibf-muted hover:text-ibf-heading transition-colors">{title}</span>
          {open ? <ChevronUp size={16} className="text-ibf-muted" /> : <ChevronDown size={16} className="text-ibf-muted" />}
        </button>
        {open && (
          <div className="custom-refinement-list text-[14px]">
            <RefinementList 
              attribute={attribute} 
              classNames={{
                list: 'flex flex-col gap-2',
                item: 'flex items-center gap-2 group',
                label: 'flex items-center gap-2 cursor-pointer transition-colors w-full',
                checkbox: 'h-[18px] w-[18px] rounded-[4px] border border-ibf-border bg-white text-ibf-secondary focus:ring-ibf-secondary/20 cursor-pointer shadow-sm',
                labelText: 'font-['Bricolage_Grotesque',sans-serif] text-[14px] text-ibf-body group-hover:text-ibf-heading font-medium',
                count: 'ml-auto rounded-full bg-ibf-surface-2 px-2 py-[2px] font-['Bricolage_Grotesque',sans-serif] text-[11px] font-bold text-ibf-muted'
              }}
            />
          </div>
        )}
      </div>
    )
  }

  // Custom Hit Component (Project Card)
  const HitCard = ({ hit }: { hit: any }) => {
    const project = hit as HitProject
    const openRolesCount = project.roles?.length || 0
    const displayedSkills = project.skills?.slice(0, 3) || []
    const remainingSkillsCount = Math.max(0, (project.skills?.length || 0) - 3)

    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className="flex h-full flex-col overflow-hidden rounded-[24px] border border-ibf-border bg-ibf-surface transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-ibf-border-2 card-interactive"
      >
        <div className="relative h-[150px] w-full shrink-0 bg-ibf-surface-2 overflow-hidden">
          {project.cover_url ? (
            <Image src={project.cover_url} alt={project.title} fill className="object-cover hover-zoom-img" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ibf-secondary-light to-ibf-primary-light hover-zoom-img">
              <span className="font-['Instrument_Serif',serif] italic italic text-6xl text-ibf-heading opacity-20">{project.title.charAt(0)}</span>
            </div>
          )}
          {project.category && (
            <div className="absolute left-4 top-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 font-['Bricolage_Grotesque',sans-serif] text-[11px] font-extrabold uppercase tracking-wider text-ibf-heading shadow-sm">
              {project.category}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-ibf-border bg-white shadow-sm">
              {project.founder_avatar ? (
                <img src={project.founder_avatar} alt={project.founder_name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-heading">{project.founder_name?.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-heading leading-none">{project.founder_name}</span>
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[11px] font-medium text-ibf-muted mt-0.5">Founder</span>
            </div>
          </div>

          <h3 className="m-0 mb-1.5 font-['Bricolage_Grotesque',sans-serif] text-[20px] font-extrabold tracking-tight text-ibf-heading line-clamp-1">{project.title}</h3>
          <p className="m-0 mb-5 text-[14px] leading-relaxed text-ibf-body font-light line-clamp-2">{project.tagline}</p>

          <div className="mt-auto">
            <div className="mb-5 flex flex-wrap gap-1.5">
              {displayedSkills.map(s => (
                <span key={s} className="skill-tag border border-ibf-border bg-white text-ibf-body px-2.5 py-1 text-[11px]">{s}</span>
              ))}
              {remainingSkillsCount > 0 && (
                <span className="flex items-center text-[11px] font-semibold text-ibf-muted pl-1">+{remainingSkillsCount}</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-ibf-border pt-4">
              <div className="flex items-center gap-1.5 rounded-lg bg-ibf-surface-2 px-2.5 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-muted">
                <Briefcase size={14} />
                {openRolesCount} role{openRolesCount !== 1 ? 's' : ''}
              </div>
              <button 
                onClick={() => setSelectedProject(project)}
                className="btn-primary rounded-xl px-4 py-2 font-['Bricolage_Grotesque',sans-serif] text-[13px] shadow-sm transform transition hover:-translate-y-0.5"
              >
                View Scope
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Handle Application Submit inside Modal
  const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!applyingRole || !selectedProject) return

    const formData = new FormData(e.currentTarget)
    const coverNote = formData.get('coverNote') as string

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: applyingRole.id, coverNote })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to apply')

      toast.success('Application submitted successfully!')
      setApplyingRole(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const EmptyStateIndicator = () => {
    const { results } = useHits()
    if (results && results.nbHits === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-ibf-surface shadow-sm border border-ibf-border text-4xl">🔍</div>
          <h3 className="mb-2 font-['Bricolage_Grotesque',sans-serif] text-[24px] font-extrabold text-ibf-heading">No projects match</h3>
          <p className="font-['Bricolage_Grotesque',sans-serif] text-[16px] font-light text-ibf-body max-w-sm">Try tweaking your search terms or loosening the filters to find what you're looking for.</p>
        </motion.div>
      )
    }
    return null
  }

  return (
    <div className="relative min-h-[90vh]">
      <InstantSearch searchClient={searchClient} indexName="ibf_projects">
        <Configure hitsPerPage={12} />
        
        {/* Search Bar */}
        <div className="sticky top-0 z-20 mx-[-24px] md:mx-[-40px] lg:mx-[-48px] px-6 md:px-10 lg:px-12 py-5 bg-white/90 backdrop-blur-md border-b border-ibf-border shadow-sm mb-8 lg:mb-12">
          <div className="relative mx-auto max-w-6xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-ibf-muted" size={20} />
            <SearchBox 
              placeholder="Search projects by name, skill, or category..."
              classNames={{
                root: 'w-full',
                form: 'relative w-full shadow-sm rounded-full transition-shadow hover:shadow-md focus-within:shadow-md',
                input: 'w-full rounded-full border-2 border-ibf-border bg-ibf-bg py-4 pl-14 pr-5 font-['Bricolage_Grotesque',sans-serif] text-[16px] font-medium text-ibf-heading placeholder-ibf-muted transition-colors focus:border-ibf-secondary focus:outline-none focus:bg-white',
                submit: 'hidden',
                submitIcon: 'hidden',
                reset: 'absolute right-5 top-1/2 -translate-y-1/2 text-ibf-muted hover:text-ibf-heading bg-ibf-surface rounded-full p-1',
                resetIcon: 'h-4 w-4'
              }}
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-10">
          {/* FILTER SIDEBAR */}
          <div className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-32 rounded-3xl border border-ibf-border bg-white p-6 shadow-sm">
              <div className="mb-8 flex items-center gap-2 font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading tracking-tight">
                <Filter size={18} className="text-ibf-secondary" /> Filters
              </div>
              <div className="flex flex-col gap-2">
                <FilterSection title="Category" attribute="category" />
                <FilterSection title="Stage" attribute="stage" />
                <FilterSection title="Compensation" attribute="roles.compensation" />
                <FilterSection title="Commitment" attribute="roles.commitment" />
              </div>
            </div>
          </div>

          {/* RESULTS GRID */}
          <div className="flex-1 min-w-0 pb-20">
            <div className="w-full">
              <EmptyStateIndicator />
              {/* @ts-ignore */}
              <Hits 
                hitComponent={HitCard}
                classNames={{
                  list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8',
                  item: 'w-full h-full'
                }}
              />
            </div>
          </div>
        </div>
      </InstantSearch>

      {/* DRAWER overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ibf-heading/30 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* PROJECT DETAILS DRAWER */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[550px] flex-col border-l border-ibf-border bg-white shadow-2xl overflow-hidden font-['Bricolage_Grotesque',sans-serif]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-ibf-border bg-ibf-bg/80 px-8 py-5 backdrop-blur-md">
              <span className="font-['Bricolage_Grotesque',sans-serif] text-[12px] font-extrabold uppercase tracking-widest text-ibf-muted">Project Scope</span>
              <button 
                onClick={() => setSelectedProject(null)}
                className="rounded-full bg-ibf-surface p-2 text-ibf-muted transition-colors hover:bg-ibf-border hover:text-ibf-heading"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {selectedProject.cover_url && (
                <div className="mb-8 h-[220px] w-full overflow-hidden rounded-[24px] border border-ibf-border shadow-sm">
                  <Image src={selectedProject.cover_url} alt={selectedProject.title} width={500} height={220} className="h-full w-full object-cover" />
                </div>
              )}
              
              <div className="mb-6">
                <h2 className="mb-3 font-['Bricolage_Grotesque',sans-serif] text-[36px] font-extrabold tracking-tight text-ibf-heading leading-none">
                  {selectedProject.title}
                </h2>
                <p className="font-['Instrument_Serif',serif] italic italic text-[22px] text-ibf-muted leading-snug">
                  {selectedProject.tagline}
                </p>
              </div>
              
              <div className="mb-10 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-ibf-border bg-ibf-surface px-3 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-heading">
                  <Building size={14} className="text-ibf-primary" /> {selectedProject.stage}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-ibf-border bg-ibf-surface px-3 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-heading">
                  <div className="h-5 w-5 overflow-hidden rounded-full border border-ibf-border bg-white">
                    <img src={selectedProject.founder_avatar || ''} className="h-full w-full object-cover" alt="" />
                  </div> 
                  {selectedProject.founder_name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-ibf-border bg-ibf-surface px-3 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-heading">
                  {selectedProject.category}
                </span>
              </div>

              <div className="mb-12">
                <h3 className="mb-4 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-extrabold uppercase tracking-widest text-ibf-heading border-b border-ibf-border pb-3">About the Vision</h3>
                <div 
                  className="prose prose-ibf max-w-none text-[16px] font-light leading-relaxed prose-p:text-ibf-body prose-headings:text-ibf-heading prose-a:text-ibf-primary prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProject.description || '') }}
                />
              </div>

              <div>
                <h3 className="mb-5 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-extrabold uppercase tracking-widest text-ibf-heading border-b border-ibf-border pb-3">Open Opportunities ({selectedProject.roles?.length || 0})</h3>
                
                {selectedProject.roles && selectedProject.roles.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {selectedProject.roles.map(role => (
                      <div key={role.id} className="group rounded-[20px] border border-ibf-border bg-ibf-surface transition-all hover:shadow-md hover:border-ibf-border-2 overflow-hidden">
                        <details className="p-6">
                          <summary className="flex cursor-pointer select-none items-center justify-between outline-none marker:content-none">
                            <span className="flex items-center gap-3 font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ibf-primary-light text-ibf-primary"><Briefcase size={18} /></span>
                              {role.title}
                            </span>
                            <ChevronDown size={20} className="text-ibf-muted transition-transform group-open:rotate-180" />
                          </summary>
                          
                          <div className="mt-6 border-t border-ibf-border pt-6 flex flex-col gap-6">
                            {role.description && <p className="m-0 text-[15px] font-light leading-relaxed text-ibf-body">{role.description}</p>}
                            
                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-white p-4 border border-ibf-border">
                              <div>
                                <div className="text-[11px] font-bold uppercase text-ibf-muted mb-1">Commitment</div>
                                <div className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">{role.commitment}</div>
                              </div>
                              <div>
                                <div className="text-[11px] font-bold uppercase text-ibf-muted mb-1">Compensation</div>
                                <div className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">{role.compensation}</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-[11px] mb-2 font-bold uppercase text-ibf-muted">Required Skills</div>
                              <div className="flex flex-wrap gap-2">
                                {role.skills_required?.map(skill => (
                                  <span key={skill} className="rounded-lg bg-white border border-ibf-border px-3 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[12px] font-bold text-ibf-body shadow-sm">{skill}</span>
                                ))}
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => setApplyingRole(role)}
                              className="btn-primary mt-2 flex w-full items-center justify-center rounded-xl py-3.5 text-[15px] shadow-sm transform transition hover:-translate-y-0.5"
                            >
                              Apply for position
                            </button>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-ibf-border bg-ibf-surface p-6 text-center">
                    <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-medium text-ibf-muted">No open roles currently available.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPLICATION MODAL */}
      <AnimatePresence>
        {applyingRole && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ibf-heading/50 backdrop-blur-md" 
              onClick={() => setApplyingRole(null)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-[500px] overflow-hidden rounded-[32px] border border-ibf-border bg-white shadow-2xl p-2"
            >
              <div className="rounded-[24px] bg-ibf-surface overflow-hidden">
                <div className="flex items-center justify-between border-b border-ibf-border px-8 py-6 bg-white">
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[20px] font-extrabold text-ibf-heading flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ibf-success-light text-ibf-success"><Check size={16}/></div>
                    Submit Application
                  </h3>
                  <button onClick={() => setApplyingRole(null)} className="rounded-full bg-ibf-surface p-2 text-ibf-muted hover:bg-ibf-border hover:text-ibf-heading transition-colors"><X size={18}/></button>
                </div>
                
                <form onSubmit={submitApplication} className="p-8 bg-white pb-8">
                  <div className="mb-8 rounded-2xl border border-ibf-primary-mid/30 bg-ibf-primary-light/50 p-5 shadow-inner">
                    <div className="text-[12px] font-extrabold uppercase tracking-widest text-ibf-primary mb-1">Applying to {selectedProject?.title}</div>
                    <div className="font-['Bricolage_Grotesque',sans-serif] text-[18px] font-extrabold text-ibf-heading">{applyingRole.title}</div>
                  </div>

                  <div className="mb-8">
                    <label htmlFor="coverNote" className="mb-3 block font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">
                      Write a cover note <span className="font-normal text-ibf-muted ml-1">(Optional but recommended)</span>
                    </label>
                    <textarea 
                      id="coverNote"
                      name="coverNote"
                      rows={4}
                      maxLength={500}
                      placeholder="Why are you a good fit for this role? What caught your eye about this startup?"
                      className="w-full resize-none rounded-2xl border-2 border-ibf-border bg-ibf-bg px-5 py-4 min-h-[160px] font-['Bricolage_Grotesque',sans-serif] text-[15px] text-ibf-heading placeholder-ibf-muted transition-colors focus:border-ibf-secondary focus:bg-white focus:outline-none focus:shadow-sm"
                    />
                    <div className="mt-3 text-right font-['Bricolage_Grotesque',sans-serif] text-[12px] font-medium text-ibf-muted">Max 500 characters</div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setApplyingRole(null)}
                      className="flex-1 rounded-xl bg-ibf-surface py-3.5 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading hover:bg-ibf-border transition-colors border border-ibf-border"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn-primary flex-[2] rounded-xl py-3.5 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold shadow-sm transform transition hover:-translate-y-0.5"
                    >
                      Confirm Application
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
