import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import ResumesCard from '@/components/workspace/ResumesCard'
import JobDescriptionEditorCard from '@/components/workspace/JobDescriptionEditorCard'
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
  const debouncedJobDescription = useDebouncedValue(
    { jobDescriptionTitle, jobDescriptionHtml, jobDescriptionText, activeJobDescriptionId },
    900,
  )

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === activeResumeId) ?? null,
    [resumes, activeResumeId],
  )
  const selectedJobDescription = useMemo(
    () => jobDescriptions.find((jobDescription) => jobDescription.id === activeJobDescriptionId) ?? null,
    [jobDescriptions, activeJobDescriptionId],
  )

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

  async function handleCreateNewJobDescription() {
    setIsSaving(true)
    try {
      const newJobDescriptionId = await createJobDescription({
        title: 'New Job Description',
        contentRich: '<p></p>',
        contentPlain: ' ',
      })
      setActiveJobDescriptionId(newJobDescriptionId)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUploadResume(file: File) {
    setIsUploading(true)
    try {
      await uploadResume(file)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRunAnalysis() {
    if (!activeResumeId || !activeJobDescriptionId) return
    setIsRunningAnalysis(true)
    try {
      const analysisRunId = await runAnalysis(activeResumeId, activeJobDescriptionId)
      navigate(`/results/${analysisRunId}`)
    } finally {
      setIsRunningAnalysis(false)
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
            <Button variant="secondary" onClick={() => void refreshAll()}>
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_300px]">
          
          {/* LEFT COLUMN: Resume Management */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Step 1</h2>
              <span className="text-xs text-white/30">{resumes.length} file{resumes.length !== 1 ? 's' : ''}</span>
            </div>
            <ResumesCard
              resumes={resumes}
              activeResumeId={activeResumeId}
              isUploading={isUploading}
              onFileUpload={(file) => void handleUploadResume(file)}
              onResumeSelect={(resumeId) => setActiveResumeId(resumeId)}
              onResumeDelete={(resumeId) => void deleteResume(resumeId)}
            />
          </section>

          {/* CENTER COLUMN: Job Description Editor + Run Button */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Step 2</h2>
              <span className="text-xs text-white/30">
                {isSaving ? 'Saving…' : selectedJobDescription ? 'Autosaves' : 'Select or create a Job Description'}
              </span>
            </div>
            
            {/* Job Description Selector Row */}
            <Card className="p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50 mb-1">Job Description</div>
                <div className="text-sm font-medium text-white truncate">
                  {selectedJobDescription?.title || 'None selected'}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  className="h-9 rounded-lg bg-[#1a2332] border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={activeJobDescriptionId || ''}
                  onChange={(e) => setActiveJobDescriptionId(e.target.value || null)}
                >
                  <option value="">Select Job Title</option>
                  {jobDescriptions.map((jobDescription) => (
                    <option key={jobDescription.id} value={jobDescription.id}>{jobDescription.title}</option>
                  ))}
                </select>
                <Button size="sm" variant="secondary" onClick={() => void handleCreateNewJobDescription()} disabled={isSaving}>
                  + New
                </Button>
              </div>
            </Card>

            {/* Job Description Editor */}
            <JobDescriptionEditorCard
              activeJobDescriptionId={activeJobDescriptionId}
              title={jobDescriptionTitle}
              onJobTitleChange={setJobDescriptionTitle}
              html={jobDescriptionHtml}
              onContentChange={(editorContent) => {
                setJobDescriptionHtml(editorContent.html)
                setJobDescriptionText(editorContent.text)
              }}
            />

            {/* Primary Action: Run ATS Score */}
            <Card className="p-4 border-indigo-500/30 bg-[#12182a]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Step 3</h2>
              </div>
              <div className="flex items-center gap-3 mb-4 text-sm">
                <div className="flex-1 rounded-lg bg-[#0d1321] border border-white/10 px-3 py-2">
                  <div className="text-xs text-white/40 mb-0.5">Resume</div>
                  <div className="text-white/80 truncate">{selectedResume?.displayName || '—'}</div>
                </div>
                <div className="text-white/30">→</div>
                <div className="flex-1 rounded-lg bg-[#0d1321] border border-white/10 px-3 py-2">
                  <div className="text-xs text-white/40 mb-0.5">Job Description</div>
                  <div className="text-white/80 truncate">{selectedJobDescription?.title || '—'}</div>
                </div>
              </div>
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={() => void handleRunAnalysis()}
                disabled={!activeResumeId || !activeJobDescriptionId || isSaving || isRunningAnalysis}
              >
                {isRunningAnalysis ? 'Analyzing…' : 'Run ATS Score'}
              </Button>
              {error ? <div className="mt-3 text-sm text-rose-400">{error}</div> : null}
            </Card>
          </section>

          {/* RIGHT COLUMN: Recent Analyses */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Results</h2>
              <span className="text-xs text-white/30">{runs.length} run{runs.length !== 1 ? 's' : ''}</span>
            </div>
            <RecentRunsCard runs={runs} onOpen={(analysisRunId) => navigate(`/results/${analysisRunId}`)} />
          </section>

        </div>
      </main>

      {loading ? <div className="fixed bottom-4 right-4"><Spinner label="Loading" /></div> : null}
    </div>
  )
}
