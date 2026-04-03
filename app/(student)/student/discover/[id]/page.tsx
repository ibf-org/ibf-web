import { supabaseAdmin } from '@/lib/supabase-admin'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Globe, Users, Briefcase, Clock, DollarSign } from 'lucide-react'
import ApplyModal from './ApplyModal'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: project } = await supabaseAdmin.from('projects').select('title, tagline').eq('id', id).single()
  return { title: project ? `${project.title} — IBF` : 'Project — IBF', description: project?.tagline }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const { id } = await params

  const { data: dbUser } = await supabaseAdmin.from('users').select('id').eq('clerk_id', userId).single()

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select(`
      id, title, tagline, description, stage, category, cover_image_url, website_url, status, created_at,
      roles(id, title, description, skills_required, commitment_type, compensation_type, num_openings, is_filled),
      users!projects_founder_id_fkey(id, full_name, avatar_url, username, profiles(bio, startup_name, startup_tagline, location_city, linkedin_url))
    `)
    .eq('id', id)
    .single()

  if (!project) redirect('/student/discover')

  const { data: teamMembers } = await supabaseAdmin.from('team_members').select('id').eq('project_id', id)
  const { data: myApplications } = dbUser ? await supabaseAdmin.from('applications').select('role_id, status').eq('student_id', dbUser.id).in('role_id', (project.roles || []).map((r: { id: string }) => r.id)) : { data: [] }

  const founder = project.users as unknown as { id: string; full_name: string; avatar_url: string | null; username: string; profiles: { bio: string | null; startup_name: string | null; startup_tagline: string | null; location_city: string | null; linkedin_url: string | null } | null } | null
  const founderProfile = Array.isArray(founder?.profiles) ? founder?.profiles[0] : founder?.profiles
  const openRoles = (project.roles || []).filter((r: { is_filled: boolean }) => !r.is_filled)
  const appliedRoleIds = new Set((myApplications || []).map((a: { role_id: string }) => a.role_id))

  return (
    <div className="max-w-[860px]">
      <Link href="/student/discover" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 no-underline hover:text-gray-400">
        <ArrowLeft size={16} /> Back to Discover
      </Link>

      {/* Cover */}
      {project.cover_image_url && (
        <div className="relative mb-6 h-[240px] overflow-hidden rounded-xl">
          <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2.5 flex gap-2">
            <span className="badge badge-violet">{project.category}</span>
            <span className="badge badge-cyan">{project.stage}</span>
            <span className={`badge ${project.status === 'open' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' : 'border-gray-500/30 bg-gray-500/15 text-gray-400'}`}>
              {project.status}
            </span>
          </div>
          <h1 className="m-0 mb-2 font-display text-[28px] font-bold text-[#f0f0ff]">{project.title}</h1>
          <p className="m-0 text-base text-gray-400">{project.tagline}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <Users size={14} />
            {(teamMembers?.length || 0) + 1} member{(teamMembers?.length || 0) + 1 !== 1 ? 's' : ''}
          </div>
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3.5 py-1.5 text-[13px]">
              <Globe size={14} /> Website
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          <div className="card mb-5">
            <h2 className="m-0 mb-4 font-display text-[17px] font-bold text-[#f0f0ff]">About this Project</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-400">{project.description}</div>
          </div>

          {/* Open Roles */}
          <h2 className="m-0 mb-3.5 font-display text-[17px] font-bold text-[#f0f0ff]">
            Open Roles ({openRoles.length})
          </h2>
          {openRoles.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">No open roles right now</div>
          ) : (
            <div className="flex flex-col gap-3">
              {openRoles.map((role: { id: string; title: string; description: string; skills_required: string[]; commitment_type: string; compensation_type: string; num_openings: number }) => {
                const hasApplied = appliedRoleIds.has(role.id)
                return (
                  <div key={role.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="m-0 mb-1.5 font-display text-base font-bold text-[#f0f0ff]">{role.title}</h3>
                        <p className="m-0 mb-2.5 text-[13px] leading-relaxed text-gray-400">{role.description}</p>
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          {role.skills_required.map((s: string) => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12} />{role.commitment_type}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><DollarSign size={12} />{role.compensation_type}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Briefcase size={12} />{role.num_openings} opening{role.num_openings > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {hasApplied ? (
                        <span className="badge badge-green shrink-0">Applied ✓</span>
                      ) : dbUser ? (
                        <ApplyModal projectId={project.id} projectTitle={project.title} roleId={role.id} roleTitle={role.title} studentId={dbUser.id} />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Founder card */}
        {founder && (
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="sticky top-5 self-start">
            <div className="card p-5">
              <h3 className="m-0 mb-3.5 font-display text-sm font-semibold uppercase tracking-wide text-gray-500">Founder</h3>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-lg font-bold text-white">
                  {founder.avatar_url ? <Image src={founder.avatar_url} alt={founder.full_name} width={48} height={48} className="object-cover" /> : founder.full_name.charAt(0)}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[#f0f0ff]">{founder.full_name}</div>
                  {founderProfile?.startup_name && <div className="text-xs text-gray-400">{founderProfile.startup_name}</div>}
                </div>
              </div>
              {founderProfile?.bio && <p className="m-0 mb-3.5 text-[13px] leading-relaxed text-gray-400">{founderProfile.bio}</p>}
              {founderProfile?.startup_tagline && <p className="m-0 mb-3.5 text-xs italic text-gray-500">"{founderProfile.startup_tagline}"</p>}
              <Link href={`/u/${founder.username}`} className="btn-secondary w-full justify-center text-[13px] min-h-[44px] active:scale-[0.97] transition-transform">
                View Profile
              </Link>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
