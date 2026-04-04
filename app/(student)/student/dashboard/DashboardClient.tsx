'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Users, TrendingUp, X, ArrowRight, BookOpen } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { timeAgo } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardClient({
  firstName,
  completionPercent,
  missingThing,
  stats,
  applications,
  recommendedProjects
}: {
  firstName: string,
  completionPercent: number,
  missingThing: string,
  stats: { totalApps: number, acceptedApps: number, activeProjects: number },
  applications: any[],
  recommendedProjects: any[]
}) {
  const [showCompleteWidget, setShowCompleteWidget] = useState(completionPercent < 80)

  // Stagger variants for the lists/grids
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mx-auto w-full max-w-5xl space-y-12 pb-20"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants}>
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[32px] font-extrabold text-ibf-heading tracking-tight">
          Hello, {firstName}.
        </h1>
        <p className="mt-1.5 font-['Bricolage_Grotesque',sans-serif] text-[16px] font-light text-ibf-muted">
          {stats.totalApps === 0 
            ? "Start exploring projects. Your next opportunity is one application away." 
            : "Here's the latest on your applications and discovery."}
        </p>
      </motion.div>

      {/* PROFILE COMPLETENESS WIDGET */}
      <AnimatePresence>
        {showCompleteWidget && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
            className="relative rounded-2xl border border-ibf-primary-mid bg-ibf-primary-light p-6 shadow-sm overflow-hidden"
          >
            <button 
              title="Dismiss widget"
              onClick={() => setShowCompleteWidget(false)}
              className="absolute right-4 top-4 text-ibf-primary hover:text-ibf-heading transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-ibf-primary mb-3">
              Complete your profile to stand out
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="h-2.5 flex-1 rounded-full bg-ibf-primary-mid/40">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                  className="h-full rounded-full bg-ibf-primary" 
                />
              </div>
              <div className="flex-shrink-0 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-semibold text-ibf-primary">
                {completionPercent}% complete — add {missingThing}
              </div>
            </div>
            
            <div className="mt-5">
              <Link 
                href="/student/profile/edit"
                className="inline-flex items-center gap-1 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-primary hover:text-ibf-heading transition-colors"
              >
                Complete profile <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS ROW */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: FileText, label: 'Applications Sent', value: stats.totalApps, color: 'text-ibf-secondary', bg: 'bg-ibf-secondary-light' },
          { icon: Users, label: 'Accepted', value: stats.acceptedApps, color: 'text-ibf-success', bg: 'bg-ibf-success-light' },
          { icon: TrendingUp, label: 'Projects Active', value: stats.activeProjects, color: 'text-ibf-primary', bg: 'bg-ibf-primary-light' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-interactive"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-[10px] p-2 ${stat.bg}`}><stat.icon size={18} className={stat.color} /></div>
              <span className="label capitalize text-[12px] m-0">{stat.label}</span>
            </div>
            <div className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-extrabold text-ibf-heading">{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* RECOMMENDED PROJECTS */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[20px] font-bold text-ibf-heading">Recommended for you</h2>
            <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-light text-ibf-muted">Based on your skills</p>
          </div>
          <Link href="/student/discover" className="hidden sm:flex items-center gap-1 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-secondary hover:text-ibf-heading transition-colors">
            View Discovery <ArrowRight size={14} />
          </Link>
        </div>
        
        {recommendedProjects.length === 0 ? (
          <div className="empty-state border border-ibf-border rounded-2xl bg-ibf-surface">
            <div className="empty-state-icon bg-ibf-secondary-light/50"><BookOpen size={28} className="text-ibf-secondary" /></div>
            <p className="empty-state-title">No personalized recommendations yet</p>
            <p className="empty-state-text">Add more skills to your profile to get projects tailored for you.</p>
            <Link href="/student/profile/edit" className="btn-primary mt-2">
              Edit Profile
            </Link>
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-6 pt-2 snap-x px-1 -mx-1" style={{ scrollbarWidth: 'none' }}>
            {recommendedProjects.map((proj: any, idx) => (
              <motion.div 
                key={proj.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.1, type: "spring" }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="min-w-[300px] w-[300px] snap-start flex-shrink-0 cursor-pointer overflow-hidden rounded-[18px] border border-ibf-border bg-white shadow-sm transition hover:shadow-xl group"
              >
                <div className="h-[140px] w-full relative bg-ibf-surface overflow-hidden">
                  {proj.cover_image_url && (
                    <Image src={proj.cover_image_url} alt={proj.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ibf-heading/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-4">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 font-['Bricolage_Grotesque',sans-serif] text-[11px] font-bold text-ibf-secondary shadow-sm">
                      {proj.matchCount}/{proj.totalRequired} skills match
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between h-[150px]">
                  <div>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-ibf-heading line-clamp-1">{proj.title}</h3>
                    <p className="mt-1.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-body line-clamp-2 leading-relaxed">
                      {proj.tagline}
                    </p>
                  </div>
                  <Link href={`/student/discover/${proj.id}`} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-ibf-secondary/30 bg-ibf-secondary-light/30 px-3 py-2 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-secondary transition-colors hover:bg-ibf-secondary hover:text-ibf-heading">
                    Apply Now <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* MY APPLICATIONS */}
      <motion.div variants={itemVariants}>
        <div className="mb-5">
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[20px] font-bold text-ibf-heading">Recent activity</h2>
        </div>
        
        {applications.length === 0 ? (
          <div className="empty-state border border-ibf-border rounded-2xl bg-ibf-surface">
            <p className="empty-state-text">You haven't sent any applications yet.</p>
            <Link href="/student/discover" className="btn-primary mt-2">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.slice(0, 3).map((app: any) => {
              const role = app.roles 
              const project = role?.projects
              
              return (
                <motion.div 
                  key={app.id} 
                  whileHover={{ x: 4, backgroundColor: 'var(--color-ibf-surface)' }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[16px] border border-ibf-border bg-white p-5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ibf-secondary-light/50 border border-ibf-secondary/10">
                      <FileText size={20} className="text-ibf-secondary" />
                    </div>
                    <div>
                      <h4 className="font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-ibf-heading">{project?.title || 'Unknown Project'}</h4>
                      <p className="font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-muted mt-0.5">
                        {role?.title || 'Unknown Role'} <span className="mx-1.5 text-ibf-border-2">•</span> {timeAgo(app.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <StatusBadge status={app.status} />
                  </div>
                </motion.div>
              )
            })}
            
            <div className="mt-4 text-center sm:text-left">
              <Link href="/student/applications" className="inline-flex items-center gap-1.5 font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-secondary hover:text-ibf-heading transition-colors group">
                <span className="border-b-2 border-transparent group-hover:border-ibf-heading transition-colors pb-0.5">View all applications</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>

    </motion.div>
  )
}
