'use client'

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import Select from 'react-select'
import { Camera, Trash2, Plus, Globe, Save, Loader2, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'

export const AVAILABLE_SKILLS = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'FastAPI', 
  'Flutter', 'Swift', 'Kotlin', 'UI/UX Design', 'Figma', 'Framer', 
  'Data Analysis', 'SQL', 'Machine Learning', 'Product Management', 
  'Growth Marketing', 'Content Writing', 'DevOps', 'AWS', 'Firebase', 
  'Business Development', 'TypeScript', 'Next.js', 'GraphQL'
].map(s => ({ value: s, label: s }))

const YEARS = Array.from({ length: 8 }, (_, i) => ({
  value: (2024 + i).toString(),
  label: (2024 + i).toString()
})).concat({ value: 'Already graduated', label: 'Already graduated' })

interface ProfileData {
  full_name: string
  avatar_url: string | null
  bio: string | null
  university: string | null
  grad_year: number | string | null
  city: string | null
  skills: string[] | null
  availability_status: string | null
  github_url: string | null
  linkedin_url: string | null
  website_url: string | null
  featured_projects: { title: string, url: string, description: string }[] | null
}

interface ProfileEditorClientProps {
  userId: string
  initialData: any
}

export default function ProfileEditorClient({ userId, initialData }: ProfileEditorClientProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'portfolio'>('basics')
  const [data, setData] = useState<ProfileData>({
    full_name: initialData.full_name || '',
    avatar_url: initialData.avatar_url || null,
    bio: initialData.bio || '',
    university: initialData.university || '',
    grad_year: initialData.grad_year || '',
    city: initialData.city || '',
    skills: initialData.skills || [],
    availability_status: initialData.availability_status || '',
    github_url: initialData.github_url || '',
    linkedin_url: initialData.linkedin_url || '',
    website_url: initialData.website_url || '',
    featured_projects: initialData.featured_projects || []
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // -- LIVE COMPLETENESS CALCULATION --
  const completeness = useMemo(() => {
    let score = 0
    if (data.avatar_url) score += 20
    if (data.bio?.trim()) score += 10
    if (data.skills && data.skills.length > 0) score += 20
    if (data.university?.trim()) score += 15
    if (data.github_url || data.linkedin_url || data.website_url) score += 20
    if (data.availability_status) score += 15
    return Math.min(100, score)
  }, [data])

  // -- HANDLERS --
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle avatar upload via Supabase storage
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'avatars')
      formData.append('fileName', filePath)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await res.json()

      if (!res.ok) throw new Error(uploadData.error || 'Upload failed')
      const publicUrl = uploadData.url

      setData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Avatar uploaded!')
    } catch (err: any) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [userId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  })

  // Handle featured projects
  const addProjectRow = () => {
    setData(prev => ({
      ...prev,
      featured_projects: [...(prev.featured_projects || []), { title: '', url: '', description: '' }]
    }))
  }

  const updateProjectRow = (index: number, field: string, value: string) => {
    const newProjects = [...(data.featured_projects || [])]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setData(prev => ({ ...prev, featured_projects: newProjects }))
  }

  const removeProjectRow = (index: number) => {
    setData(prev => ({
      ...prev,
      featured_projects: (prev.featured_projects || []).filter((_, i) => i !== index)
    }))
  }

  // Handle Save
  const onSave = async () => {
    setIsSaving(true)
    try {
      // Clean up featured projects (remove empties)
      const cleanProjects = (data.featured_projects || []).filter(p => p.title.trim() || p.description.trim() || p.url.trim())
      
      const payload = {
        ...data,
        featured_projects: cleanProjects.length > 0 ? cleanProjects : null
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save profile')
      toast.success('Profile saved successfully!')
      setData(prev => ({ ...prev, featured_projects: cleanProjects }))
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pb-24 lg:p-8 lg:pb-24">
      {/* Header & Completeness */}
      <div className="mb-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-[#f0f0ff]">Edit your profile</h1>
        
        <div className="rounded-xl border border-ibf-border bg-ibf-surface p-5">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#f0f0ff]">
            <span>Profile {completeness}% complete</span>
            {completeness === 100 && <span className="text-teal-400">All set! 🎉</span>}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-ibf-surface">
            { }
            { }
            <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${completeness}%` }} aria-label="Profile Progress" />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-8 flex gap-2 border-b border-ibf-border pb-px">
        {[
          { id: 'basics', label: '1. Basics' },
          { id: 'skills', label: '2. Skills & Availability' },
          { id: 'portfolio', label: '3. Portfolio' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'border-teal-500 text-teal-400' 
                : 'border-transparent text-ibf-hint hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-12">
        {/* TAB 1: BASICS */}
        {activeTab === 'basics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Avatar Dropzone */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div 
                {...getRootProps()} 
                className={`group relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-[#0d0d1a] transition-all ${
                  isDragActive ? 'border-teal-500 bg-teal-500/10' : 'border-ibf-border hover:border-teal-500/50'
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <Loader2 className="animate-spin text-teal-500" size={24} />
                ) : data.avatar_url ? (
                  <>
                    <Image src={data.avatar_url} alt="Avatar" width={112} height={112} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-ibf-bg/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera size={24} className="text-ibf-heading" />
                    </div>
                  </>
                ) : (
                  <Camera size={28} className="text-ibf-hint transition-colors group-hover:text-teal-400" />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="mb-1 text-sm font-semibold text-[#f0f0ff]">Profile Picture</h3>
                <p className="text-xs text-ibf-hint">Upload a square image, ideally 400x400px. Click or drag & drop.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">Full Name</label>
                <input 
                  name="full_name"
                  value={data.full_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ibf-border bg-ibf-surface px-4 py-2.5 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wider text-ibf-hint">
                  <span>Bio</span>
                  <span className={((data.bio || '').length > 280) ? 'text-red-400' : 'text-gray-600'}>{(data.bio || '').length}/280</span>
                </label>
                <textarea 
                  name="bio"
                  value={data.bio || ''}
                  onChange={handleChange}
                  maxLength={280}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-ibf-border bg-ibf-surface px-4 py-2.5 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Tell founders what you're about in 2-3 sentences"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">University</label>
                <input 
                  name="university"
                  value={data.university || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ibf-border bg-ibf-surface px-4 py-2.5 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Stanford University"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">Grad Year</label>
                <select 
                  title="Graduation Year"
                  name="grad_year"
                  value={data.grad_year?.toString() || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ibf-border bg-ibf-surface px-4 py-2.5 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="" disabled>Select year...</option>
                  {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">City (Optional)</label>
                <input 
                  name="city"
                  value={data.city || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ibf-border bg-ibf-surface px-4 py-2.5 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS & AVAILABILITY */}
        {activeTab === 'skills' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wider text-ibf-hint">
                <span>Core Skills</span>
                <span>{(data.skills || []).length}/10 Max</span>
              </label>
              <Select
                isMulti
                options={AVAILABLE_SKILLS}
                value={(data.skills || []).map(s => ({ value: s, label: s }))}
                onChange={(newValue) => {
                  if (newValue.length <= 10) {
                    setData(prev => ({ ...prev, skills: newValue.map(v => v.value) }))
                  }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select up to 10 skills..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: '#111827',
                    borderColor: state.isFocused ? '#1D9E75' : '#1e1e3a',
                    padding: '2px',
                    borderRadius: '0.5rem',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#1D9E75' }
                  }),
                  menu: base => ({ ...base, backgroundColor: '#111827', border: '1px solid #1e1e3a' }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? '#1e1e3a' : 'transparent',
                    color: '#f0f0ff',
                    '&:active': { backgroundColor: '#1D9E75' }
                  }),
                  multiValue: base => ({ ...base, backgroundColor: 'rgba(29, 158, 117, 0.1)', border: '1px solid rgba(29, 158, 117, 0.3)', borderRadius: '4px' }),
                  multiValueLabel: base => ({ ...base, color: '#1D9E75' }),
                  multiValueRemove: base => ({ ...base, color: '#1D9E75', ':hover': { backgroundColor: '#1D9E75', color: 'white' } }),
                  input: base => ({ ...base, color: '#f0f0ff' })
                }}
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">Availability</label>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'Actively Looking', desc: 'Ready to join a project now', dot: 'bg-emerald-500', border: 'emerald' },
                  { id: 'Open to Opportunities', desc: 'Casually browsing', dot: 'bg-yellow-500', border: 'yellow' },
                  { id: 'Not Available', desc: 'Busy right now', dot: 'bg-gray-500', border: 'gray' },
                ].map(opt => {
                  const isSelected = data.availability_status === opt.id
                  return (
                    <label 
                      key={opt.id} 
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        isSelected ? `border-teal-500 bg-teal-500/10` : 'border-ibf-border bg-ibf-surface hover:border-[#2a2a4a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${opt.dot} ring-4 ring-[#0d0d1a] shadow-sm`} />
                        <div>
                          <div className={`font-semibold ${isSelected ? 'text-[#f0f0ff]' : 'text-gray-300'}`}>{opt.id}</div>
                          <div className="text-xs text-ibf-hint">{opt.desc}</div>
                        </div>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-teal-500' : 'border-ibf-border'}`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />}
                      </div>
                      <input 
                        type="radio" 
                        name="availability_status" 
                        value={opt.id} 
                        checked={isSelected}
                        onChange={handleChange}
                        className="hidden" 
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">GitHub Profile</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-ibf-hint" size={16} />
                  <input 
                    name="github_url" value={data.github_url || ''} onChange={handleChange}
                    className="w-full rounded-lg border border-ibf-border bg-ibf-surface py-2.5 pl-11 pr-4 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">LinkedIn Profile</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-ibf-hint" size={16} />
                  <input 
                    name="linkedin_url" value={data.linkedin_url || ''} onChange={handleChange}
                    className="w-full rounded-lg border border-ibf-border bg-ibf-surface py-2.5 pl-11 pr-4 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ibf-hint">Personal Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-ibf-hint" size={16} />
                  <input 
                    name="website_url" value={data.website_url || ''} onChange={handleChange}
                    className="w-full rounded-lg border border-ibf-border bg-ibf-surface py-2.5 pl-11 pr-4 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-ibf-border pt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ibf-hint">Featured Projects</h3>
                <button onClick={addProjectRow} disabled={(data.featured_projects?.length || 0) >= 3} className="flex items-center gap-1.5 rounded-lg bg-ibf-surface px-3 py-1.5 text-xs font-medium text-teal-400 hover:bg-ibf-surface disabled:opacity-50">
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {!data.featured_projects?.length && (
                  <p className="text-sm text-ibf-hint italic">No featured projects added. Add up to 3 to highlight your work.</p>
                )}
                
                {data.featured_projects?.map((proj, idx) => (
                  <div key={idx} className="relative rounded-xl border border-ibf-border bg-ibf-surface p-4">
                    <button onClick={() => removeProjectRow(idx)} aria-label="Remove Project" className="absolute right-3 top-3 text-ibf-hint hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-ibf-hint">Project Name</label>
                        <input 
                          value={proj.title} onChange={e => updateProjectRow(idx, 'title', e.target.value)}
                          className="w-full rounded-lg border border-ibf-border bg-[#0d0d1a] px-3 py-2 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none"
                          placeholder="Awesome App"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-ibf-hint">Project URL</label>
                        <input 
                          value={proj.url} onChange={e => updateProjectRow(idx, 'url', e.target.value)}
                          className="w-full rounded-lg border border-ibf-border bg-[#0d0d1a] px-3 py-2 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold tracking-wider text-ibf-hint">Short Description</label>
                        <textarea 
                          value={proj.description} onChange={e => updateProjectRow(idx, 'description', e.target.value)}
                          maxLength={150} rows={2}
                          className="w-full resize-none rounded-lg border border-ibf-border bg-[#0d0d1a] px-3 py-2 text-sm text-[#f0f0ff] focus:border-teal-500 focus:outline-none"
                          placeholder="Built with Next.js and Supabase..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-ibf-border bg-ibf-bg/90 px-6 py-4 backdrop-blur-xl lg:pl-[284px]">
        <div className="text-sm font-medium text-ibf-muted">
          Unsaved changes will be lost if you leave.
        </div>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-bold text-ibf-heading shadow-lg shadow-teal-500/20 transition hover:bg-teal-600 active:scale-[0.98] disabled:opacity-70"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

    </div>
  )
}
