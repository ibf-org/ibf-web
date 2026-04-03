'use client'

import { useState } from 'react'
import { Send, X } from 'lucide-react'

interface Props {
  projectId: string
  projectTitle: string
  roleId: string
  roleTitle: string
  studentId: string
}

export default function ApplyModal({ projectId, projectTitle, roleId, roleTitle, studentId }: Props) {
  const [open, setOpen] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, projectId, coverNote }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit application')
        return
      }
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)} style={{ flexShrink: 0, fontSize: '13px', padding: '8px 16px' }}>
        Apply Now
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="modal">
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: '#f0f0ff', margin: '0 0 8px' }}>Application Submitted!</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>The founder will review your application and get back to you.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: '#f0f0ff', margin: '0 0 4px' }}>Apply for {roleTitle}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{projectTitle}</p>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }} title="Close" aria-label="Close application modal">
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="label">
                    Cover Note <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional, max 500 chars)</span>
                  </label>
                  <textarea
                    className="textarea"
                    value={coverNote}
                    onChange={e => setCoverNote(e.target.value.slice(0, 500))}
                    placeholder="Tell the founder why you're a great fit for this role. What skills do you bring? What excites you about this project?"
                    style={{ minHeight: '120px' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: coverNote.length > 450 ? '#f59e0b' : '#6b7280', marginTop: '4px' }}>
                    {coverNote.length}/500
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-ghost" onClick={() => setOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button className="btn-primary" onClick={handleApply} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                    {loading ? 'Submitting...' : <><Send size={14} /> Submit Application</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
