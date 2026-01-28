import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { JobDescription } from '@/stores/workspace'

export default function JobDescriptionsCard({
  jobDescriptions,
  activeJobDescriptionId,
  isSaving,
  onCreateJobDescription,
  onJobDescriptionSelect,
}: {
  jobDescriptions: JobDescription[]
  activeJobDescriptionId: string | null
  isSaving: boolean
  onCreateJobDescription: () => void
  onJobDescriptionSelect: (id: string) => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Job Descriptions</div>
        <Button size="sm" variant="secondary" onClick={onCreateJobDescription} disabled={isSaving}>
          New
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {jobDescriptions.length === 0 ? (
          <div className="text-sm text-[#A8B3CF]">Create your first job description.</div>
        ) : (
          jobDescriptions.map((jobDescription) => (
            <button
              key={jobDescription.id}
              className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                jobDescription.id === activeJobDescriptionId ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-[#273357] hover:bg-[#111A2E]'
              }`}
              onClick={() => onJobDescriptionSelect(jobDescription.id)}
            >
              <div className="text-sm font-medium truncate">{jobDescription.title}</div>
              <div className="text-xs text-[#A8B3CF]">Updated {new Date(jobDescription.updatedAt).toLocaleDateString()}</div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}

