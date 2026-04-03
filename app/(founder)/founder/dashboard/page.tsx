import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Plus, FolderOpen, FileText, Users, Briefcase } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import Image from 'next/image'

export const metadata = { title: 'Dashboard — IBF Founder' }

interface Role { id: string; is_filled: boolean }
interface Application { id: string; status: string }
interface Project {
  id: string
  title: string
  tagline: string
  category: string
  stage: string
  status: string
  cover_image_url: string | null
  roles: Role[]
  applications: Application[]
}

const CATEGORY_EMOJI: Record<string, string> = {
  Fintech: '💰', Edtech: '📚', Healthtech: '🏥', SaaS: '⚡',
  Marketplace: '🛍️', Social: '💬', Deeptech: '🔬', Climate: '🌱',
}

export default async function FounderDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: dbUser, error } = await supabaseAdmin
    .from('users').select('id, full_name').eq('clerk_id', userId).single()
  if (error || !dbUser) {
    throw new Error(`Database desync detected: User fetching failed (${error?.message || 'Record not synced'}). Please sign out and sign in back safely.`)
  }

  const { data: projects = [] } = await supabaseAdmin
    .from('projects')
    .select(`id, title, tagline, category, stage, status, cover_image_url,
      roles(id, is_filled),
      applications(id, status)`)
    .eq('founder_id', dbUser.id)
    .order('created_at', { ascending: false })

  const { count: teamCount } = await supabaseAdmin
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .in('project_id', (projects || []).map((p: Project) => p.id))

  const stats = {
    projects: projects?.length ?? 0,
    openRoles: (projects ?? []).reduce((s: number, p: Project) => s + p.roles.filter(r => !r.is_filled).length, 0),
    applications: (projects ?? []).reduce((s: number, p: Project) => s + p.applications.length, 0),
    team: teamCount ?? 0,
  }

  const firstName = dbUser.full_name?.split(' ')[0] ?? 'Founder'

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="m-0 mb-1 font-display text-2xl font-bold text-[#f0f0ff]">
          Welcome back, {firstName} 👋
        </h1>
        <p className="m-0 text-sm text-gray-500">Here&apos;s what&apos;s happening with your projects</p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Projects" value={stats.projects} icon={<FolderOpen size={16} className="text-violet-400" />} color="violet" />
        <StatCard label="Open Roles" value={stats.openRoles} icon={<Briefcase size={16} className="text-blue-400" />} color="blue" />
        <StatCard label="Applications" value={stats.applications} icon={<FileText size={16} className="text-amber-400" />} color="amber" />
        <StatCard label="Team Members" value={stats.team} icon={<Users size={16} className="text-emerald-400" />} color="emerald" />
      </div>

      {/* Projects section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 font-display text-lg font-bold text-[#f0f0ff]">Your projects</h2>
        <Link href="/founder/projects/new" className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white no-underline hover:bg-blue-500">
          <Plus size={15} /> New project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1e2a3a] bg-[#111827] px-8 py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-[#1e2a3a]">
            <FolderOpen size={32} className="text-gray-600" />
          </div>
          <h3 className="m-0 mb-2 font-display text-xl font-bold text-[#f0f0ff]">
            You haven&apos;t posted a project yet
          </h3>
          <p className="m-0 mb-6 max-w-sm text-sm text-gray-500">
            Share your startup idea and let talented students discover and apply to work with you.
          </p>
          <Link href="/founder/projects/new" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-blue-500">
            <Plus size={16} /> Post your first project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(projects as Project[]).map((project, i) => {
            const openRoles = project.roles.filter(r => !r.is_filled).length
            const totalApps = project.applications.length
            const pendingApps = project.applications.filter(a => a.status === 'pending').length

            return (
              <div
                key={project.id}
                data-index={i}
                className="project-row flex items-center gap-4 rounded-[10px] border border-[#1e2a3a] bg-[#111827] p-4 transition-colors hover:border-[#2a3a5a]"
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1e2a3a]">
                  {project.cover_image_url ? (
                    <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      {CATEGORY_EMOJI[project.category] ?? '🚀'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-display text-[15px] font-semibold text-[#f0f0ff] truncate">{project.title}</span>
                    <StatusBadge status={project.status} />
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                      {project.stage}
                    </span>
                  </div>
                  <p className="m-0 mb-1.5 truncate text-[13px] text-gray-500">{project.tagline}</p>
                  <div className="flex flex-wrap gap-3 text-[12px] text-gray-500">
                    <span className="flex items-center gap-1"><Briefcase size={11} /> {openRoles} role{openRoles !== 1 ? 's' : ''} open</span>
                    <span className={`flex items-center gap-1 ${pendingApps > 0 ? 'text-amber-400' : ''}`}>
                      <FileText size={11} /> {totalApps} application{totalApps !== 1 ? 's' : ''}
                      {pendingApps > 0 && <span className="font-semibold"> · {pendingApps} new</span>}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/founder/projects/${project.id}/applications`}
                    className="rounded-lg border border-[#1e2a3a] px-3 py-1.5 text-[13px] font-medium text-gray-300 no-underline transition-colors hover:bg-[#1e2a3a]"
                  >
                    Applications
                  </Link>
                  <Link
                    href={`/founder/projects/${project.id}`}
                    className="rounded-lg border border-[#1e2a3a] px-3 py-1.5 text-[13px] font-medium text-gray-300 no-underline transition-colors hover:bg-[#1e2a3a]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color: string
}) {
  const ringClass: Record<string, string> = {
    violet: 'from-violet-500/10', blue: 'from-blue-500/10',
    amber: 'from-amber-500/10', emerald: 'from-emerald-500/10',
  }
  return (
    <div className={`rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 bg-gradient-to-br ${ringClass[color]} to-transparent`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <div className="font-display text-3xl font-bold text-[#f0f0ff]">{value}</div>
    </div>
  )
}
