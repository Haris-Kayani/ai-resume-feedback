import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import ResumesCard from '@/components/workspace/ResumesCard'
import RecentRunsCard from '@/components/workspace/RecentRunsCard'

export default function Workspace() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const {
    resumes,
    jobDescriptions,
    runs,
    activeResumeId,
    activeJobDescriptionId,
    setActiveResumeId,
    setActiveJobDescriptionId,
    refreshAll,
    uploadResume,
    deleteResume,
    loadJobDescription,
    createJobDescription,
    updateJobDescription,
    deleteJobDescription,
    runAnalysis,
    loading,
    error,
  } = useWorkspaceStore()

  const [jobDescriptionTitle, setJobDescriptionTitle] = useState('')
  const [jobDescriptionHtml, setJobDescriptionHtml] = useState('<p></p>')
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [jobDescriptionToDelete, setJobDescriptionToDelete] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const jobDescriptionValue = useMemo(
    () => ({
      jobDescriptionTitle,
      jobDescriptionHtml,
      jobDescriptionText,
      activeJobDescriptionId,
    }),
    [jobDescriptionTitle, jobDescriptionHtml, jobDescriptionText, activeJobDescriptionId],
  )

  const debouncedJobDescription = useDebouncedValue(jobDescriptionValue, 900)

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (!activeJobDescriptionId) return
    void (async () => {
      const loadedJobDescription = await loadJobDescription(activeJobDescriptionId)
      setJobDescriptionTitle(loadedJobDescription.title || '')
      setJobDescriptionHtml(loadedJobDescription.contentRich || '<p></p>')
      setJobDescriptionText(loadedJobDescription.contentPlain || '')
    })()
  }, [activeJobDescriptionId, loadJobDescription])

  useEffect(() => {
    const jobDescriptionId = debouncedJobDescription.activeJobDescriptionId
    if (!jobDescriptionId) return
    if (!debouncedJobDescription.jobDescriptionTitle || !debouncedJobDescription.jobDescriptionText.trim()) return
    void (async () => {
      setIsSaving(true)
      try {
        await updateJobDescription(jobDescriptionId, {
          title: debouncedJobDescription.jobDescriptionTitle,
          contentRich: debouncedJobDescription.jobDescriptionHtml,
          contentPlain: debouncedJobDescription.jobDescriptionText,
        })
      } finally {
        setIsSaving(false)
      }
    })()
  }, [debouncedJobDescription, updateJobDescription])

  async function handleUploadResume(file: File) {
    setIsUploading(true)
    try {
      await uploadResume(file)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRunAnalysis() {
    console.log('Run Analysis clicked', {
      activeResumeId,
      activeJobDescriptionId,
      resumesCount: resumes.length,
      jobDescriptionsCount: jobDescriptions.length,
    })

    if (!activeResumeId || !activeJobDescriptionId) {
      console.warn('Cannot run analysis - missing required IDs')
      return
    }

    setIsRunningAnalysis(true)
    try {
      const analysisRunId = await runAnalysis(activeResumeId, activeJobDescriptionId)
      console.log('Analysis completed successfully, navigating to results:', analysisRunId)
      navigate(`/results/${analysisRunId}`)
    } catch (error) {
      console.error('Analysis failed:', error)
      setIsRunningAnalysis(false)
    }
  }

  async function handleDeleteJobDescription(id: string) {
    setIsDeleting(true)
    try {
      await deleteJobDescription(id)
      setJobDescriptionToDelete(null)
      if (activeJobDescriptionId === id) {
        setJobDescriptionText('')
        setJobDescriptionHtml('<p></p>')
        setJobDescriptionTitle('')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleCreateNewJobDescriptionFromForm() {
    if (!newJobTitle.trim() || !newJobDescription.trim()) {
      return
    }
    
    if (newJobTitle.length > 160) {
      return
    }

    setIsSaving(true)
    try {
      const plainText = newJobDescription.trim()
      const newJobDescriptionId = await createJobDescription({
        title: newJobTitle.trim(),
        contentRich: `<p>${plainText}</p>`,
        contentPlain: plainText,
      })
      setActiveJobDescriptionId(newJobDescriptionId)
      // Set local state immediately so the button becomes enabled
      setJobDescriptionTitle(newJobTitle.trim())
      setJobDescriptionText(plainText)
      setJobDescriptionHtml(`<p>${plainText}</p>`)
      setShowAddForm(false)
      setNewJobTitle('')
      setNewJobDescription('')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1321]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/title.avif" alt="Resume Fix" className="h-7 w-7 rounded-lg" />
            <div>
              <div className="text-base font-semibold text-white">Resume Fix</div>
              <div className="text-xs text-white/50">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => void refreshAll()} className="hidden sm:inline-flex">
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => void refreshAll()} className="sm:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
            <Button variant="secondary" onClick={() => void logout()}>
              <span className="hidden sm:inline">Sign out</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Center Hero + Right Sidebar */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:border-r border-b lg:border-b-0 border-white/10 bg-[#0d1321] p-4 space-y-6 overflow-y-auto max-h-[60vh] lg:max-h-none">
          
          {/* STEP 1: Resumes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Step 1</span>
            </div>
            <ResumesCard
              resumes={resumes}
              activeResumeId={activeResumeId}
              isUploading={isUploading}
              onFileUpload={(file) => void handleUploadResume(file)}
              onResumeSelect={(resumeId) => setActiveResumeId(resumeId)}
              onResumeDelete={(resumeId) => void deleteResume(resumeId)}
            />
          </div>

          {/* STEP 2: Job Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Step 2</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Job Description</div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <select
                  className="w-full h-9 rounded-lg bg-[#1a2332] border border-white/10 pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={activeJobDescriptionId || ''}
                  onChange={(e) => setActiveJobDescriptionId(e.target.value || null)}
                  aria-label="Select job description"
                >
                  <option value="">New Job Description</option>
                  {jobDescriptions.map((jobDescription) => (
                    <option key={jobDescription.id} value={jobDescription.id}>{jobDescription.title}</option>
                  ))}
                </select>
                {activeJobDescriptionId && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-rose-400 transition-colors p-1"
                    onClick={() => setJobDescriptionToDelete(activeJobDescriptionId)}
                    title="Delete selected job description"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(!showAddForm)
                  if (showAddForm) {
                    setNewJobTitle('')
                    setNewJobDescription('')
                  }
                }} 
                disabled={isSaving}
              >
                {showAddForm ? '−' : '+'}
              </Button>
            </div>

            {/* Inline Add Form */}
            {showAddForm && (
              <div className="mb-3 p-3 rounded-lg bg-[#1a2332] border border-white/10 space-y-2">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Job Title</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded bg-[#0d1321] border border-white/10 px-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., Senior Software Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    maxLength={160}
                  />
                  <div className="text-xs text-white/30 mt-1">{newJobTitle.length}/160</div>
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Job Description</label>
                  <textarea
                    className="w-full h-32 rounded bg-[#0d1321] border border-white/10 px-2 py-1.5 text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Paste or type the job description here..."
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleCreateNewJobDescriptionFromForm()}
                    disabled={!newJobTitle.trim() || !newJobDescription.trim() || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Adding...' : 'Add Job Description'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewJobTitle('')
                      setNewJobDescription('')
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <textarea
              className="w-full h-48 rounded-lg bg-[#1a2332] border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Paste the job description here..."
              value={jobDescriptionText}
              onChange={(e) => {
                setJobDescriptionText(e.target.value)
                setJobDescriptionHtml(`<p>${e.target.value}</p>`)
              }}
            />
          </div>
        </aside>

        {/* CENTER: Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          {/* Play Button */}
          <button
            onClick={() => void handleRunAnalysis()}
            disabled={!activeResumeId || !activeJobDescriptionId || isSaving || isRunningAnalysis}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-6 sm:mb-8 transition-colors"
            aria-label="Run Analysis"
            title={
              !activeResumeId 
                ? 'Please upload and select a resume first' 
                : !activeJobDescriptionId 
                ? 'Please create or select a job description' 
                : 'Click to run analysis'
            }
          >
            {isRunningAnalysis ? (
              <Spinner />
            ) : (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Status message when button is disabled */}
          {(!activeResumeId || !activeJobDescriptionId) && (
            <div className="mb-4 text-sm text-amber-400/80 text-center px-4">
              {!activeResumeId && !activeJobDescriptionId 
                ? '📋 Upload a resume and add a job description to begin'
                : !activeResumeId 
                ? '📄 Upload and select a resume to continue'
                : '📝 Add or select a job description to continue'
              }
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center px-4">Ready to Optimize Your Resume?</h1>
          <p className="text-sm sm:text-base text-white/60 text-center max-w-md mb-6 sm:mb-10 px-4">
            Upload your resume and paste the job description to get a comprehensive ATS analysis with actionable recommendations.
          </p>

          {/* Stats Cards */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-2xl px-4">
            <div className="bg-[#1a2332] border border-white/10 rounded-xl px-6 sm:px-8 py-4 sm:py-5 text-center flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-1">{resumes.length}</div>
              <div className="text-xs sm:text-sm text-white/60">Resumes Uploaded</div>
            </div>
            <div className="bg-[#1a2332] border border-white/10 rounded-xl px-6 sm:px-8 py-4 sm:py-5 text-center flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-1">{jobDescriptions.length}</div>
              <div className="text-xs sm:text-sm text-white/60">Job Descriptions</div>
            </div>
            <div className="bg-[#1a2332] border border-white/10 rounded-xl px-6 sm:px-8 py-4 sm:py-5 text-center flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-400 mb-1">{runs.length}</div>
              <div className="text-xs sm:text-sm text-white/60">Analyses Run</div>
            </div>
          </div>

          {error ? <div className="mt-6 text-sm text-rose-400">{error}</div> : null}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:border-l border-t lg:border-t-0 border-white/10 bg-[#0d1321] p-4 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <RecentRunsCard runs={runs} onOpen={(analysisRunId) => navigate(`/results/${analysisRunId}`)} />
        </aside>

      </div>

      {loading ? <div className="fixed bottom-4 right-4"><Spinner label="Loading" /></div> : null}
      
      {/* Delete Confirmation Dialog */}
      {jobDescriptionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1321] border border-white/10 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Job Description?</h3>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete this job description? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setJobDescriptionToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleDeleteJobDescription(jobDescriptionToDelete)}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
