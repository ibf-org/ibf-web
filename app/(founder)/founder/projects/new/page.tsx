'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabaseBrowser } from '@/lib/supabase'
import { Upload, X, Loader2 } from 'lucide-react'

const CATEGORIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'Marketplace', 'Social', 'Climate', 'Gaming', 'Other']
const STAGES = [
  { id: 'Idea', label: 'Idea', desc: 'Exploring concepts' },
  { id: 'MVP', label: 'MVP', desc: 'Building first version' },
  { id: 'Early Traction', label: 'Early Traction', desc: 'Initial users/revenue' },
  { id: 'Growth', label: 'Growth', desc: 'Scaling up' }
]

export default function NewProjectPage() {
  const router = useRouter()
  const { userId: clerkId } = useAuth()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('')
  const [category, setCategory] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const step1Valid = title.trim() && tagline.trim() && description.trim() && stage && category

  const handleSubmit = async () => {
    if (!clerkId) return setErrorMsg('Not authenticated')
    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Get internal user ID
      const { data: userData, error: userError } = await supabaseBrowser
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single()

      if (userError || !userData) throw new Error('Could not verify user identity')
      const founderId = userData.id

      // 2. Upload image if exists
      let coverImageUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${founderId}_${Date.now()}.${fileExt}`
        const uploadFD = new FormData()
        uploadFD.append('file', imageFile)
        uploadFD.append('bucket', 'project-covers')
        uploadFD.append('fileName', fileName)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFD })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error('Image upload failed: ' + (uploadData.error || 'Unknown error'))
        coverImageUrl = uploadData.url
      }

      // 3. Insert Project
      const { data: newProject, error: insertError } = await supabaseBrowser
        .from('projects')
        .insert({
          founder_id: founderId,
          title,
          tagline,
          description,
          stage,
          category,
          website_url: websiteUrl || null,
          cover_image_url: coverImageUrl,
          is_public: isPublic,
          status: 'open'
        })
        .select('id')
        .single()

      if (insertError) throw new Error(insertError.message)

      // 4. Redirect to role creation
      router.push(`/founder/projects/${newProject.id}/roles`)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0C0F14] p-4 md:p-8">
      <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-[#1e2d4a] bg-[#111827] p-6 md:p-8 shadow-xl">
        
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between font-dm text-xs text-[#4a5a7a]">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? 'Project details' : 'Media & Settings'}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e2d4a]">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        <h1 className="mb-6 font-syne text-2xl font-bold text-white">
          {step === 1 ? 'Post a new project' : 'Final details'}
        </h1>

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="font-dm text-sm font-medium text-[#e0e8ff]">Project name</label>
                <span className="font-dm text-xs text-[#4a5a7a]">{title.length}/80</span>
              </div>
              <input
                maxLength={80}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Innovators Bridge Foundry"
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between">
                <label className="font-dm text-sm font-medium text-[#e0e8ff]">Tagline</label>
                <span className="font-dm text-xs text-[#4a5a7a]">{tagline.length}/140</span>
              </div>
              <input
                maxLength={140}
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="A short, catchy description..."
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-dm text-sm font-medium text-[#e0e8ff]">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your project and what you're building..."
                className="min-h-[160px] w-full resize-y rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-dm text-sm font-medium text-[#e0e8ff]">Category</label>
                <select
                  title="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-dm text-sm font-medium text-[#e0e8ff]">Stage</label>
              <div className="grid grid-cols-2 gap-3">
                {STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                      stage === s.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-[#1e2d4a] bg-[#0C0F14] hover:border-[#2a3f65]'
                    }`}
                  >
                    <span className={`font-syne text-sm font-semibold ${stage === s.id ? 'text-blue-400' : 'text-[#e0e8ff]'}`}>{s.label}</span>
                    <span className="mt-0.5 font-dm text-xs text-[#8899bb]">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="mt-6 w-full rounded-lg bg-blue-600 h-12 text-sm font-semibold text-white transition-opacity hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-dm text-sm font-medium text-[#e0e8ff]">Cover Image</label>
              {imagePreview ? (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#1e2d4a]">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button 
                    title="Remove image preview"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1e2d4a] bg-[#0C0F14] transition-colors hover:border-[#2a3f65]">
                  <Upload className="mb-2 text-[#4a5a7a]" size={24} />
                  <span className="font-dm text-sm text-[#8899bb]">Click to upload an image</span>
                  <span className="mt-1 font-dm text-xs text-[#4a5a7a]">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-dm text-sm font-medium text-[#e0e8ff]">Website URL (Optional)</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-[#1e2d4a] bg-[#0C0F14] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-dm text-sm font-medium text-[#e0e8ff]">Visibility</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    isPublic ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-[#1e2d4a] bg-[#0C0F14] text-[#8899bb] hover:border-[#2a3f65]'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    !isPublic ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-[#1e2d4a] bg-[#0C0F14] text-[#8899bb] hover:border-[#2a3f65]'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 rounded-lg border border-[#1e2d4a] h-[52px] text-sm font-semibold text-[#e0e8ff] hover:bg-[#1e2d4a]"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex justify-center items-center rounded-lg bg-blue-600 h-[52px] text-sm font-semibold text-white transition-opacity hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Post project'}
              </button>
            </div>
            
            {errorMsg && (
              <p className="mt-2 text-center text-sm text-red-400">{errorMsg}</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
