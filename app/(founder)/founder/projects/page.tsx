'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, LayoutDashboard, Search, Settings } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'

export default function FounderProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      // In RLS, projects.founder_id is checked against get_my_user_id() automatically
      // if using an authenticated client, but we might just fetch ours explicitly.
      // Wait, supabaseBrowser needs to be authenticated. Assuming it is.
      // Easiest is to select the projects and join roles + applications + team_members
      const { data, error } = await supabaseBrowser
        .from('projects')
        .select(`
          id, title, tagline, stage, category, cover_image_url, status, created_at,
          roles (
            id,
            is_filled,
            applications ( id )
          ),
          team_members ( id )
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setProjects(data)
      }
      setLoading(false)
    }
    
    fetchProjects()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] text-white">
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-syne text-2xl font-bold text-white">My Projects</h1>
          <Link
            href="/founder/projects/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-500"
          >
            Post new project <Plus size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[120px] animate-pulse rounded-xl bg-[#111827] border border-[#1e2d4a]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#1e2d4a] p-12 text-center mt-8">
            <h2 className="font-syne text-xl font-bold text-[#e0e8ff]">You have not posted a project yet</h2>
            <p className="mt-2 font-dm text-sm text-[#8899bb]">Post your first project and start finding your team.</p>
            <Link
              href="/founder/projects/new"
              className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Post your first project →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {projects.map((project) => {
              // Calculate stats client-side 
              const openRoles = project.roles?.filter((r: any) => !r.is_filled).length || 0
              const applicationCount = project.roles?.reduce((acc: number, role: any) => acc + (role.applications?.length || 0), 0) || 0
              const teamSize = project.team_members?.length || 0

              return (
                <div key={project.id} className="flex items-center rounded-xl border border-[#1e2d4a] bg-[#111827] p-5 transition-colors hover:border-[#2a3f65]">
                  {/* Left: Cover */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#1e2d4a]">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-900/40 text-xl font-bold text-indigo-300">
                        {project.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 px-4">
                    <h3 className="font-syne text-base font-semibold text-[#e0e8ff]">{project.title}</h3>
                    <p className="truncate font-dm text-[13px] text-[#8899bb]">{project.tagline}</p>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                       <span className="rounded-md bg-[#1e2d4a] px-2 py-0.5 text-xs text-[#8899bb]">{project.stage}</span>
                       <span className="rounded-md bg-[#1e2d4a] px-2 py-0.5 text-xs text-[#8899bb]">{project.category}</span>
                       <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                         project.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' :
                         project.status === 'paused' ? 'bg-amber-500/10 text-amber-400' :
                         'bg-gray-500/10 text-gray-400'
                       }`}>
                         {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                       </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 font-dm text-xs text-[#4a5a7a]">
                      <span>{openRoles} open roles</span>
                      <span>·</span>
                      <span>{applicationCount} applications</span>
                      <span>·</span>
                      <span>{teamSize} team members</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/founder/projects/${project.id}/roles`}
                        className="rounded-md border border-[#1e2d4a] px-3.5 py-1.5 text-xs font-medium text-[#8899bb] hover:bg-[#1e2d4a] hover:text-[#e0e8ff]"
                      >
                        Manage roles
                      </Link>
                      <Link
                        href={`/founder/projects/${project.id}/applications`}
                        className="rounded-md border border-[#1e2d4a] px-3.5 py-1.5 text-xs font-medium text-[#8899bb] hover:bg-[#1e2d4a] hover:text-[#e0e8ff]"
                      >
                        Applications
                      </Link>
                      <button title="Edit project" className="flex items-center justify-center rounded-md p-1.5 text-[#4a5a7a] hover:bg-[#1e2d4a] hover:text-[#e0e8ff]">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
