'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import { Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FounderProfileEditPage() {
  const { userId: clerkId } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [internalUserId, setInternalUserId] = useState('')

  // State: Basics
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')

  // State: Social Link
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

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

        // Load profile (founders share profiles table or we can just fetch what's there)
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single()

        if (profile) {
          setBio(profile.bio || '')
          setCity(profile.location_city || '')
          setLinkedinUrl(profile.linkedin_url || '')
          setWebsiteUrl(profile.website_url || '')
        }
      }
      setLoading(false)
    }
    loadData()
  }, [clerkId])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      let finalAvatarUrl = avatarUrl
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${internalUserId}_${Date.now()}.${fileExt}`
        
        const uploadFormData = new FormData()
        uploadFormData.append('file', avatarFile)
        uploadFormData.append('bucket', 'avatars')
        uploadFormData.append('fileName', fileName)

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        const uploadData = await uploadRes.json()
        
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload photo')
        finalAvatarUrl = uploadData.url
      }

      await supabaseBrowser
        .from('users')
        .update({ full_name: fullName, avatar_url: finalAvatarUrl })
        .eq('id', internalUserId)

      const profileData: any = {
        user_id: internalUserId,
        bio,
        location_city: city,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
      }
      
      const { error: profileError } = await supabaseBrowser
        .from('profiles')
        .upsert(profileData)

      if (profileError) throw profileError

      toast.success('Founder profile updated!')
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
    <div className="flex flex-col text-ibf-body font-sans animate-in fade-in max-w-3xl">
      <h2 className="text-3xl font-extrabold text-ibf-heading mb-2">Edit Founder Profile</h2>
      <p className="text-ibf-muted mb-8">Update your personal details so students know who they are working with.</p>

      <div className="space-y-8 bg-ibf-surface border border-ibf-border p-8 rounded-[24px] shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ibf-border bg-white transition-colors hover:border-ibf-primary">
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
            <h3 className="font-sans text-sm font-semibold text-ibf-heading">Profile Picture</h3>
            <p className="mt-1 font-sans text-xs text-ibf-muted">Upload a professional avatar.</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block font-sans text-[13px] font-semibold text-ibf-heading">Full Name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-xl border border-ibf-border bg-white px-4 py-3 font-sans text-sm text-ibf-body focus:border-ibf-primary focus:outline-none focus:ring-1 focus:ring-ibf-primary transition-all shadow-sm"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="mb-2 block font-sans text-[13px] font-semibold text-ibf-heading">Bio</label>
          <textarea
            maxLength={280}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="min-h-[120px] w-full resize-y rounded-xl border border-ibf-border bg-white px-4 py-3 font-sans text-sm text-ibf-body focus:border-ibf-primary focus:outline-none focus:ring-1 focus:ring-ibf-primary transition-all shadow-sm"
            placeholder="Introduce yourself to the community..."
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block font-sans text-[13px] font-semibold text-ibf-heading">City / Location</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full rounded-xl border border-ibf-border bg-white px-4 py-3 font-sans text-sm text-ibf-body focus:border-ibf-primary focus:outline-none focus:ring-1 focus:ring-ibf-primary transition-all shadow-sm"
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block font-sans text-[13px] font-semibold text-ibf-heading">LinkedIn URL</label>
            <input
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              className="w-full rounded-xl border border-ibf-border bg-white px-4 py-3 font-sans text-sm text-ibf-body focus:border-ibf-primary focus:outline-none focus:ring-1 focus:ring-ibf-primary transition-all shadow-sm"
              placeholder="https://linkedin.com/..."
            />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[13px] font-semibold text-ibf-heading">Personal Website</label>
            <input
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              className="w-full rounded-xl border border-ibf-border bg-white px-4 py-3 font-sans text-sm text-ibf-body focus:border-ibf-primary focus:outline-none focus:ring-1 focus:ring-ibf-primary transition-all shadow-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-ibf-primary px-8 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-ibf-primary-mid disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save Founder Profile
        </button>
      </div>
    </div>
  )
}

function avatarPreview(file: File | null, url: string) {
  if (file) return URL.createObjectURL(file)
  return url || undefined
}
