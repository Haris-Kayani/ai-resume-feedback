import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export type DiffResult = {
  baseRunId: string
  compareRunId: string
  scoreDelta: number
  metricDeltas: Record<string, number>
  unifiedDiff: string
}

export default function DiffCard({
  compareRunId,
  onCompareRunIdChange,
  compareOptions,
  isLoading,
  diffResult,
  onComputeDiff,
}: {
  compareRunId: string
  onCompareRunIdChange: (id: string) => void
  compareOptions: Array<{ id: string; overallScore: number }>
  isLoading: boolean
  diffResult: DiffResult | null
  onComputeDiff: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Diff (resume text)</div>
          <div className="text-xs text-[#A8B3CF]">Compare this run to another run</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-[10px] bg-[#111A2E] border border-[#273357] px-3 text-sm"
            value={compareRunId}
            onChange={(e) => onCompareRunIdChange(e.target.value)}
          >
            <option value="">Select run to compare</option>
            {compareOptions.map((run) => (
              <option key={run.id} value={run.id}>
                {run.id.slice(0, 8)}… • score {run.overallScore}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={onComputeDiff} disabled={!compareRunId || isLoading}>
            Compute
          </Button>
        </div>
      </div>

      {diffResult ? (
        <div className="mt-3">
          <div className="text-xs text-[#A8B3CF]">Score delta: {diffResult.scoreDelta >= 0 ? `+${diffResult.scoreDelta}` : diffResult.scoreDelta}</div>
          <pre className="mt-2 max-h-[420px] overflow-auto rounded-lg border border-[#273357] bg-[#0B1220] p-3 text-xs leading-5">
            {diffResult.unifiedDiff}
          </pre>
        </div>
      ) : (
        <div className="mt-3 text-sm text-[#A8B3CF]">Select another run and compute diff.</div>
      )}
    </Card>
  )
}

