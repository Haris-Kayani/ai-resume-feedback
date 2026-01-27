import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { JobDescription } from '@/stores/workspace'

export default function JobDescriptionsCard({
  jobDescriptions,
  activeJobDescriptionId,
  saving,
  onCreate,
  onSelect,
}: {
  jobDescriptions: JobDescription[]
  activeJobDescriptionId: string | null
  saving: boolean
  onCreate: () => void
  onSelect: (id: string) => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Job Descriptions</div>
        <Button size="sm" variant="secondary" onClick={onCreate} disabled={saving}>
          New
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {jobDescriptions.length === 0 ? (
          <div className="text-sm text-[#A8B3CF]">Create your first job description.</div>
        ) : (
          jobDescriptions.map((j) => (
            <button
              key={j.id}
              className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                j.id === activeJobDescriptionId ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-[#273357] hover:bg-[#111A2E]'
              }`}
              onClick={() => onSelect(j.id)}
            >
              <div className="text-sm font-medium truncate">{j.title}</div>
              <div className="text-xs text-[#A8B3CF]">Updated {new Date(j.updatedAt).toLocaleDateString()}</div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}

