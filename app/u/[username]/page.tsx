import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { Globe, Link2 } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { username: string } }) {
  const supabase = await createSupabaseServerClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('username', params.username)
    .single()

  if (!user) {
    return {
      title: 'User Not Found | IBF',
    }
  }

  return {
    title: `${user.full_name} | IBF ${user.role === 'founder' ? 'Founder' : 'Student'} Profile`,
    description: `Check out ${user.full_name}'s profile on IBF, building and joining exciting new projects.`,
  }
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createSupabaseServerClient()

  // 1. Fetch user data and profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, profiles(*)')
    .eq('username', params.username)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Profile data might be an array if there's a 1-to-many relationship somehow, but safely assume single profile
  const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles

  // 2. Fetch Projects dynamically based on role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredProjects: any[] = []
  
  if (user.role === 'founder') {
    // Founders: get all public projects they own
    const { data: fProjects } = await supabase
      .from('projects')
      .select('id, title, category, tagline')
      .eq('founder_id', user.id)
      .eq('is_public', true)
      
    if (fProjects) featuredProjects = fProjects
  } else {
    // Students: get projects they are team members of
    const { data: sMembers } = await supabase
      .from('team_members')
      .select('project:projects(id, title, category, tagline)')
      .eq('user_id', user.id)

    if (sMembers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      featuredProjects = sMembers.map((tm: any) => tm.project).filter(Boolean)
    }
  }

  // Visual formatting flags
  const isFounder = user.role === 'founder'
  const initials = user.full_name ? user.full_name.charAt(0) : 'U'
  const badgeColor = isFounder ? 'bg-blue-600/20 text-[#4B9CF5] border-[#4B9CF5]/30' : 'bg-teal-600/20 text-[#1D9E75] border-[#1D9E75]/30'
  const circleColor = isFounder ? 'bg-[#4B9CF5]' : 'bg-[#1D9E75]'

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      <main className="mx-auto max-w-[800px] p-6 pb-20 pt-8 sm:p-8">
        
        {/* HEADER CARD */}
        <div className="mb-6 rounded-2xl border border-[#1e2d4a] bg-[#111827] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            
            <div className={`flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-syne text-2xl font-bold text-white shadow-inner ${user.avatar_url ? 'bg-[#1e2d4a]' : circleColor}`}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-syne text-[22px] font-bold text-[#e0e8ff]">{user.full_name}</h1>
                <span className={`rounded-full border px-2.5 py-0.5 font-dm text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                  {user.role}
                </span>
                
                {profile?.availability_status && !isFounder && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[#1e2d4a] bg-[#0C0F14] px-2.5 py-0.5 font-dm text-[11px] font-medium text-[#8899bb]">
                    <span className={`h-2 w-2 rounded-full ${
                      profile.availability_status === 'actively_looking' ? 'bg-green-500' :
                      profile.availability_status === 'open' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></span>
                    {profile.availability_status === 'actively_looking' ? 'Actively looking' :
                     profile.availability_status === 'open' ? 'Open to offers' : 'Not available'}
                  </span>
                )}
              </div>

              <div className="mt-1 font-dm text-[13px] text-[#8899bb]">
                {!isFounder && profile?.university ? `${profile.university} ${profile.grad_year ? ` '${profile.grad_year.toString().slice(-2)}` : ''}` : ''}
                {(!isFounder && profile?.university && profile?.location_city) ? ' · ' : ''}
                {profile?.location_city || ''}
              </div>

              {profile?.bio && (
                <p className="mt-3 max-w-[560px] font-dm text-sm leading-relaxed text-[#8899bb]">
                  {profile.bio}
                </p>
              )}

              {/* Portfolio Links Row */}
              <div className="mt-4 flex items-center gap-4">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#4a5a7a] transition-colors hover:text-[#4B9CF5]" aria-label={`${user.full_name}'s GitHub`}>
                    <Link2 size={16} /> GitHub
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#4a5a7a] transition-colors hover:text-[#4B9CF5]" aria-label={`${user.full_name}'s LinkedIn`}>
                    <Link2 size={16} /> LinkedIn
                  </a>
                )}
                {profile?.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#4a5a7a] transition-colors hover:text-[#4B9CF5]" aria-label={`${user.full_name}'s Website`}>
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* SKILLS SECTION */}
        {!isFounder && profile?.skills && profile.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 font-dm text-[11px] font-semibold uppercase tracking-wider text-[#4a5a7a]">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="rounded-full bg-[#1D9E75]/10 px-3 py-1 font-dm text-xs font-semibold text-[#1D9E75] border border-[#1D9E75]/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS SECTION */}
        {featuredProjects.length > 0 && (
          <div>
            <h3 className="mb-3 font-dm text-[11px] font-semibold uppercase tracking-wider text-[#4a5a7a]">Projects</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featuredProjects.map(project => (
                <Link 
                  href={`/student/discover/${project.id}`} 
                  key={project.id}
                  className="block rounded-lg border border-[#1e2d4a] bg-[#0C0F14] p-3 transition-colors hover:border-[#4B9CF5]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-syne text-[14px] font-bold text-[#e0e8ff]">{project.title}</span>
                    <span className="rounded bg-black/50 px-1.5 py-0.5 font-dm text-[9px] font-bold uppercase tracking-wider text-gray-300">
                      {project.category}
                    </span>
                  </div>
                  <p className="truncate font-dm text-[11px] text-[#8899bb]">{project.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
