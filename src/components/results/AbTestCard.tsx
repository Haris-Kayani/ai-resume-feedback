import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AbTestCard({
  experimentName,
  onExperimentNameChange,
  compareRunId,
  onCompareRunIdChange,
  compareOptions,
  isLoading,
  abTestResult,
  onRunExperiment,
}: {
  experimentName: string
  onExperimentNameChange: (value: string) => void
  compareRunId: string
  onCompareRunIdChange: (id: string) => void
  compareOptions: Array<{ id: string; overallScore: number }>
  isLoading: boolean
  abTestResult: {
    scoreDelta: number
    a: { runId: string; overallScore: number; metrics: Record<string, number> }
    b: { runId: string; overallScore: number; metrics: Record<string, number> }
  } | null
  onRunExperiment: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">A/B test</div>
          <div className="text-xs text-[#A8B3CF]">Compare two runs against the same job description</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-10 w-[160px] rounded-[10px] bg-[#111A2E] border border-[#273357] px-3 text-sm"
            value={experimentName}
            onChange={(e) => onExperimentNameChange(e.target.value)}
          />
          <select
            className="h-10 rounded-[10px] bg-[#111A2E] border border-[#273357] px-3 text-sm"
            value={compareRunId}
            onChange={(e) => onCompareRunIdChange(e.target.value)}
          >
            <option value="">Select variant run (B)</option>
            {compareOptions.map((run) => (
              <option key={run.id} value={run.id}>
                {run.id.slice(0, 8)}… • score {run.overallScore}
              </option>
            ))}
          </select>
          <Button onClick={onRunExperiment} disabled={!compareRunId || isLoading}>
            Run
          </Button>
        </div>
      </div>

      {abTestResult ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#273357] bg-[#111A2E] p-3">
            <div className="text-xs text-[#A8B3CF]">Variant A</div>
            <div className="text-lg font-semibold">{abTestResult.a.overallScore}</div>
          </div>
          <div className="rounded-lg border border-[#273357] bg-[#111A2E] p-3">
            <div className="text-xs text-[#A8B3CF]">Variant B</div>
            <div className="text-lg font-semibold">{abTestResult.b.overallScore}</div>
          </div>
          <div className="md:col-span-2 text-sm text-[#A8B3CF]">
            Score delta (B − A): {abTestResult.scoreDelta >= 0 ? `+${abTestResult.scoreDelta}` : abTestResult.scoreDelta}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-[#A8B3CF]">Pick a B run and run the comparison.</div>
      )}
    </Card>
  )
}
