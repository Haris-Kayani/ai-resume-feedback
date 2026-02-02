import Button from '@/components/ui/Button'
import type { Resume } from '@/stores/workspace'

export default function ResumesCard({
  resumes,
  activeResumeId,
  isUploading,
  onFileUpload,
  onResumeSelect,
  onResumeDelete,
}: {
  resumes: Resume[]
  activeResumeId: string | null
  isUploading: boolean
  onFileUpload: (file: File) => void
  onResumeSelect: (resumeId: string) => void
  onResumeDelete: (resumeId: string) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/80">Your Resumes</div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) onFileUpload(selectedFile)
              e.currentTarget.value = ''
            }}
          />
          <span className={`inline-flex items-center justify-center h-8 px-3 text-sm rounded-lg font-medium transition-colors ${
            isUploading 
              ? 'bg-indigo-600 text-white opacity-50 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer'
          }`}>
            {isUploading ? 'Uploading…' : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Upload</span>
              </span>
            )}
          </span>
        </label>
      </div>
      <div className="space-y-2">
        {resumes.length === 0 ? (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) onFileUpload(selectedFile)
                e.currentTarget.value = ''
              }}
            />
            <div className="border-2 border-dashed border-white/20 rounded-lg py-8 px-4 text-center hover:border-white/30 transition-colors">
              <svg className="w-8 h-8 mx-auto mb-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <div className="text-sm text-white/60 mb-1">Upload a PDF or DOCX to get started</div>
              <div className="text-xs text-white/40">or drag and drop your resume here</div>
            </div>
          </label>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                resume.id === activeResumeId 
                  ? 'border-indigo-500/50 bg-indigo-500/10' 
                  : 'border-white/10 hover:bg-white/5'
              }`}
              onClick={() => onResumeSelect(resume.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onResumeSelect(resume.id)
                }
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-white truncate flex-1">{resume.displayName}</div>
                <span className="text-[10px] font-medium uppercase text-white/40 bg-white/10 px-1.5 py-0.5 rounded">{resume.fileType}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="text-xs text-white/40">{new Date(resume.createdAt).toLocaleDateString()}</div>
                <button
                  type="button"
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResumeDelete(resume.id)
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

