'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import { Upload, X, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const QUICK_SKILLS = ['React', 'Node.js', 'Python', 'Figma', 'Flutter', 'ML/AI', 'SQL', 'Marketing']
const AVAILABILITIES = [
  { id: 'actively_looking', label: 'Actively Looking', color: 'bg-green-500' },
  { id: 'open', label: 'Open', color: 'bg-yellow-500' },
  { id: 'not_available', label: 'Not Available', color: 'bg-gray-500' }
]

export default function StudentProfileEditPage() {
  const { userId: clerkId } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'portfolio'>('basics')
  const [internalUserId, setInternalUserId] = useState('')

  // State: Basics
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [university, setUniversity] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [city, setCity] = useState('')

  // State: Skills
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [availability, setAvailability] = useState('actively_looking')

  // State: Portfolio
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [featuredProjects, setFeaturedProjects] = useState<{title: string, url: string}[]>([])

  useEffect(() => {
    async function loadData() {
      if (!clerkId) return

      // Load user
      const { data: userData } = await supabaseBrowser
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single()

      if (userData) {
        setInternalUserId(userData.id)
        setFullName(userData.full_name || '')
        setAvatarUrl(userData.avatar_url || '')

        // Load profile
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single()

        if (profile) {
          setBio(profile.bio || '')
          setUniversity(profile.university || '')
          setGradYear(profile.grad_year?.toString() || '')
          setCity(profile.location_city || '')
          setSkills(profile.skills || [])
          setAvailability(profile.availability_status || 'actively_looking')
          setGithubUrl(profile.github_url || '')
          setLinkedinUrl(profile.linkedin_url || '')
          setWebsiteUrl(profile.website_url || '')
          
          // Using any trick for featured_projects (assuming column might exist or we just store empty local if it fails mapping)
          if ((profile as any).featured_projects) {
            setFeaturedProjects((profile as any).featured_projects)
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [clerkId])

  // Completeness Formula: avatar +20, bio +15, skills≥3 +20, university +15, grad_year +10, one portfolio link +20 = 100%
  let completeness = 0
  if (avatarUrl || avatarFile) completeness += 20
  if (bio?.trim().length > 10) completeness += 15
  if (skills.length >= 3) completeness += 20
  if (university?.trim()) completeness += 15
  if (gradYear) completeness += 10
  if (githubUrl || linkedinUrl || websiteUrl) completeness += 20

  const handleAddSkill = (s: string) => {
    const term = s.trim()
    if (term && !skills.includes(term) && skills.length < 10) {
      setSkills([...skills, term])
    }
    setSkillInput('')
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${internalUserId}_${Date.now()}.${fileExt}`
        const uploadFD = new FormData()
        uploadFD.append('file', avatarFile)
        uploadFD.append('bucket', 'avatars')
        uploadFD.append('fileName', fileName)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFD })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload avatar')
        finalAvatarUrl = uploadData.url
      }

      // 2. Update Users table
      await supabaseBrowser
        .from('users')
        .update({ full_name: fullName, avatar_url: finalAvatarUrl })
        .eq('id', internalUserId)

      // 3. Update Profiles table
      const profileData: any = {
        user_id: internalUserId,
        bio,
        university,
        grad_year: gradYear ? parseInt(gradYear) : null,
        location_city: city,
        skills,
        availability_status: availability,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
        featured_projects: featuredProjects
      }
      
      const { error: profileError } = await supabaseBrowser
        .from('profiles')
        .upsert(profileData)

      // Fallback: If DB throws error because featured_projects doesn't exist, we fallback
      if (profileError && profileError.message.includes('featured_projects')) {
           delete profileData.featured_projects
           const { error: fallbackError } = await supabaseBrowser.from('profiles').upsert(profileData)
           if (fallbackError) throw fallbackError
      } else if (profileError) {
           throw profileError
      }

      toast.success('Changes saved')
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-ibf-bg"><Loader2 size={32} className="animate-spin text-ibf-primary" /></div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-ibf-bg text-ibf-heading">
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-4xl mx-auto w-full mb-20">
        
        {/* COMPLETENESS WIDGET */}
        <div className="mb-8 rounded-xl border border-ibf-border bg-white p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-dm text-sm font-semibold text-ibf-muted tracking-wide uppercase">Profile Completeness</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-syne text-4xl font-bold text-ibf-heading">{completeness}%</span>
                {completeness === 100 && <span className="font-dm text-sm text-ibf-primary font-bold">Awesome! You're all set.</span>}
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1e2d4a]">
            <div 
              className="h-full bg-ibf-primary transition-all duration-500 ease-in-out"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-6 border-b border-ibf-border font-dm text-sm font-medium">
          {([{id:'basics', label:'Basics'}, {id:'skills', label:'Skills & Availability'}, {id:'portfolio', label:'Portfolio'}]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-[#1D9E75] text-ibf-heading' 
                  : 'border-transparent text-ibf-muted hover:text-ibf-muted'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-6">
          {activeTab === 'basics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-6">
                <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ibf-border bg-ibf-bg transition-colors hover:border-ibf-primary">
                  {avatarPreview(avatarFile, avatarUrl) ? (
                    <img src={avatarPreview(avatarFile, avatarUrl)} className="h-full w-full object-cover" alt="Avatar" />
                  ) : (
                    <Upload size={24} className="text-ibf-muted" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setAvatarFile(file)
                  }} />
                </label>
                <div>
                  <h3 className="font-dm text-sm font-semibold text-ibf-heading">Profile Picture</h3>
                  <p className="mt-1 font-dm text-xs text-ibf-muted">Upload a professional avatar to stand out.</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">Full Name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  aria-label="Full Name"
                />
              </div>

              <div>
                <label className="mb-2 flex justify-between font-dm text-sm font-medium text-ibf-heading">
                  <span>Bio</span>
                  <span className="text-ibf-muted">{bio.length}/280</span>
                </label>
                <textarea
                  maxLength={280}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  placeholder="Tell founders a little about yourself..."
                  aria-label="Bio"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">University</label>
                  <input
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                    aria-label="University"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">Graduation Year</label>
                  <select
                    value={gradYear}
                    onChange={e => setGradYear(e.target.value)}
                    className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                    aria-label="Graduation Year"
                  >
                    <option value="">Select year</option>
                    {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">City / Timezone</label>
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  placeholder="e.g. San Francisco, CA"
                  aria-label="City"
                />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h3 className="mb-4 font-syne text-lg font-bold text-ibf-heading">Your Skills</h3>
                <div className="mb-3 flex flex-wrap gap-2">
                  {skills.map(s => (
                    <div key={s} className="flex items-center gap-1.5 rounded-full bg-ibf-primary/10 px-3 py-1 font-dm text-xs font-semibold text-ibf-primary border border-[#1D9E75]/20">
                      {s}
                      <button onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-ibf-heading" aria-label={`Remove skill ${s}`}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(skillInput)
                    }
                  }}
                  disabled={skills.length >= 10}
                  placeholder={skills.length >= 10 ? "Maximum 10 skills reached" : "Type a skill and press Enter"}
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none disabled:opacity-50"
                  aria-label="Add Skill Input"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="py-1 pr-2 font-dm text-xs text-ibf-muted">Quick Add:</span>
                  {QUICK_SKILLS.filter(qs => !skills.includes(qs)).map(qs => (
                    <button
                      key={qs}
                      onClick={() => handleAddSkill(qs)}
                      className="rounded-md border border-ibf-border bg-ibf-bg px-2 py-1 font-dm text-xs text-ibf-muted transition-colors hover:border-ibf-primary hover:text-ibf-primary"
                      aria-label={`Add quick skill ${qs}`}
                    >
                      + {qs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-ibf-border">
                <h3 className="mb-4 font-syne text-lg font-bold text-ibf-heading">Availability</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {AVAILABILITIES.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAvailability(opt.id)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-colors ${
                        availability === opt.id ? 'border-[#1D9E75] bg-ibf-primary/5' : 'border-ibf-border bg-white hover:border-[#2a3f65]'
                      }`}
                      aria-label={`Select availability ${opt.label}`}
                    >
                      <div className={`h-3 w-3 rounded-full ${opt.color}`}></div>
                      <span className={`font-dm text-sm font-semibold ${availability === opt.id ? 'text-ibf-heading' : 'text-ibf-muted'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">GitHub URL</label>
                <input
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  aria-label="GitHub URL"
                />
              </div>

              <div>
                <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">LinkedIn URL</label>
                <input
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  aria-label="LinkedIn URL"
                />
              </div>

              <div>
                <label className="mb-2 block font-dm text-sm font-medium text-ibf-heading">Personal Website</label>
                <input
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                  aria-label="Personal Website"
                />
              </div>

              <div className="pt-4 border-t border-ibf-border">
                <h3 className="mb-4 font-syne text-lg font-bold text-ibf-heading">Featured Projects</h3>
                <p className="mb-4 font-dm text-xs text-ibf-muted">Add up to 3 projects from your portfolio that you are proud of.</p>
                
                <div className="space-y-3">
                  {featuredProjects.map((proj, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3">
                      <input
                        value={proj.title}
                        onChange={e => setFeaturedProjects(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                        placeholder="Project Title"
                        className="flex-1 rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                        aria-label={`Featured Project ${idx + 1} Title`}
                      />
                      <div className="flex flex-1 gap-2">
                        <input
                          value={proj.url}
                          onChange={e => setFeaturedProjects(prev => prev.map((p, i) => i === idx ? { ...p, url: e.target.value } : p))}
                          placeholder="Project URL"
                          className="flex-1 rounded-lg border border-ibf-border bg-white px-4 py-2.5 font-dm text-sm text-ibf-heading focus:border-ibf-primary focus:outline-none"
                          aria-label={`Featured Project ${idx + 1} URL`}
                        />
                        <button 
                          onClick={() => setFeaturedProjects(prev => prev.filter((_, i) => i !== idx))}
                          className="flex w-10 items-center justify-center rounded-lg border border-ibf-border bg-white text-ibf-muted hover:border-red-500 hover:text-red-500 transition-colors"
                          aria-label={`Remove featured project ${idx + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {featuredProjects.length < 3 && (
                    <button
                      onClick={() => setFeaturedProjects([...featuredProjects, { title: '', url: '' }])}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ibf-border py-3 font-dm text-sm font-medium text-ibf-muted transition-colors hover:border-ibf-primary hover:text-ibf-primary"
                      aria-label="Add Featured Project row"
                    >
                      <Plus size={16} /> Add featured project
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-ibf-border bg-white/90 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-ibf-primary px-8 py-2.5 font-dm text-sm font-bold text-black transition-colors hover:bg-[#15825f] disabled:opacity-50"
            aria-label="Save profile changes"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function avatarPreview(file: File | null, url: string) {
  if (file) return URL.createObjectURL(file)
  return url || undefined
}
