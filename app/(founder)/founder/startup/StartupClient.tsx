'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Upload, Image as ImageIcon, Link2, Users, Calendar, 
  MapPin, Eye, ExternalLink, X, Plus, Save, Loader2, CheckCircle2, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'
import { upsertStartupProfile } from './actions'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const STAGES = ['Idea', 'MVP', 'Early Traction', 'Growth']
const TEAM_SIZES = ['Just me', '2–5', '5–10', '10+']
const QUICK_SKILLS = ['React', 'Node.js', 'Python', 'Design', 'Marketing', 'ML/AI', 'DevOps', 'Business']

export default function StartupClient({ founderId, initialStartup }: { founderId: string, initialStartup: any }) {
  const [showPreview, setShowPreview] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: initialStartup?.name || '',
    tagline: initialStartup?.tagline || '',
    description: initialStartup?.description || '',
    stage: initialStartup?.stage || '',
    category: initialStartup?.category || '',
    website_url: initialStartup?.website_url || '',
    twitter_url: initialStartup?.twitter_url || '',
    linkedin_url: initialStartup?.linkedin_url || '',
    logo_url: initialStartup?.logo_url || '',
    founded_year: initialStartup?.founded_year || new Date().getFullYear(),
    team_size: initialStartup?.team_size || '',
    looking_for: initialStartup?.looking_for || [],
    is_public: initialStartup?.is_public ?? true
  })

  // Tag Input State
  const [skillInput, setSkillInput] = useState('')

  // Parallax Setup
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 80])

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    const toastId = toast.loading('Uploading logo...')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${founderId}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}.${fileExt}`
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'startup-logos')
      formData.append('fileName', fileName)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await res.json()
      
      if (!res.ok) throw new Error(uploadData.error || 'Failed to upload')
      const publicUrl = uploadData.url

      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      toast.success('Logo uploaded!', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to upload logo', { id: toastId })
    }
  }

  const handleAddSkill = (skill: string) => {
    const s = skill.trim()
    if (!s) return
    if (formData.looking_for.includes(s)) return
    if (formData.looking_for.length >= 10) {
      toast.error('Maximum 10 skills allowed')
      return
    }
    setFormData(prev => ({ ...prev, looking_for: [...prev.looking_for, s] }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.filter((s: string) => s !== skillToRemove)
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Startup name is required')
      return
    }

    setIsSaving(true)
    const res = await upsertStartupProfile(founderId, formData)
    setIsSaving(false)

    if (res.success) {
      toast.success('Startup profile saved successfully')
    } else {
      toast.error('Failed to save profile: ' + res.error)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32" ref={containerRef}>
      {/* LEFT COLUMN: EDIT FORM */}
      <motion.div 
        className={`flex-1 transition-all ${showPreview ? 'lg:max-w-[60%]' : 'w-full'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[28px] font-extrabold text-ibf-heading">
            My Startup
          </h1>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 rounded-lg bg-ibf-surface px-3 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-medium text-ibf-body transition-colors hover:bg-ibf-border lg:hidden xl:flex"
          >
            <Eye size={16} /> 
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <div className="space-y-10">
          
          {/* Section 1: Identity */}
          <section className="space-y-6">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[18px] font-bold text-ibf-heading">Identity</h2>
            
            <div className="flex items-center gap-6">
              <label htmlFor="logo-upload" className="group relative flex h-[80px] w-[80px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ibf-border bg-ibf-bg transition-colors hover:border-ibf-primary">
                {formData.logo_url ? (
                  <Image src={formData.logo_url} alt="Logo" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-ibf-muted">
                    <Upload size={24} />
                  </div>
                )}
                <div className="absolute inset-0 hidden items-center justify-center bg-ibf-bg/40 group-hover:flex">
                  <ImageIcon className="text-ibf-heading" size={20} />
                </div>
                <input 
                  type="file" 
                  id="logo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
              </label>
              <div className="flex-1">
                <p className="font-['Bricolage_Grotesque',sans-serif] text-[15px] font-semibold text-ibf-heading">Startup Logo</p>
                <p className="font-['Bricolage_Grotesque',sans-serif] text-[13px] text-ibf-muted">Upload a square image, max 5MB.</p>
              </div>
            </div>

            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="What do you call it?"
                className="w-full border-0 border-b-2 border-ibf-border bg-transparent pb-2 font-['Bricolage_Grotesque',sans-serif] text-[24px] font-bold text-ibf-heading focus:border-ibf-primary focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
            
            <div>
              <input
                type="text"
                name="tagline"
                maxLength={140}
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="One sentence that makes people lean in."
                className="w-full border-0 border-b-2 border-ibf-border bg-transparent pb-2 font-['Instrument_Serif',serif] italic text-[18px] italic text-ibf-heading focus:border-ibf-primary focus:outline-none focus:ring-0 transition-colors"
                style={{ fontFamily: 'Instrument Serif, serif' }}
              />
              <div className="mt-1 text-right font-['Bricolage_Grotesque',sans-serif] text-[11px] text-ibf-muted">{formData.tagline.length}/140</div>
            </div>

            <div>
              <label className="label">Category / Vertical</label>
              <select
                title="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="select"
              >
                <option value="">Select category...</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthtech">Healthtech</option>
                <option value="Edtech">Edtech</option>
                <option value="SaaS">SaaS</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Consumer">Consumer</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Climate">Climate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>

          <hr className="border-ibf-border" />

          {/* Section 2: Your Story */}
          <section className="space-y-4">
            <div>
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[18px] font-bold text-ibf-heading">Your Story</h2>
              <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-light text-ibf-muted">Tell students why this matters.</p>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What problem are you solving? Why now? Why you? What have you built so far?"
              className="textarea"
            />
          </section>

          <hr className="border-ibf-border" />

          {/* Section 3: Details */}
          <section className="space-y-6">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[18px] font-bold text-ibf-heading">Details</h2>
            
            <div>
              <label className="label">Current Stage</label>
              <div className="flex flex-wrap gap-3">
                {STAGES.map(stage => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, stage }))}
                    className={`rounded-full px-4 py-2 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-medium transition-colors ${
                      formData.stage === stage
                        ? 'bg-ibf-heading text-ibf-heading border border-ibf-heading'
                        : 'bg-white text-ibf-body border border-ibf-border hover:border-ibf-primary hover:bg-ibf-surface'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Founded Year</label>
                <input
                  type="number"
                  name="founded_year"
                  value={formData.founded_year}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Team Size</label>
                <select
                  title="Team size"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleInputChange}
                  className="select"
                >
                  <option value="">Select size...</option>
                  {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">External Links</label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-ibf-muted"><Link2 size={16} /></div>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="input pl-10"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-ibf-muted"><Link2 size={16} /></div>
                  <input
                    type="url"
                    title="Twitter"
                    name="twitter_url"
                    value={formData.twitter_url}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/startup"
                    className="input pl-10"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-ibf-muted"><Link2 size={16} /></div>
                  <input
                    type="url"
                    title="LinkedIn"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/company/startup"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-ibf-border" />

          {/* Section 4: Looking for */}
          <section className="space-y-6">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[18px] font-bold text-ibf-heading">What you're looking for</h2>
            
            <div>
              <label className="label">Skills you need on your team</label>
              
              <div className="flex w-full flex-wrap gap-2 rounded-xl border border-ibf-border bg-white p-2 focus-within:border-ibf-primary focus-within:ring-1 focus-within:ring-ibf-primary transition-all">
                <AnimatePresence>
                  {formData.looking_for.map((skill: string) => (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      layout
                      key={skill} 
                      className="flex items-center gap-1.5 rounded-lg bg-ibf-surface px-2.5 py-1.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-medium text-ibf-body border border-ibf-border-2"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-ibf-muted hover:text-ibf-danger">
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(skillInput)
                    }
                  }}
                  disabled={formData.looking_for.length >= 10}
                  placeholder={formData.looking_for.length < 10 ? "Type a skill & drop 'Enter'" : "Limit reached (10)"}
                  className="flex-1 bg-transparent min-w-[150px] p-1.5 font-['Bricolage_Grotesque',sans-serif] text-[14px] text-ibf-heading focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    disabled={formData.looking_for.includes(skill) || formData.looking_for.length >= 10}
                    className="flex items-center gap-1 rounded bg-white border border-ibf-border px-2 py-1 font-['Bricolage_Grotesque',sans-serif] text-[11px] font-medium text-ibf-muted hover:border-ibf-primary hover:text-ibf-heading hover:bg-ibf-surface disabled:opacity-40 transition-colors"
                  >
                    <Plus size={10} /> {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white border border-ibf-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <input 
                title="Make public"
                type="checkbox" 
                id="is_public" 
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-gray-300 text-ibf-primary focus:ring-ibf-primary"
              />
              <label htmlFor="is_public" className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-medium text-ibf-heading cursor-pointer select-none">
                Make startup profile public
              </label>
              <span className="ml-auto font-['Bricolage_Grotesque',sans-serif] text-[12px] text-ibf-muted">Shows on student discovery</span>
            </div>
          </section>

        </div>
      </motion.div>

      {/* RIGHT COLUMN: PREVIEW CARD (Animated) */}
      {showPreview && (
        <div className="hidden lg:block lg:w-[40%]">
          <motion.div 
            className="sticky top-24"
            style={{ y: parallaxY }} // Parallax effect
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
          >
            <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[16px] font-bold text-ibf-heading mb-4 flex items-center gap-2">
              <Eye size={16} className="text-ibf-muted"/> Live Interactive Preview
            </h3>
            
            {/* The Live Interactive Card representing Student Discovery */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="overflow-hidden rounded-[20px] bg-white shadow-[0_12px_40px_rgb(26,18,8,0.08)] border border-ibf-border group"
            >
              <div className="border-b border-ibf-border p-6 pb-5 relative overflow-hidden bg-ibf-surface">
                <div className="absolute inset-0 bg-gradient-to-br from-ibf-primary-light/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start justify-between z-10">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      className="h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-[14px] border border-ibf-border-2 bg-white shadow-sm"
                    >
                      {formData.logo_url ? (
                        <Image src={formData.logo_url} alt="Logo" width={64} height={64} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-ibf-primary bg-ibf-primary-light">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </motion.div>
                    <div>
                      <h4 className="font-['Bricolage_Grotesque',sans-serif] text-[20px] font-extrabold text-ibf-heading">
                        {formData.name || 'Startup Name'}
                      </h4>
                      {formData.category && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="badge badge-gray">
                            {formData.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-ibf-success/20 bg-ibf-success-light/50 px-2.5 py-1">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="h-1.5 w-1.5 rounded-full bg-ibf-success"
                    />
                    <span className="font-['Bricolage_Grotesque',sans-serif] text-[10px] font-bold uppercase tracking-wider text-ibf-success">Building</span>
                  </div>
                </div>

                <div className="relative mt-5 z-10">
                  <p className="font-['Instrument_Serif',serif] italic text-[22px] italic leading-tight text-ibf-heading font-['Instrument_Serif',serif] italic-italic">
                    "{formData.tagline || 'A brilliant vision awaiting a compelling hook.'}"
                  </p>
                </div>
              </div>

              <div className="p-6 pb-4">
                <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-light leading-relaxed text-ibf-body">
                  {formData.description ? (
                    formData.description.length > 120 ? formData.description.substring(0, 120) + '...' : formData.description
                  ) : (
                    'This startup is working on something exciting but hasn’t shared the details yet.'
                  )}
                </p>

                <div className="mt-6 flex items-center gap-5 border-t border-ibf-border pt-5">
                  <div className="flex flex-col">
                    <span className="label">Stage</span>
                    <span className="mt-0.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-semibold text-ibf-heading">{formData.stage || '—'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="label">Team</span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-semibold text-ibf-heading">
                      <Users size={14} className="text-ibf-primary" /> {formData.team_size || '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="label">Founded</span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-semibold text-ibf-heading">
                      <Calendar size={14} className="text-ibf-primary" /> {formData.founded_year || '—'}
                    </span>
                  </div>
                </div>

                {formData.looking_for.length > 0 && (
                  <div className="mt-5">
                    <span className="label">Seeking Skills</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {formData.looking_for.map((skill: string) => (
                        <span key={skill} className="skill-tag text-[11px] px-2 py-1 bg-ibf-surface border-ibf-border-2 text-ibf-body">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-ibf-border bg-ibf-surface px-6 py-4">
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.1, y: -2 }} title="Website" className="text-ibf-muted hover:text-ibf-primary transition-colors"><Link2 size={18} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1, y: -2 }} title="Twitter" className="text-ibf-muted hover:text-ibf-primary transition-colors"><Link2 size={18} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1, y: -2 }} title="LinkedIn" className="text-ibf-muted hover:text-ibf-primary transition-colors"><Link2 size={18} /></motion.button>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  title="View Page" 
                  className="flex items-center gap-1 rounded-xl bg-ibf-heading px-4 py-2 font-['Bricolage_Grotesque',sans-serif] text-[13px] font-bold text-ibf-heading hover:bg-ibf-bg transition-colors shadow-sm"
                >
                  View Details <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>
            {/* End Preview Card */}
          </motion.div>
        </div>
      )}

      {/* STICKY SAVE BAR */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-ibf-border bg-white/90 backdrop-blur-md px-6 py-4 shadow-[0_-4px_20px_rgb(26,18,8,0.05)] lg:pl-[284px]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
             <p className="font-['Bricolage_Grotesque',sans-serif] text-[14px] font-bold text-ibf-heading">Save Startup Profile</p>
             <p className="font-['Bricolage_Grotesque',sans-serif] text-[12px] text-ibf-muted">Changes will be live instantly across IBF.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save & Publish
          </button>
        </div>
      </motion.div>
    </div>
  )
}
