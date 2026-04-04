import Image from 'next/image'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

interface ProjectCardProps {
  id: string
  title: string
  tagline: string
  category: string
  stage: string
  coverImageUrl?: string | null
  founderName: string
  founderAvatar?: string | null
  openRolesCount: number
  skills?: string[]
  status?: string
  href?: string
}

const categoryEmoji: Record<string, string> = {
  Fintech: '💰', Edtech: '📚', Healthtech: '🏥', SaaS: '⚡', Marketplace: '🛍️', Social: '💬',
}

export default function ProjectCard({
  id, title, tagline, category, stage, coverImageUrl, founderName, founderAvatar, openRolesCount, skills, status, href
}: ProjectCardProps) {
  const link = href || `/student/discover/${id}`

  return (
    <Link href={link} className="no-underline">
      <div className="card overflow-hidden p-0 cursor-pointer group transition-colors">
        {/* Cover image */}
        <div className="relative h-[140px] overflow-hidden bg-ibf-surface card-interactive">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt={title} fill className="object-cover hover-zoom-img" placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNEYxRUEiLz48L3N2Zz4=" />
          ) : (
            <div className="flex h-full w-full items-center justify-center hover-zoom-img transition-transform">
              <span className="text-5xl opacity-80">
                {categoryEmoji[category] || '🚀'}
              </span>
            </div>
          )}
          {/* Status badge */}
          {status && (
            <div className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-ibf-heading shadow-sm ${
              status === 'open' ? 'bg-ibf-success' : status === 'paused' ? 'bg-amber-500' : 'bg-gray-500'
            }`}>
              {status}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category + Stage */}
          <div className="mb-3 flex gap-2">
            <span className="badge badge-founder">{category}</span>
            <span className="badge badge-student">{stage}</span>
          </div>

          <h3 className="m-0 mb-1.5 font-['Bricolage_Grotesque',sans-serif] text-[18px] font-bold leading-snug text-ibf-heading">{title}</h3>
          <p className="m-0 mb-4 line-clamp-2 text-[14px] leading-relaxed text-ibf-body">{tagline}</p>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map(s => <span key={s} className="skill-tag px-2 py-1 bg-ibf-surface border-ibf-border-2 text-ibf-body text-[11px]">{s}</span>)}
              {skills.length > 3 && <span className="text-[11px] text-ibf-muted flex items-center font-semibold">+{skills.length - 3}</span>}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-ibf-border pt-4">
            <div className="flex items-center gap-2.5">
              {founderAvatar ? (
                <Image src={founderAvatar} alt={founderName} width={26} height={26} className="rounded-full object-cover border border-ibf-border" />
              ) : (
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ibf-primary-light text-[11px] font-bold text-ibf-primary">
                  {founderName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[13px] font-semibold text-ibf-heading">{founderName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ibf-muted bg-ibf-surface-2 px-2 py-1 rounded-md">
              <Briefcase size={14} />
              <span>{openRolesCount} role{openRolesCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
