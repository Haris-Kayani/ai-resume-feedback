import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { Resume } from '@/stores/workspace'

export default function ResumesCard({
  resumes,
  activeResumeId,
  isUploading,
  onUpload,
  onSelect,
  onDelete,
}: {
  resumes: Resume[]
  activeResumeId: string | null
  isUploading: boolean
  onUpload: (file: File) => void
  onSelect: (resumeId: string) => void
  onDelete: (resumeId: string) => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white">Your Resumes</div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) onUpload(selectedFile)
              e.currentTarget.value = ''
            }}
          />
          <Button type="button" size="sm" disabled={isUploading}>
            {isUploading ? 'Uploading…' : '+ Upload'}
          </Button>
        </label>
      </div>
      <div className="space-y-2">
        {resumes.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/40">
            Upload a PDF or DOCX to get started
          </div>
        ) : (
          resumes.map((resume) => (
            <button
              key={resume.id}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                resume.id === activeResumeId 
                  ? 'border-indigo-500/50 bg-indigo-500/10' 
                  : 'border-white/10 hover:bg-white/5'
              }`}
              onClick={() => onSelect(resume.id)}
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
                    onDelete(resume.id)
                  }}
                >
                  Remove
                </button>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}

